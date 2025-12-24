'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { getDeck } from '@/services/deck';
import { getDeckCards } from '@/services/card';
import { Deck, Card as CardType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, Zap, PenLine, Mic, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Game Components
import { ListeningChallenge } from '@/components/games/ListeningChallenge';
import { SpeedQuiz } from '@/components/games/SpeedQuiz';
import { Dictation } from '@/components/games/Dictation';
import { SpeakCheck } from '@/components/games/SpeakCheck';
import { Shadowing } from '@/components/games/Shadowing';

const GAMES = [
  { id: 'listening', name: 'Listening Challenge', icon: Headphones, color: 'bg-blue-500' },
  { id: 'speed-quiz', name: 'Speed Quiz', icon: Zap, color: 'bg-yellow-500' },
  { id: 'dictation', name: 'Dictation', icon: PenLine, color: 'bg-green-500' },
  { id: 'speak-check', name: 'Speak & Check', icon: Mic, color: 'bg-red-500' },
  { id: 'shadowing', name: 'Shadowing', icon: RefreshCw, color: 'bg-purple-500' },
];

export default function DeckGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const deckId = params.deckId as string;
  const initialGame = searchParams.get('game');

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(initialGame);

  useEffect(() => {
    const loadData = async () => {
      if (!firebaseUser || !deckId) return;

      try {
        const [deckData, cardsData] = await Promise.all([
          getDeck(deckId),
          getDeckCards(deckId, firebaseUser.uid),
        ]);

        setDeck(deckData);
        setCards(cardsData);
      } catch (error) {
        console.error('Error loading deck:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [firebaseUser, deckId]);

  const handleGameEnd = () => {
    setSelectedGame(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!deck || cards.length === 0) {
    return (
      <ProtectedRoute>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">No cards available</h2>
          <p className="text-muted-foreground mb-4">
            Add some cards to this deck to start playing games
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  // Render selected game
  if (selectedGame) {
    const gameProps = { cards, deck, onEnd: handleGameEnd };

    return (
      <ProtectedRoute>
        {selectedGame === 'listening' && <ListeningChallenge {...gameProps} />}
        {selectedGame === 'speed-quiz' && <SpeedQuiz {...gameProps} />}
        {selectedGame === 'dictation' && <Dictation {...gameProps} />}
        {selectedGame === 'speak-check' && <SpeakCheck {...gameProps} />}
        {selectedGame === 'shadowing' && <Shadowing {...gameProps} />}
      </ProtectedRoute>
    );
  }

  // Game selection screen
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/games">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground">
              {cards.length} cards available
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <Card
              key={game.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => setSelectedGame(game.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`${game.color} p-4 rounded-xl`}>
                    <game.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{game.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Click to start
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
