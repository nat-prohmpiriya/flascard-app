'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { NotificationSettingsComponent } from '@/components/notifications/NotificationSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateUserSettings } from '@/services/auth';
import { toast } from 'sonner';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { firebaseUser, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    settings: notificationSettings,
    loading: notificationsLoading,
    requestPermission,
    updateSettings: updateNotificationSettings,
    testNotification,
  } = useNotifications();

  const [dailyGoal, setDailyGoal] = useState(user?.settings?.dailyGoal || 20);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!firebaseUser) return;

    setSaving(true);
    try {
      await updateUserSettings(firebaseUser.uid, {
        dailyGoal,
        theme,
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={firebaseUser?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={firebaseUser?.displayName || ''} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? 'default' : 'outline'}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme(option.value)}
                  >
                    <option.icon className="h-5 w-5" />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Study Settings</CardTitle>
            <CardDescription>Configure your study preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Goal (cards)</Label>
              <Input
                id="dailyGoal"
                type="number"
                min={1}
                max={100}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value) || 20)}
              />
              <p className="text-sm text-muted-foreground">
                Number of cards you want to study each day
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettingsComponent
          settings={notificationSettings}
          permission={notificationPermission}
          isSupported={notificationsSupported}
          loading={notificationsLoading}
          onUpdateSettings={updateNotificationSettings}
          onRequestPermission={requestPermission}
          onTestNotification={testNotification}
        />

        {/* Save Button */}
        <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </ProtectedRoute>
  );
}
