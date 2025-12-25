'use client';

import { NotificationSettings as NotificationSettingsType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ReminderTimeSelector } from './ReminderTimeSelector';
import { Bell, BellOff, Clock, Flame, Target, Trophy, Send } from 'lucide-react';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  permission: NotificationPermission | 'unsupported';
  isSupported: boolean;
  loading: boolean;
  onUpdateSettings: (settings: Partial<NotificationSettingsType>) => Promise<boolean>;
  onRequestPermission: () => Promise<boolean>;
  onTestNotification: () => Promise<boolean>;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function NotificationSettingsComponent({
  settings,
  permission,
  isSupported,
  loading,
  onUpdateSettings,
  onRequestPermission,
  onTestNotification,
}: NotificationSettingsProps) {
  const isEnabled = permission === 'granted' && settings.enabled;
  const isDenied = permission === 'denied';

  const toggleDay = (day: number) => {
    const currentDays = settings.studyReminder.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();

    onUpdateSettings({
      studyReminder: { ...settings.studyReminder, days: newDays },
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Get reminders to study and track your progress
            </CardDescription>
          </div>
          <Badge
            variant={isEnabled ? 'default' : isDenied ? 'destructive' : 'secondary'}
          >
            {isEnabled ? 'Enabled' : isDenied ? 'Blocked' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Request Permission */}
        {permission !== 'granted' ? (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {isDenied
                    ? 'Notifications are blocked. Please enable them in your browser settings.'
                    : 'Allow notifications to receive study reminders'}
                </p>
              </div>
              <Button
                onClick={onRequestPermission}
                disabled={isDenied || loading}
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Master Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable All Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all notification types
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(enabled) => onUpdateSettings({ enabled })}
              />
            </div>

            {/* Study Reminder */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <Label>Daily Study Reminder</Label>
                </div>
                <Switch
                  checked={settings.studyReminder.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdateSettings({
                      studyReminder: { ...settings.studyReminder, enabled },
                    })
                  }
                  disabled={!settings.enabled}
                />
              </div>

              {settings.studyReminder.enabled && settings.enabled && (
                <>
                  <ReminderTimeSelector
                    value={settings.studyReminder.time}
                    onChange={(time) =>
                      onUpdateSettings({
                        studyReminder: { ...settings.studyReminder, time },
                      })
                    }
                    label="Reminder Time"
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Days</Label>
                    <div className="flex gap-2">
                      {DAYS.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => toggleDay(index)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            settings.studyReminder.days.includes(index)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Streak Reminder */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <Label>Streak Reminder</Label>
                </div>
                <Switch
                  checked={settings.streakReminder.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdateSettings({
                      streakReminder: { ...settings.streakReminder, enabled },
                    })
                  }
                  disabled={!settings.enabled}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Get reminded if you haven&apos;t studied today
              </p>

              {settings.streakReminder.enabled && settings.enabled && (
                <ReminderTimeSelector
                  value={settings.streakReminder.time}
                  onChange={(time) =>
                    onUpdateSettings({
                      streakReminder: { ...settings.streakReminder, time },
                    })
                  }
                  label="Alert Time"
                />
              )}
            </div>

            {/* Other Notifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <Label>Goal Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly progress summaries
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.goalUpdates}
                  onCheckedChange={(goalUpdates) =>
                    onUpdateSettings({ goalUpdates })
                  }
                  disabled={!settings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <div>
                    <Label>Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      When you unlock achievements
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.achievements}
                  onCheckedChange={(achievements) =>
                    onUpdateSettings({ achievements })
                  }
                  disabled={!settings.enabled}
                />
              </div>
            </div>

            {/* Test Notification */}
            <Button
              variant="outline"
              onClick={onTestNotification}
              disabled={!settings.enabled}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
