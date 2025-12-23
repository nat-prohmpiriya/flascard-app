'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDecks } from '@/services/deck';
import { getAvailableSnippets } from '@/services/typingSnippet';
import { TypingSnippet, SUPPORTED_LANGUAGES, getLanguageById } from '@/models/typingSnippet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Code, BookOpen, Loader2, Plus } from 'lucide-react';
import type { Deck } from '@/types';

interface LanguageGroup {
  id: string;
  name: string;
  color: string;
  snippets: TypingSnippet[];
}

export default function TypingPage() {
  const { firebaseUser } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [snippets, setSnippets] = useState<TypingSnippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const [userDecks, userSnippets] = await Promise.all([
          getUserDecks(firebaseUser.uid),
          getAvailableSnippets(firebaseUser.uid),
        ]);
        setDecks(userDecks);
        setSnippets(userSnippets);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [firebaseUser]);

  // Group snippets by language
  const languageGroups = useMemo(() => {
    const groups: Record<string, LanguageGroup> = {};

    snippets.forEach((snippet) => {
      if (!groups[snippet.language]) {
        const langInfo = getLanguageById(snippet.language);
        groups[snippet.language] = {
          id: snippet.language,
          name: langInfo?.name || snippet.languageName,
          color: langInfo?.color || '#6B7280',
          snippets: [],
        };
      }
      groups[snippet.language].snippets.push(snippet);
    });

    return Object.values(groups).sort((a, b) => b.snippets.length - a.snippets.length);
  }, [snippets]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Keyboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Typing Practice</h1>
          </div>
          <p className="text-muted-foreground">
            Improve your typing speed and accuracy
          </p>
        </div>
        {firebaseUser && (
          <Button asChild>
            <Link href="/typing/snippets">
              <Plus className="mr-2 h-4 w-4" />
              My Snippets
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Snippets
          </TabsTrigger>
          <TabsTrigger value="deck" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            From Flashcards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          {!firebaseUser ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Login to start</h3>
                <p className="text-muted-foreground mb-4">
                  Create your own code snippets to practice typing
                </p>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : languageGroups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No snippets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first snippet or import from markdown
                </p>
                <Button asChild>
                  <Link href="/typing/snippets">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Snippets
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {languageGroups.map((lang) => (
                <Link key={lang.id} href={`/typing/code/${lang.id}`}>
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span
                          className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: lang.color }}
                        >
                          {lang.name.slice(0, 2)}
                        </span>
                        {lang.name}
                      </CardTitle>
                      <CardDescription>
                        {lang.snippets.length} snippet{lang.snippets.length !== 1 ? 's' : ''} available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-green-600">
                          {lang.snippets.filter((s) => s.difficulty === 'easy').length} Easy
                        </Badge>
                        <Badge variant="outline" className="text-yellow-600">
                          {lang.snippets.filter((s) => s.difficulty === 'medium').length} Medium
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          {lang.snippets.filter((s) => s.difficulty === 'hard').length} Hard
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deck" className="mt-6">
          {!firebaseUser ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Please login to practice with your flashcard decks
                </p>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : decks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any decks yet. Create one first!
                </p>
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <Link key={deck.id} href={`/typing/deck/${deck.id}`}>
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {deck.name}
                      </CardTitle>
                      {deck.description && (
                        <CardDescription className="line-clamp-2">
                          {deck.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {deck.sourceLang} → {deck.targetLang}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
