'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/hooks/useDecks';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Headphones, Zap, PenLine, Mic, RefreshCw, BookOpen, Filter, X } from 'lucide-react';
import Link from 'next/link';

const GAMES = [
  {
    id: 'listening',
    name: 'Listening Challenge',
    description: 'Listen to audio and select the correct answer',
    icon: Headphones,
    color: 'bg-blue-500',
    focus: 'Listening comprehension',
  },
  {
    id: 'speed-quiz',
    name: 'Speed Quiz',
    description: 'Listen and choose from 4 options with timer',
    icon: Zap,
    color: 'bg-yellow-500',
    focus: 'Quick recall',
  },
  {
    id: 'dictation',
    name: 'Dictation',
    description: 'Listen and type what you hear',
    icon: PenLine,
    color: 'bg-green-500',
    focus: 'Listening + Spelling',
  },
  {
    id: 'speak-check',
    name: 'Speak & Check',
    description: 'See the word and speak it out loud',
    icon: Mic,
    color: 'bg-red-500',
    focus: 'Pronunciation',
  },
  {
    id: 'shadowing',
    name: 'Shadowing Mode',
    description: 'Listen, repeat, and compare',
    icon: RefreshCw,
    color: 'bg-purple-500',
    focus: 'Fluency + Accent',
  },
];

// Tag color mapping
const TAG_COLORS: Record<string, string> = {
  english: 'bg-blue-100 text-blue-800',
  A1: 'bg-green-100 text-green-800',
  A2: 'bg-green-200 text-green-800',
  B1: 'bg-yellow-100 text-yellow-800',
  B2: 'bg-yellow-200 text-yellow-800',
  C1: 'bg-orange-100 text-orange-800',
  C2: 'bg-red-100 text-red-800',
  vocabulary: 'bg-purple-100 text-purple-800',
  'phrasal-verb': 'bg-pink-100 text-pink-800',
  collocation: 'bg-indigo-100 text-indigo-800',
  phrase: 'bg-cyan-100 text-cyan-800',
  grammar: 'bg-teal-100 text-teal-800',
  programming: 'bg-gray-100 text-gray-800',
};

export default function GamesPage() {
  const { firebaseUser } = useAuth();
  const { decks, loading } = useDecks();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags from decks
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    decks.forEach((deck) => {
      deck.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [decks]);

  // Filter decks by selected tags
  const filteredDecks = useMemo(() => {
    if (selectedTags.length === 0) return decks;
    return decks.filter((deck) =>
      selectedTags.every((tag) => deck.tags?.includes(tag))
    );
  }, [decks, selectedTags]);

  // Total cards in filtered decks
  const totalCards = useMemo(() => {
    return filteredDecks.reduce((sum, deck) => sum + deck.cardCount, 0);
  }, [filteredDecks]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Language Games</h1>
          <p className="text-muted-foreground">
            Practice listening and speaking with interactive games
          </p>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter by Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      selectedTags.includes(tag)
                        ? ''
                        : TAG_COLORS[tag] || 'bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found: <span className="font-medium">{filteredDecks.length} decks</span> ({totalCards} cards)
                  </p>
                  <Button variant="ghost" size="sm" onClick={clearTags}>
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`${game.color} p-3 rounded-lg`}>
                    <game.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Focus: <span className="font-medium text-foreground">{game.focus}</span>
                </p>
                {loading ? (
                  <div className="animate-pulse h-10 bg-muted rounded"></div>
                ) : filteredDecks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {decks.length === 0 ? 'Create a deck first' : 'No decks match filters'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select a deck:</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredDecks.slice(0, 3).map((deck) => (
                        <Link
                          key={deck.id}
                          href={`/games/deck/${deck.id}?game=${game.id}`}
                        >
                          <Button variant="outline" size="sm" className="text-xs">
                            {deck.name.length > 15 ? deck.name.slice(0, 15) + '...' : deck.name}
                          </Button>
                        </Link>
                      ))}
                      {filteredDecks.length > 3 && (
                        <Link href={`/games/select?game=${game.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            +{filteredDecks.length - 3} more
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtered Decks */}
        {filteredDecks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {selectedTags.length > 0 ? 'Filtered Decks' : 'All Decks'}
              </CardTitle>
              <CardDescription>
                {filteredDecks.length} deck(s) - {totalCards} cards total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {filteredDecks.map((deck) => (
                  <Link key={deck.id} href={`/games/deck/${deck.id}`}>
                    <div className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                      <p className="font-medium truncate">{deck.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {deck.cardCount} cards
                      </p>
                      {deck.tags && deck.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {deck.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={`text-xs ${TAG_COLORS[tag] || ''}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
