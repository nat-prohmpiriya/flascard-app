'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSnippets, deleteTypingSnippet } from '@/services/typingSnippet';
import { TypingSnippet, getLanguageById } from '@/models/typingSnippet';
import { MarkdownUpload } from '@/components/typing/MarkdownUpload';
import { SnippetTable } from '@/components/typing/SnippetTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  LayoutGrid,
  List,
  CheckSquare,
} from 'lucide-react';

export default function SnippetsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [snippets, setSnippets] = useState<TypingSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created-desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Get unique languages from snippets
  const availableLanguages = useMemo(() => {
    const langs = new Map<string, string>();
    snippets.forEach((s) => {
      if (!langs.has(s.language)) {
        langs.set(s.language, s.languageName);
      }
    });
    return Array.from(langs.entries()).map(([id, name]) => ({ id, name }));
  }, [snippets]);

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let result = [...snippets];

    // Filter by language
    if (filterLanguage !== 'all') {
      result = result.filter((s) => s.language === filterLanguage);
    }

    // Sort
    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'language':
          comparison = a.languageName.localeCompare(b.languageName);
          break;
        case 'difficulty':
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty];
          break;
        case 'created':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      return order === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [snippets, filterLanguage, sortBy]);

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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      toast.success('Snippet deleted');
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      toast.error('Failed to delete snippet');
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteTypingSnippet(id)));
      setSnippets((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      toast.success(`${selectedIds.size} snippet(s) deleted`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete snippets:', error);
      toast.error('Failed to delete some snippets');
    } finally {
      setShowBulkDelete(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSnippets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSnippets.map((s) => s.id)));
    }
  };

  const isAllSelected = filteredSnippets.length > 0 && selectedIds.size === filteredSnippets.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredSnippets.length;

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
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please login to manage snippets</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-2">
          {/* Language Filter */}
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created-desc">Newest First</SelectItem>
              <SelectItem value="created-asc">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="language-asc">Language A-Z</SelectItem>
              <SelectItem value="difficulty-asc">Easy → Hard</SelectItem>
              <SelectItem value="difficulty-desc">Hard → Easy</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button asChild>
            <Link href="/typing/snippets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Snippet
            </Link>
          </Button>
        </div>
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

        <TabsContent value="list" className="mt-6 space-y-4">
          {/* Selection Bar */}
          {!loading && filteredSnippets.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isSomeSelected;
                    }
                  }}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} of ${filteredSnippets.length} selected`
                    : `${filteredSnippets.length} snippet(s)`}
                </span>
              </div>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDelete(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSnippets.length === 0 ? (
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
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSnippets.map((snippet) => {
                const lang = getLanguageById(snippet.language);
                const isSelected = selectedIds.has(snippet.id);
                return (
                  <Card key={snippet.id} className={`flex flex-col ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(snippet.id)}
                          />
                          <span
                            className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: lang?.color || '#6B7280' }}
                          >
                            {snippet.languageName.slice(0, 2)}
                          </span>
                          <Badge className={getDifficultyColor(snippet.difficulty)}>
                            {snippet.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
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
                      <CardTitle className="text-base mt-2">{snippet.title}</CardTitle>
                      <CardDescription>
                        {snippet.description || snippet.languageName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className={`p-3 bg-muted rounded-lg overflow-x-auto text-xs h-24 overflow-y-hidden ${lang?.isCode !== false ? 'font-mono' : 'font-sans'}`}>
                        {snippet.code.slice(0, 150)}{snippet.code.length > 150 ? '...' : ''}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <SnippetTable
              snippets={filteredSnippets}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDelete={(id) => setDeleteId(id)}
            />
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

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Snippet(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected snippets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
