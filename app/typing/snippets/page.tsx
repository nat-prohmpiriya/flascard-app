'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSnippets, deleteTypingSnippet } from '@/services/typingSnippet';
import { TypingSnippet, getLanguageById } from '@/models/typingSnippet';
import { MarkdownUpload } from '@/components/typing/MarkdownUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Plus,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Code,
  Upload,
  Globe,
  Lock,
} from 'lucide-react';

export default function SnippetsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [snippets, setSnippets] = useState<TypingSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadSnippets = async () => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserSnippets(firebaseUser.uid);
      setSnippets(data);
    } catch (error) {
      console.error('Failed to load snippets:', error);
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnippets();
  }, [firebaseUser]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTypingSnippet(deleteId);
      setSnippets((prev) => prev.filter((s) => s.id !== deleteId));
      toast.success('Snippet deleted');
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      toast.error('Failed to delete snippet');
    } finally {
      setDeleteId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-600';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'hard':
        return 'bg-red-500/10 text-red-600';
      default:
        return '';
    }
  };

  if (!firebaseUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please login to manage snippets</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/typing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Snippets</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your typing practice snippets
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/typing/snippets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Snippet
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            My Snippets
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : snippets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No snippets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first snippet or import from markdown
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/typing/snippets/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Snippet
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {snippets.map((snippet) => {
                const lang = getLanguageById(snippet.language);
                return (
                  <Card key={snippet.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: lang?.color || '#6B7280' }}
                          >
                            {snippet.languageName.slice(0, 2)}
                          </span>
                          <div>
                            <CardTitle className="text-base">{snippet.title}</CardTitle>
                            <CardDescription>{snippet.languageName}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(snippet.difficulty)}>
                            {snippet.difficulty}
                          </Badge>
                          {snippet.isPublic ? (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/typing/snippets/${snippet.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteId(snippet.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-3 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
                        <code>{snippet.code.slice(0, 200)}{snippet.code.length > 200 ? '...' : ''}</code>
                      </pre>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <MarkdownUpload onSuccess={loadSnippets} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snippet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the snippet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
