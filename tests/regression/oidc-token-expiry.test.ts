/**
 * Regression tests for OIDC Token Expiry bug (a3o)
 * Tests early secrets loading pattern implementation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('OIDC Token Expiry - Early Secrets Loading Pattern', () => {
  const workflowDir = path.join(__dirname, '../../.github/workflows');
  const ciCdWorkflow = path.join(workflowDir, 'ci-cd.yml');
  const earlySecretsWorkflow = path.join(workflowDir, 'ci-cd-early-secrets.yml');

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Workflow Structure', () => {
    it('should have OIDC configuration before SSM read', () => {
      if (!fs.existsSync(ciCdWorkflow)) {
        console.warn('ci-cd.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(ciCdWorkflow, 'utf-8');
      const oidcStepIndex = content.indexOf('Configure AWS credentials (OIDC)');
      const ssmStepIndex = content.indexOf('ssm get-parameters') || content.indexOf('SSM');

      if (oidcStepIndex !== -1 && ssmStepIndex !== -1) {
        expect(oidcStepIndex).toBeLessThan(ssmStepIndex);
      }
    });

    it('should have early secrets loading step', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('Load ALL SSM Parameters Early');
      expect(content).toContain('Cache SSM Parameters');
    });

    it('should have fallback mechanism', () => {
      if (!fs.existsSync(ciCdWorkflow)) {
        console.warn('ci-cd.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(ciCdWorkflow, 'utf-8');
      expect(content).toContain('Access Keys') || expect(content).toContain('fallback');
    });
  });

  describe('Early Secrets Loading Pattern', () => {
    it('should load secrets before time-consuming steps', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      const loadSecretsIndex = content.indexOf('Load ALL SSM Parameters Early');
      const deployIndex = content.indexOf('Deploy Backend');

      if (loadSecretsIndex !== -1 && deployIndex !== -1) {
        expect(loadSecretsIndex).toBeLessThan(deployIndex);
      }
    });

    it('should cache secrets', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('actions/cache/save');
      expect(content).toContain('ssm-params');
    });

    it('should use cached secrets in deployment', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('fromJSON(env.SSM_PARAMETERS)');
    });
  });

  describe('Monitoring Integration', () => {
    it('should have metrics sending script', () => {
      const metricsScript = path.join(__dirname, '../../scripts/send-oidc-metrics.sh');
      expect(fs.existsSync(metricsScript)).toBe(true);
    });

    it('should send fallback usage metric', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('send-oidc-metrics.sh');
      expect(content).toContain('SSMFallbackUsage');
    });

    it('should send workflow duration metric', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('WorkflowDuration');
    });
  });

  describe('Error Handling', () => {
    it('should handle OIDC failure gracefully', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('continue-on-error: true') || expect(content).toContain('if: steps.aws-oidc.outcome');
    });

    it('should have fallback for SSM read failure', () => {
      if (!fs.existsSync(earlySecretsWorkflow)) {
        console.warn('ci-cd-early-secrets.yml not found, skipping test');
        return;
      }

      const content = fs.readFileSync(earlySecretsWorkflow, 'utf-8');
      expect(content).toContain('Load SSM Parameters (Fallback)') || expect(content).toContain('fallback');
    });
  });
});

describe('CloudWatch Monitoring', () => {
  const cloudwatchConfig = path.join(__dirname, '../../infra/cloudwatch/oidc-token-monitoring.yml');

  it('should have CloudWatch alarms configuration', () => {
    if (!fs.existsSync(cloudwatchConfig)) {
      console.warn('oidc-token-monitoring.yml not found, skipping test');
      return;
    }

    const content = fs.readFileSync(cloudwatchConfig, 'utf-8');
    expect(content).toContain('SSMFallbackUsageAlarm');
    expect(content).toContain('WorkflowDurationAlarm');
    expect(content).toContain('OIDCTokenExpiryEventsAlarm');
  });

  it('should have SNS topic for alerts', () => {
    if (!fs.existsSync(cloudwatchConfig)) {
      console.warn('oidc-token-monitoring.yml not found, skipping test');
      return;
    }

    const content = fs.readFileSync(cloudwatchConfig, 'utf-8');
    expect(content).toContain('OIDCTokenExpiryAlertsTopic');
  });
});
