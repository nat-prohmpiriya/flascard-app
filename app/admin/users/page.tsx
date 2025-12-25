'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminProtectedRoute } from '@/components/common/AdminProtectedRoute';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AdminUser } from '@/services/admin';

function UserManagementContent() {
  const { users, loading, error, refresh, setUserRole, setBanStatus } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'makeAdmin' | 'removeAdmin' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsProcessing(true);
    try {
      switch (actionType) {
        case 'ban':
          await setBanStatus(selectedUser.uid, true);
          toast.success(`${selectedUser.displayName || selectedUser.email} has been banned`);
          break;
        case 'unban':
          await setBanStatus(selectedUser.uid, false);
          toast.success(`${selectedUser.displayName || selectedUser.email} has been unbanned`);
          break;
        case 'makeAdmin':
          await setUserRole(selectedUser.uid, 'admin');
          toast.success(`${selectedUser.displayName || selectedUser.email} is now an admin`);
          break;
        case 'removeAdmin':
          await setUserRole(selectedUser.uid, 'user');
          toast.success(`${selectedUser.displayName || selectedUser.email} is no longer an admin`);
          break;
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setIsProcessing(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
            <span>/</span>
            <span>Users</span>
          </div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={refresh} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>
                          {getInitials(user.displayName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.displayName || 'No name'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ...
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.role === 'admin' ? (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('removeAdmin');
                            }}
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('makeAdmin');
                            }}
                          >
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.isBanned ? (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('unban');
                            }}
                          >
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('ban');
                            }}
                            className="text-destructive"
                          >
                            Ban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!selectedUser && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'ban' &&
                `Are you sure you want to ban ${selectedUser?.displayName || selectedUser?.email}? They will not be able to access the application.`}
              {actionType === 'unban' &&
                `Are you sure you want to unban ${selectedUser?.displayName || selectedUser?.email}?`}
              {actionType === 'makeAdmin' &&
                `Are you sure you want to make ${selectedUser?.displayName || selectedUser?.email} an admin? They will have full access to admin features.`}
              {actionType === 'removeAdmin' &&
                `Are you sure you want to remove admin privileges from ${selectedUser?.displayName || selectedUser?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={actionType === 'ban' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <UserManagementContent />
      </div>
    </AdminProtectedRoute>
  );
}
