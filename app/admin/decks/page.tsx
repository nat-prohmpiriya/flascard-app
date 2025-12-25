'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminProtectedRoute } from '@/components/common/AdminProtectedRoute';
import { useAdminDecks } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { PublicDeck, DeckStatus } from '@/services/admin';

function DeckModerationContent() {
  const { decks, loading, error, refresh, setDeckStatus } = useAdminDecks();
  const [selectedDeck, setSelectedDeck] = useState<PublicDeck | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pending');

  const handleAction = async () => {
    if (!selectedDeck || !action) return;

    setIsProcessing(true);
    try {
      const status: DeckStatus = action === 'approve' ? 'approved' : 'rejected';
      await setDeckStatus(selectedDeck.id, status);
      toast.success(
        `Deck "${selectedDeck.name}" has been ${status}`
      );
    } catch (err) {
      toast.error('Failed to update deck status');
    } finally {
      setIsProcessing(false);
      setSelectedDeck(null);
      setAction(null);
    }
  };

  const getStatusBadge = (status: DeckStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredDecks = decks.filter((deck) => {
    if (activeTab === 'all') return true;
    return deck.status === activeTab;
  });

  const pendingCount = decks.filter((d) => d.status === 'pending').length;
  const approvedCount = decks.filter((d) => d.status === 'approved').length;
  const rejectedCount = decks.filter((d) => d.status === 'rejected').length;

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
            <span>Deck Moderation</span>
          </div>
          <h1 className="text-3xl font-bold">Deck Moderation</h1>
          <p className="text-muted-foreground">
            Review and approve public decks submitted by users
          </p>
        </div>
        <Button onClick={() => refresh()} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Decks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger value="all">All ({decks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredDecks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No decks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deck Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Cards</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDecks.map((deck) => (
                      <TableRow key={deck.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deck.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {deck.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{deck.ownerName || 'No name'}</div>
                            <div className="text-xs text-muted-foreground">
                              {deck.ownerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{deck.category}</TableCell>
                        <TableCell>{deck.cardCount}</TableCell>
                        <TableCell>{getStatusBadge(deck.status)}</TableCell>
                        <TableCell>
                          {deck.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {deck.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedDeck(deck);
                                  setAction('approve');
                                }}
                              >
                                Approve
                              </Button>
                            )}
                            {deck.status !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedDeck(deck);
                                  setAction('reject');
                                }}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!selectedDeck && !!action}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDeck(null);
            setAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'approve' ? 'Approve Deck' : 'Reject Deck'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'approve'
                ? `Are you sure you want to approve "${selectedDeck?.name}"? This deck will be visible to all users.`
                : `Are you sure you want to reject "${selectedDeck?.name}"? This deck will not be visible to other users.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isProcessing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminDecksPage() {
  return (
    <AdminProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <DeckModerationContent />
      </div>
    </AdminProtectedRoute>
  );
}
