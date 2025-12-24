'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/hooks/useDecks';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, Zap, PenLine, Mic, RefreshCw, BookOpen, ArrowRight } from 'lucide-react';
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

export default function GamesPage() {
  const { firebaseUser } = useAuth();
  const { decks, loading } = useDecks();

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Language Games</h1>
          <p className="text-muted-foreground">
            Practice listening and speaking with interactive games
          </p>
        </div>

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
                ) : decks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Create a deck first to play
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select a deck:</p>
                    <div className="flex flex-wrap gap-2">
                      {decks.slice(0, 3).map((deck) => (
                        <Link
                          key={deck.id}
                          href={`/games/deck/${deck.id}?game=${game.id}`}
                        >
                          <Button variant="outline" size="sm" className="text-xs">
                            {deck.name.length > 15 ? deck.name.slice(0, 15) + '...' : deck.name}
                          </Button>
                        </Link>
                      ))}
                      {decks.length > 3 && (
                        <Link href={`/games/select?game=${game.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            +{decks.length - 3} more
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

        {/* Quick Start with All Cards */}
        {decks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Decks
              </CardTitle>
              <CardDescription>
                Select a deck to start playing games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {decks.map((deck) => (
                  <Link key={deck.id} href={`/games/deck/${deck.id}`}>
                    <div className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                      <p className="font-medium truncate">{deck.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deck.cardCount} cards
                      </p>
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
