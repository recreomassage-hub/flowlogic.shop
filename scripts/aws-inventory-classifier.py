#!/usr/bin/env python3
"""
AWS Inventory Classifier
Classifies AWS resources based on infrastructure-spec.yaml rules
"""

import json
import sys
import yaml
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
import argparse

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
INFRA_SPEC = PROJECT_ROOT / "infrastructure" / "infrastructure-spec.yaml"
INVENTORY_CONFIG = PROJECT_ROOT / "infrastructure" / "aws-inventory-config.yaml"


def load_yaml(path: Path) -> dict:
    """Load YAML file."""
    try:
        with open(path, 'r') as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        print(f"ERROR: File not found: {path}", file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"ERROR: YAML parse error in {path}: {e}", file=sys.stderr)
        sys.exit(1)


def classify_resource(resource: dict, spec: dict, config: dict) -> dict:
    """
    Classify a single resource based on spec and config.
    
    Returns classification with:
    - env: prod/staging/dev/untagged
    - category: expired/cost_zombie/untagged/non_compliant/compliant
    - violations: list of violations
    - compliant: boolean
    """
    tags = {tag['Key']: tag['Value'] for tag in resource.get('Tags', [])}
    resource_type = resource.get('ResourceType', '') or ''
    resource_name = resource.get('ResourceName', '') or ''
    resource_arn = resource.get('ResourceARN', '') or resource.get('arn', '') or ''
    
    # Fallback: extract name from ARN if not provided
    if not resource_name and resource_arn:
        arn_parts = resource_arn.split(':')
        if len(arn_parts) > 0:
            resource_name = arn_parts[-1] or ''
    
    classification = {
        'arn': resource_arn,
        'type': resource_type,
        'name': resource_name,
        'env': 'untagged',
        'category': 'compliant',
        'violations': [],
        'compliant': True,
        'expires_at': None,
        'requires_action': False
    }
    
    # Detect environment from tags
    env_tag = tags.get('Env', '').lower()
    if env_tag in ['prod', 'production']:
        classification['env'] = 'prod'
    elif env_tag in ['staging', 'stage']:
        classification['env'] = 'staging'
    elif env_tag in ['dev', 'development']:
        classification['env'] = 'dev'
    else:
        # Try to infer from naming convention
        if 'flowlogic-prod-' in resource_name or 'flowlogic-production-' in resource_name:
            classification['env'] = 'prod'
        elif 'flowlogic-staging-' in resource_name or 'flowlogic-stage-' in resource_name:
            classification['env'] = 'staging'
        elif 'flowlogic-dev-' in resource_name or 'flowlogic-development-' in resource_name:
            classification['env'] = 'dev'
        else:
            classification['env'] = 'untagged'
            classification['violations'].append('Missing Env tag and cannot infer from naming')
    
    # Check required tags from x-aws-inventory-rules
    inventory_rules = spec.get('x-aws-inventory-rules', {})
    required_tags = inventory_rules.get('required_tags', [])
    for tag_spec in required_tags:
        tag_name = tag_spec.get('name', '')
        required = tag_spec.get('required', False)
        
        # Check if tag is required conditionally (e.g., ExpiresAt for dev only)
        required_when = tag_spec.get('required_when', {})
        if required_when:
            required_envs = required_when.get('env', [])
            if classification['env'] not in required_envs:
                required = False
        
        if required and tag_name not in tags:
            classification['violations'].append(f'Missing required tag: {tag_name}')
            classification['compliant'] = False
    
    # Check naming convention from x-aws-inventory-rules
    naming_convention = inventory_rules.get('naming_convention', {})
    naming_pattern = naming_convention.get('pattern', '')
    if naming_pattern and classification['env'] != 'untagged':
        expected_prefix = f"flowlogic-{classification['env']}-"
        if not resource_name.startswith(expected_prefix):
            classification['violations'].append(f'Naming violation: expected prefix "{expected_prefix}"')
            classification['compliant'] = False
    
    # Check ExpiresAt for dev resources
    expires_at_str = tags.get('ExpiresAt', '')
    if expires_at_str:
        try:
            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
            classification['expires_at'] = expires_at.isoformat()
            
            if classification['env'] == 'dev':
                now = datetime.now(timezone.utc)
                if expires_at < now:
                    classification['category'] = 'expired'
                    classification['requires_action'] = True
                    classification['violations'].append(f'Expired dev resource: ExpiresAt={expires_at_str}')
                    classification['compliant'] = False
        except (ValueError, AttributeError):
            classification['violations'].append(f'Invalid ExpiresAt format: {expires_at_str}')
    
    # Check if dev resource requires ExpiresAt from lifecycle policies
    lifecycle_policies = inventory_rules.get('lifecycle_policies', {})
    dev_lifecycle = lifecycle_policies.get('dev_resources', {})
    if classification['env'] == 'dev' and dev_lifecycle.get('auto_cleanup', False):
        if not expires_at_str:
            classification['violations'].append('Dev resource missing required ExpiresAt tag (auto-cleanup enabled)')
            classification['compliant'] = False
    
    # Categorize violations
    if classification['env'] == 'untagged':
        classification['category'] = 'untagged'
        classification['requires_action'] = True
    elif not classification['compliant']:
        if classification['category'] == 'compliant':
            classification['category'] = 'non_compliant'
        classification['requires_action'] = True
    
    return classification


def classify_inventory(inventory_data: List[dict], spec_path: Path, config_path: Path) -> dict:
    """Classify all resources in inventory."""
    spec = load_yaml(spec_path)
    config = load_yaml(config_path)
    
    results = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'total_resources': len(inventory_data),
        'classifications': {},
        'summary': {
            'compliant': 0,
            'non_compliant': 0,
            'expired': 0,
            'untagged': 0,
            'by_env': {'prod': 0, 'staging': 0, 'dev': 0, 'untagged': 0}
        },
        'violations': []
    }
    
    for resource in inventory_data:
        classification = classify_resource(resource, spec, config)
        category = classification['category']
        env = classification['env']
        
        # Aggregate by category
        if category not in results['classifications']:
            results['classifications'][category] = []
        results['classifications'][category].append(classification)
        
        # Update summary
        if classification['compliant']:
            results['summary']['compliant'] += 1
        else:
            results['summary']['non_compliant'] += 1
        
        if category == 'expired':
            results['summary']['expired'] += 1
        if category == 'untagged':
            results['summary']['untagged'] += 1
        
        results['summary']['by_env'][env] += 1
        
        # Collect violations
        if classification['violations']:
            results['violations'].append({
                'arn': classification['arn'],
                'name': classification['name'],
                'env': env,
                'violations': classification['violations']
            })
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Classify AWS resources from inventory JSON')
    parser.add_argument('inventory_file', type=Path, help='Path to inventory JSON file')
    parser.add_argument('--output', '-o', type=Path, help='Output file (default: stdout)')
    parser.add_argument('--spec', type=Path, default=INFRA_SPEC, help='Path to infrastructure-spec.yaml')
    parser.add_argument('--config', type=Path, default=INVENTORY_CONFIG, help='Path to aws-inventory-config.yaml')
    
    args = parser.parse_args()
    
    # Load inventory
    try:
        with open(args.inventory_file, 'r') as f:
            inventory_data = json.load(f)
            if isinstance(inventory_data, dict) and 'resources' in inventory_data:
                inventory_data = inventory_data['resources']
    except FileNotFoundError:
        print(f"ERROR: Inventory file not found: {args.inventory_file}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in inventory file: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Classify
    results = classify_inventory(inventory_data, args.spec, args.config)
    
    # Output
    output_json = json.dumps(results, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with open(args.output, 'w') as f:
            f.write(output_json)
    else:
        print(output_json)


if __name__ == '__main__':
    main()
