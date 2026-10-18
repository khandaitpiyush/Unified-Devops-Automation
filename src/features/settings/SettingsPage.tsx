import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Save,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { settingsService, PlatformSettings } from '@/services/settingsService';
import { authService, UserProfile } from '@/services/authService';
import { useToast } from '@/components/common/Toast';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const [sRes, uRes] = await Promise.all([
        settingsService.getSettings(),
        authService.getCurrentUser(),
      ]);
      setSettings(sRes.data);
      setUser(uRes.data);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setIsSaving(true);
      await settingsService.updateSettings(settings);
      toast.success('Settings Saved', 'Platform automation policies successfully updated.');
    } catch {
      toast.error('Save failed', 'Unable to persist platform settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automation thresholds, security gates, GitHub authorizations, and notifications.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
        >
          Save Configuration
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* User Profile */}
        {user && (
          <Card className="p-4">
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-border object-cover"
              />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 text-xs">{user.name}</p>
                <p className="text-slate-500">{user.email}</p>
                <p className="text-primary-600 font-mono text-[10px]">
                  Role: {user.role} • GitHub: @{user.githubUsername}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* DevOps Blueprint Governance */}
        <Card className="p-4 space-y-3">
          <CardHeader className="px-0 pt-0 py-2 border-b border-border/70">
            <CardTitle className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              DevOps Blueprint Governance & Approval Gates
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.general.requireBlueprintApproval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, requireBlueprintApproval: e.target.checked },
                  })
                }
                className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-semibold text-slate-800">
                  Enforce Explicit Human Blueprint Approval
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Prohibits artifact generation and Jenkinsfile pipeline deployment until a DevOps engineer approves the synthesized specification.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.general.autoTriggerOnPush}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, autoTriggerOnPush: e.target.checked },
                  })
                }
                className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-semibold text-slate-800">
                  Auto-dispatch CI/CD on GitHub Push
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Executes the 9-stage pipeline automatically whenever code is pushed to the default branch of an approved repository.
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Security Policy Thresholds */}
        <Card className="p-4 space-y-3">
          <CardHeader className="px-0 pt-0 py-2 border-b border-border/70">
            <CardTitle className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Security & Quality Gate Thresholds
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.enforceZeroCriticalCVE}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, enforceZeroCriticalCVE: e.target.checked },
                  })
                }
                className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-semibold text-slate-800">
                  Enforce Trivy Zero-Critical Vulnerability Gate
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Automatically halts the pipeline and blocks Kubernetes rollout if Trivy detects any unresolved CRITICAL severity CVE.
                </p>
              </div>
            </label>

            <div className="pt-2">
              <div className="flex justify-between font-semibold text-slate-800 mb-1 text-xs">
                <span>Minimum SonarQube Code Coverage:</span>
                <span className="font-mono text-primary-600">{settings.security.minSonarCodeCoverage}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={settings.security.minSonarCodeCoverage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, minSonarCodeCoverage: Number(e.target.value) },
                  })
                }
                className="w-full accent-primary-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-4 space-y-2">
          <CardHeader className="px-0 pt-0 py-2 border-b border-border/70">
            <CardTitle className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              Alert Channels & Notifications
            </CardTitle>
          </CardHeader>
          <div className="space-y-2 text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.slackWebhookConfigured}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, slackWebhookConfigured: e.target.checked },
                  })
                }
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span>Send deployment and security failure alerts to configured Slack channel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailAlertsEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailAlertsEnabled: e.target.checked },
                  })
                }
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span>Send digest emails for blocked pipelines and critical CVE alerts</span>
            </label>
          </div>
        </Card>
      </form>
    </div>
  );
};
