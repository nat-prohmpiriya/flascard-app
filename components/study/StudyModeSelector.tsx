'use client';

import { Deck } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Headphones, Zap, PenLine, Mic, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export type StudyMode = 'flashcard' | 'listening' | 'speed-quiz' | 'dictation' | 'speak' | 'shadowing';

interface StudyModeOption {
  id: StudyMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const STUDY_MODES: StudyModeOption[] = [
  {
    id: 'flashcard',
    name: 'Flashcard',
    description: 'Classic spaced repetition review',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    id: 'listening',
    name: 'Listening',
    description: 'Listen and choose the correct meaning',
    icon: <Headphones className="h-8 w-8" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
  },
  {
    id: 'speed-quiz',
    name: 'Speed Quiz',
    description: 'Time-limited quick recall challenge',
    icon: <Zap className="h-8 w-8" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
  },
  {
    id: 'dictation',
    name: 'Dictation',
    description: 'Listen and type what you hear',
    icon: <PenLine className="h-8 w-8" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
  {
    id: 'speak',
    name: 'Speak & Check',
    description: 'Practice pronunciation with feedback',
    icon: <Mic className="h-8 w-8" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
  },
  {
    id: 'shadowing',
    name: 'Shadowing',
    description: 'Listen, repeat, and compare',
    icon: <RefreshCw className="h-8 w-8" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
  },
];

interface StudyModeSelectorProps {
  deck: Deck;
  onSelectMode: (mode: StudyMode) => void;
}

export function StudyModeSelector({ deck, onSelectMode }: StudyModeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{deck.name}</h1>
        <p className="text-muted-foreground">
          {deck.cardCount} cards · Choose a study mode
        </p>
      </div>

      {/* Mode Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STUDY_MODES.map((mode) => (
          <Card
            key={mode.id}
            className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
            onClick={() => onSelectMode(mode.id)}
          >
            <CardContent className="p-6">
              <div className={`w-16 h-16 rounded-xl ${mode.bgColor} flex items-center justify-center mb-4`}>
                <span className={mode.color}>{mode.icon}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{mode.name}</h3>
              <p className="text-sm text-muted-foreground">{mode.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
