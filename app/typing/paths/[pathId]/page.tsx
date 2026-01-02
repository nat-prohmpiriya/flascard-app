'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getTypingPath, updateStageProgress, calculateOverallProgress } from '@/services/typingPath';
import { getTypingSnippet } from '@/services/typingSnippet';
import { TypingPath, TypingPathStage } from '@/types';
import { TypingSnippet, getLanguageById } from '@/models/typingSnippet';
import { TypingArea } from '@/components/typing/TypingArea';
import { TypingStats } from '@/components/typing/TypingStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Trophy,
  Loader2,
  Route,
  Target,
  Gauge,
  CheckCircle2,
  Lock,
  Play,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ pathId: string }>;
}

export default function TypingPathPlayPage({ params }: PageProps) {
  const { pathId } = use(params);
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [path, setPath] = useState<TypingPath | null>(null);
  const [currentStage, setCurrentStage] = useState<TypingPathStage | null>(null);
  const [currentSnippet, setCurrentSnippet] = useState<TypingSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showStageList, setShowStageList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTriggeredRef = useRef(false);

  // Load path and current stage
  useEffect(() => {
    async function loadPath() {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const pathData = await getTypingPath(pathId);
        if (!pathData) {
          toast.error('Path not found');
          router.push('/typing/paths');
          return;
        }
        setPath(pathData);

        // Find active stage
        const activeStage = pathData.stages.find((s) => s.status === 'active');
        if (activeStage) {
          setCurrentStage(activeStage);
          const snippet = await getTypingSnippet(activeStage.snippetId);
          setCurrentSnippet(snippet);
        }
      } catch (error) {
        console.error('Failed to load path:', error);
        toast.error('Failed to load path');
      } finally {
        setLoading(false);
      }
    }

    loadPath();
  }, [firebaseUser, pathId, router]);

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

  const handleSelectStage = async (stage: TypingPathStage) => {
    if (stage.status === 'locked') return;

    setCurrentStage(stage);
    setShowResults(false);
    setShowStageList(false);
    autoSaveTriggeredRef.current = false;
    reset();

    try {
      const snippet = await getTypingSnippet(stage.snippetId);
      setCurrentSnippet(snippet);
    } catch (error) {
      console.error('Failed to load snippet:', error);
      toast.error('Failed to load snippet');
    }
  };

  const handleSaveProgress = async (showToast = true) => {
    if (!path || !currentStage) return;

    setIsSaving(true);
    try {
      const updatedPath = await updateStageProgress(
        path.id,
        currentStage.order,
        stats.wpm,
        stats.accuracy
      );
      setPath(updatedPath);

      // Check if stage was completed
      const updatedStage = updatedPath.stages[currentStage.order];
      if (showToast) {
        if (updatedStage.status === 'completed' && currentStage.status !== 'completed') {
          toast.success('Stage completed! Next stage unlocked.');
        } else {
          toast.success('Progress saved!');
        }
      }

      // Update current stage
      setCurrentStage(updatedStage);
    } catch (error) {
      console.error('Failed to save progress:', error);
      if (showToast) {
        toast.error('Failed to save progress');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when typing is completed
  useEffect(() => {
    const autoSave = async () => {
      if (showResults && path && currentStage && !autoSaveTriggeredRef.current) {
        autoSaveTriggeredRef.current = true;
        await handleSaveProgress(false);
      }
    };
    autoSave();
  }, [showResults]);

  const handleNextStage = async () => {
    if (!path || !currentStage) return;

    const nextStageIndex = currentStage.order + 1;
    if (nextStageIndex >= path.stages.length) {
      toast.success('Congratulations! You completed the path!');
      setShowStageList(true);
      return;
    }

    const nextStage = path.stages[nextStageIndex];
    if (nextStage.status === 'locked') {
      toast.info('Complete current stage to unlock the next one');
      return;
    }

    await handleSelectStage(nextStage);
  };

  const handleRestart = () => {
    setShowResults(false);
    autoSaveTriggeredRef.current = false;
    reset();
  };

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

  if (!path) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Path not found</h1>
        <Button asChild>
          <Link href="/typing/paths">Back to Paths</Link>
        </Button>
      </div>
    );
  }

  const progress = calculateOverallProgress(path);
  const languageInfo = currentSnippet ? getLanguageById(currentSnippet.language) : null;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/typing/paths">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Route className="h-6 w-6" />
              {path.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{path.stages.length} stages</span>
              <span>{progress}% complete</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowStageList(!showStageList)}
        >
          {showStageList ? 'Hide Stages' : 'Show Stages'}
        </Button>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stage List */}
      {showStageList && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stages</CardTitle>
            <CardDescription>Click a stage to practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {path.stages.map((stage, index) => (
                <button
                  key={stage.snippetId}
                  onClick={() => handleSelectStage(stage)}
                  disabled={stage.status === 'locked'}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    stage.status === 'locked'
                      ? 'opacity-50 cursor-not-allowed bg-muted'
                      : currentStage?.order === index
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      <div>
                        <p className="font-medium">{stage.snippetTitle}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{stage.languageName}</span>
                          <span className={getDifficultyColor(stage.difficulty)}>
                            {stage.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {stage.progress.attempts > 0 ? (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            <span>{stage.progress.bestWpm} WPM</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{stage.progress.bestAccuracy}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not started</span>
                      )}
                    </div>
                  </div>
                  {stage.status !== 'locked' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Target: {stage.targetWpm} WPM, {stage.targetAccuracy}% accuracy</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Stage Practice */}
      {currentStage && currentSnippet && !showStageList && (
        <>
          {/* Stage Info */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{currentSnippet.title}</CardTitle>
                  {currentSnippet.description && (
                    <CardDescription>{currentSnippet.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentStage.languageName}</Badge>
                  <Badge className={`${getDifficultyColor(currentStage.difficulty)} bg-transparent`}>
                    {currentStage.difficulty}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>Target: {currentStage.targetWpm} WPM</span>
                <span>Accuracy: {currentStage.targetAccuracy}%</span>
                <span>Attempts: {currentStage.progress.attempts}</span>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Bar */}
          {(isPlaying || isFinished) && <TypingStats stats={stats} />}

          {/* Typing Area */}
          {!showResults && (
            <TypingArea
              text={currentSnippet.code}
              currentIndex={state.currentIndex}
              errors={state.errors}
              userInput={state.userInput}
              isPlaying={isPlaying}
              isCode={languageInfo?.isCode !== false}
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

                {/* Target Check */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      <span>WPM: {stats.wpm}</span>
                      {stats.wpm >= currentStage.targetWpm ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          (need {currentStage.targetWpm})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Accuracy: {stats.accuracy}%</span>
                      {stats.accuracy >= currentStage.targetAccuracy ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          (need {currentStage.targetAccuracy}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={handleRestart} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  {currentStage.order < path.stages.length - 1 && (
                    <Button onClick={handleNextStage} variant="default" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Next Stage
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Idle Controls */}
          {isIdle && !showResults && (
            <div className="flex justify-center">
              <Button onClick={() => setShowStageList(true)} variant="outline">
                Back to Stage List
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
