'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getSnippetsByLanguage } from '@/services/typingSnippet';
import { TypingSnippet, getLanguageById } from '@/models/typingSnippet';
import { TypingArea } from '@/components/typing/TypingArea';
import { TypingStats } from '@/components/typing/TypingStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, RotateCcw, Shuffle, Trophy, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default function CodeTypingPage({ params }: PageProps) {
  const { lang } = use(params);
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const languageInfo = getLanguageById(lang);

  const [snippets, setSnippets] = useState<TypingSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string>('all');
  const [currentSnippet, setCurrentSnippet] = useState<TypingSnippet | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load snippets
  useEffect(() => {
    async function loadSnippets() {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSnippetsByLanguage(firebaseUser.uid, lang);
        setSnippets(data);
        if (data.length > 0) {
          setCurrentSnippet(data[0]);
        }
      } catch (error) {
        console.error('Failed to load snippets:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSnippets();
  }, [firebaseUser, lang]);

  // Filter snippets by difficulty
  const filteredSnippets = difficulty === 'all'
    ? snippets
    : snippets.filter((s) => s.difficulty === difficulty);

  const {
    state,
    stats,
    start,
    reset,
    handleKeyPress,
    handleBackspace,
    isPlaying,
    isFinished,
    isIdle,
  } = useTypingGame({
    text: currentSnippet?.code || '',
    onComplete: () => setShowResults(true),
  });

  if (!firebaseUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please login to continue</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/typing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {languageInfo?.name || lang}
          </h1>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No snippets for this language</h3>
            <p className="text-muted-foreground mb-4">
              Create some snippets to start practicing!
            </p>
            <Button asChild>
              <Link href="/typing/snippets/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Snippet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleNewSnippet = () => {
    const available = filteredSnippets.length > 0 ? filteredSnippets : snippets;
    const randomIndex = Math.floor(Math.random() * available.length);
    setCurrentSnippet(available[randomIndex]);
    setShowResults(false);
    reset();
  };

  const handleRestart = () => {
    setShowResults(false);
    reset();
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    const filtered = value === 'all' ? snippets : snippets.filter((s) => s.difficulty === value);
    if (filtered.length > 0) {
      setCurrentSnippet(filtered[0]);
    }
    setShowResults(false);
    reset();
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/typing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span
              className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: languageInfo?.color || '#6B7280' }}
            >
              {(languageInfo?.name || lang).slice(0, 2)}
            </span>
            <div>
              <h1 className="text-2xl font-bold">{languageInfo?.name || lang}</h1>
              <p className="text-sm text-muted-foreground">
                {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <Select value={difficulty} onValueChange={handleDifficultyChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Bar */}
      {(isPlaying || isFinished) && <TypingStats stats={stats} />}

      {/* Snippet Info */}
      {currentSnippet && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentSnippet.title}</CardTitle>
              <Badge className={getDifficultyColor(currentSnippet.difficulty)}>
                {currentSnippet.difficulty}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Typing Area */}
      {currentSnippet && !showResults && (
        <TypingArea
          text={currentSnippet.code}
          currentIndex={state.currentIndex}
          errors={state.errors}
          userInput={state.userInput}
          isPlaying={isPlaying}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onStart={start}
        />
      )}

      {/* Results */}
      {showResults && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TypingStats stats={stats} showDetailed />

            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleNewSnippet}>
                <Shuffle className="h-4 w-4 mr-2" />
                New Snippet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      {isIdle && !showResults && (
        <div className="flex justify-center gap-4">
          <Button onClick={handleNewSnippet} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Random Snippet
          </Button>
        </div>
      )}
    </div>
  );
}
