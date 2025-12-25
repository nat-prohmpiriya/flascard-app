'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AdminProtectedRoute } from '@/components/common/AdminProtectedRoute';
import { useAdminStats } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function StatCard({
  title,
  value,
  description,
  variant = 'default',
}: {
  title: string;
  value: number | string;
  description?: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {variant === 'warning' && (
          <Badge variant="destructive" className="text-xs">
            Pending
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboardContent() {
  const { stats, loading, error, refresh } = useAdminStats();

  useEffect(() => {
    const interval = setInterval(refresh, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your flashcard application
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Decks" value={stats.totalDecks} />
        <StatCard title="Total Cards" value={stats.totalCards} />
        <StatCard title="Study Sessions" value={stats.totalStudySessions} />
      </div>

      {/* Today's Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="New Users Today"
          value={stats.newUsersToday}
          variant="success"
        />
        <StatCard
          title="Active Users Today"
          value={stats.activeUsersToday}
          description="Users who studied today"
        />
        <StatCard
          title="Pending Decks"
          value={stats.pendingDecks}
          variant={stats.pendingDecks > 0 ? 'warning' : 'default'}
          description="Public decks awaiting approval"
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/users">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View and manage users, update roles, and ban accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/decks">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Deck Moderation
                {stats.pendingDecks > 0 && (
                  <Badge variant="destructive">{stats.pendingDecks}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Review and approve public decks submitted by users
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <AdminDashboardContent />
      </div>
    </AdminProtectedRoute>
  );
}
