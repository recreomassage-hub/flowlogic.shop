#!/bin/bash
# OpenSpec Rules Parser
# Extracts rules and metadata from OpenSpec project.md and specs
# Outputs JSON structure for use by bug-hunter.sh
#
# Usage:
#   ./scripts/openspec-rules-parser.sh [--cache-file PATH] [--force-refresh]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
CACHE_FILE="${PROJECT_ROOT}/scripts/.openspec-rules-cache.json"
FORCE_REFRESH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --cache-file)
      CACHE_FILE="$2"
      shift 2
      ;;
    --force-refresh)
      FORCE_REFRESH=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--cache-file PATH] [--force-refresh]"
      exit 1
      ;;
  esac
done

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "❌ ERROR: jq is required but not installed"
  echo "   Install: sudo apt-get install jq (Linux) or brew install jq (macOS)"
  exit 1
fi

# Check if cache exists and is fresh (not older than 1 hour)
if [ "$FORCE_REFRESH" = false ] && [ -f "$CACHE_FILE" ]; then
  CACHE_AGE=$(($(date +%s) - $(stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0)))
  if [ $CACHE_AGE -lt 3600 ]; then
    # Cache is fresh, use it
    cat "$CACHE_FILE"
    exit 0
  fi
fi

# Initialize JSON structure using jq
PROJECT_FILE="${PROJECT_ROOT}/openspec/project.md"
SPECS_DIR="${PROJECT_ROOT}/openspec/changes"

# Start building JSON structure
TEMP_JSON=$(mktemp)

# Initialize structure
cat > "$TEMP_JSON" <<'EOF'
{
  "rules": [],
  "metadata": {
    "x-reliability": {
      "high": [],
      "medium": [],
      "low": []
    },
    "x-critical-path": []
  },
  "parsed_at": ""
}
EOF

# Set parsed_at
TEMP_JSON=$(echo "$TEMP_JSON" | jq --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '.parsed_at = $date')

# Parse OpenSpec project.md
if [ -f "$PROJECT_FILE" ]; then
  # Extract Code Style rules
  IN_CODE_STYLE=false
  IN_ARCHITECTURE=false
  IN_SECURITY=false
  IN_TESTING=false
  IN_GIT=false
  
  while IFS= read -r line || [ -n "$line" ]; do
    # Detect section headers
    if [[ "$line" =~ ^###[[:space:]]+Code[[:space:]]+Style ]]; then
      IN_CODE_STYLE=true
      IN_ARCHITECTURE=false
      IN_SECURITY=false
      IN_TESTING=false
      IN_GIT=false
      continue
    elif [[ "$line" =~ ^###[[:space:]]+Architecture[[:space:]]+Patterns ]]; then
      IN_CODE_STYLE=false
      IN_ARCHITECTURE=true
      IN_SECURITY=false
      IN_TESTING=false
      IN_GIT=false
      continue
    elif [[ "$line" =~ ^\*\*Security:\*\* ]]; then
      IN_CODE_STYLE=false
      IN_ARCHITECTURE=false
      IN_SECURITY=true
      IN_TESTING=false
      IN_GIT=false
      continue
    elif [[ "$line" =~ ^###[[:space:]]+Testing[[:space:]]+Strategy ]]; then
      IN_CODE_STYLE=false
      IN_ARCHITECTURE=false
      IN_SECURITY=false
      IN_TESTING=true
      IN_GIT=false
      continue
    elif [[ "$line" =~ ^###[[:space:]]+Git[[:space:]]+Workflow ]]; then
      IN_CODE_STYLE=false
      IN_ARCHITECTURE=false
      IN_SECURITY=false
      IN_TESTING=false
      IN_GIT=true
      continue
    fi
    
    # Extract rules based on section
    if [ "$IN_CODE_STYLE" = true ]; then
      # TypeScript rules
      if [[ "$line" =~ Strict[[:space:]]+mode[[:space:]]+enabled ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "typescript-strict-mode", "type": "code-style", "description": "TypeScript strict mode enabled", "source": "openspec/project.md", "severity": "high"}]')
      fi
      if [[ "$line" =~ ESLint[[:space:]]\+[[:space:]]\+Prettier ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "eslint-prettier", "type": "code-style", "description": "ESLint + Prettier for formatting", "source": "openspec/project.md", "severity": "medium"}]')
      fi
      # Naming conventions
      if [[ "$line" =~ Components:[[:space:]]+PascalCase ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "naming-components-pascalcase", "type": "code-style", "description": "Components: PascalCase", "source": "openspec/project.md", "severity": "medium", "pattern": "PascalCase"}]')
      fi
      if [[ "$line" =~ Functions:[[:space:]]+camelCase ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "naming-functions-camelcase", "type": "code-style", "description": "Functions: camelCase", "source": "openspec/project.md", "severity": "medium", "pattern": "camelCase"}]')
      fi
      if [[ "$line" =~ Constants:[[:space:]]+UPPER_SNAKE_CASE ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "naming-constants-uppersnakecase", "type": "code-style", "description": "Constants: UPPER_SNAKE_CASE", "source": "openspec/project.md", "severity": "medium", "pattern": "UPPER_SNAKE_CASE"}]')
      fi
      # File organization
      if [[ "$line" =~ Components:[[:space:]]+\`src/frontend/components/ ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "file-organization-components", "type": "code-style", "description": "Components in src/frontend/components/", "source": "openspec/project.md", "severity": "low"}]')
      fi
      # Import order
      if [[ "$line" =~ ^1\.[[:space:]]+External[[:space:]]+dependencies ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "import-order", "type": "code-style", "description": "Import order: External → Internal → Types → Constants", "source": "openspec/project.md", "severity": "low"}]')
      fi
    fi
    
    if [ "$IN_ARCHITECTURE" = true ]; then
      # Architecture patterns
      if [[ "$line" =~ Component-based[[:space:]]+architecture ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "architecture-frontend-component-based", "type": "architecture", "description": "Frontend: Component-based architecture", "source": "openspec/project.md", "severity": "high"}]')
      fi
      if [[ "$line" =~ Serverless[[:space:]]+architecture ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "architecture-backend-serverless", "type": "architecture", "description": "Backend: Serverless architecture (AWS Lambda)", "source": "openspec/project.md", "severity": "high"}]')
      fi
      if [[ "$line" =~ KMS[[:space:]]+encryption[[:space:]]+at[[:space:]]+rest ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "security-dynamodb-kms-encryption", "type": "security", "description": "DynamoDB: KMS encryption at rest", "source": "openspec/project.md", "severity": "critical"}]')
      fi
    fi
    
    if [ "$IN_SECURITY" = true ]; then
      # Security rules
      if [[ "$line" =~ JWT[[:space:]]+authentication ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "security-jwt-auth", "type": "security", "description": "JWT authentication with refresh tokens", "source": "openspec/project.md", "severity": "critical"}]')
      fi
      if [[ "$line" =~ Encryption[[:space:]]+in[[:space:]]+transit[[:space:]]+\(HTTPS\) ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "security-https", "type": "security", "description": "Encryption in transit (HTTPS)", "source": "openspec/project.md", "severity": "critical"}]')
      fi
    fi
    
    if [ "$IN_TESTING" = true ]; then
      # Testing rules
      if [[ "$line" =~ Minimum[[:space:]]+80%[[:space:]]+for[[:space:]]+critical[[:space:]]+paths ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "testing-coverage-critical", "type": "testing", "description": "Minimum 80% coverage for critical paths", "source": "openspec/project.md", "severity": "high"}]')
      fi
      if [[ "$line" =~ 100%[[:space:]]+for[[:space:]]+authentication[[:space:]]+and[[:space:]]+payment ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "testing-coverage-auth-payment", "type": "testing", "description": "100% coverage for authentication and payment flows", "source": "openspec/project.md", "severity": "critical"}]')
      fi
    fi
    
    if [ "$IN_GIT" = true ]; then
      # Git workflow rules
      if [[ "$line" =~ Format:[[:space:]]+\`type\(scope\): ]]; then
        TEMP_JSON=$(echo "$TEMP_JSON" | jq '.rules += [{"name": "git-commit-format", "type": "git", "description": "Commit format: type(scope): description", "source": "openspec/project.md", "severity": "low"}]')
      fi
    fi
  done < "$PROJECT_FILE"
fi

# Parse OpenSpec specs for metadata
if [ -d "$SPECS_DIR" ]; then
  while IFS= read -r spec_file; do
    if [ -f "$spec_file" ]; then
      # Extract x-reliability
      if grep -q "x-reliability" "$spec_file" 2>/dev/null; then
        reliability=$(grep -oP "x-reliability:\s*\K\w+" "$spec_file" 2>/dev/null || echo "")
        if [ -n "$reliability" ]; then
          spec_path=$(echo "$spec_file" | sed "s|$PROJECT_ROOT/||")
          TEMP_JSON=$(echo "$TEMP_JSON" | jq --arg level "$reliability" --arg path "$spec_path" ".metadata.\"x-reliability\".$level += [\$path]")
        fi
      fi
      
      # Extract x-critical-path
      if grep -q "x-critical-path" "$spec_file" 2>/dev/null; then
        critical_path=$(grep -oP "x-critical-path:\s*\K(true|false)" "$spec_file" 2>/dev/null || echo "")
        if [ "$critical_path" = "true" ]; then
          spec_path=$(echo "$spec_file" | sed "s|$PROJECT_ROOT/||")
          TEMP_JSON=$(echo "$TEMP_JSON" | jq --arg path "$spec_path" '.metadata."x-critical-path" += [$path]')
        fi
      fi
    fi
  done < <(find "$SPECS_DIR" -name "spec.md" -type f 2>/dev/null || true)
fi

# Save to cache file
echo "$TEMP_JSON" > "$CACHE_FILE"

# Output the result
cat "$CACHE_FILE"

# Cleanup
rm -f "$TEMP_JSON"
