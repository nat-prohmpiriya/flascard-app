'use client';

import { LearningInsights, StudyPattern } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatStudyTime } from '@/services/analytics';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  Calendar,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface InsightsPanelProps {
  insights: LearningInsights | null;
  patterns: StudyPattern | null;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function InsightsPanel({ insights, patterns }: InsightsPanelProps) {
  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Study more to unlock insights
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (insights.improvementTrend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    switch (insights.improvementTrend) {
      case 'improving':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declining':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Generate personalized tips
  const tips: { icon: React.ReactNode; text: string; type: 'success' | 'warning' | 'info' }[] = [];

  // Study time tip
  if (patterns) {
    tips.push({
      icon: <Clock className="h-4 w-4" />,
      text: `You study best around ${formatHour(patterns.bestHour)} on ${DAYS[patterns.bestDay]}s`,
      type: 'info',
    });
  }

  // Consistency tip
  if (insights.streakConsistency >= 70) {
    tips.push({
      icon: <Calendar className="h-4 w-4" />,
      text: `Great consistency! You studied ${insights.streakConsistency}% of the last 30 days`,
      type: 'success',
    });
  } else if (insights.streakConsistency < 30) {
    tips.push({
      icon: <Calendar className="h-4 w-4" />,
      text: 'Try to study more consistently for better retention',
      type: 'warning',
    });
  }

  // Difficult cards tip
  if (insights.difficultCardsCount > 0) {
    tips.push({
      icon: <AlertTriangle className="h-4 w-4" />,
      text: `Focus on ${insights.difficultCardsCount} difficult card${insights.difficultCardsCount > 1 ? 's' : ''} for better results`,
      type: 'warning',
    });
  }

  // Improvement tip
  if (insights.improvementTrend === 'improving') {
    tips.push({
      icon: <TrendingUp className="h-4 w-4" />,
      text: 'Your accuracy is improving! Keep up the great work',
      type: 'success',
    });
  } else if (insights.improvementTrend === 'declining') {
    tips.push({
      icon: <TrendingDown className="h-4 w-4" />,
      text: 'Your accuracy has dipped. Consider reviewing more frequently',
      type: 'warning',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Learning Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Velocity</span>
            </div>
            <p className="text-xl font-semibold">
              {insights.learningVelocity} cards/day
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Retention</span>
            </div>
            <p className="text-xl font-semibold">{insights.retentionRate}%</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Consistency</span>
            </div>
            <p className="text-xl font-semibold">
              {insights.streakConsistency}%
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Avg Session</span>
            </div>
            <p className="text-xl font-semibold">
              {formatStudyTime(insights.averageSessionLength)}
            </p>
          </div>
        </div>

        {/* Trend Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trend:</span>
          <Badge className={getTrendColor()}>
            {getTrendIcon()}
            <span className="ml-1 capitalize">{insights.improvementTrend}</span>
          </Badge>
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Personalized Tips</p>
            {tips.map((tip, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  tip.type === 'success'
                    ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                    : tip.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                    : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                }`}
              >
                {tip.icon}
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
