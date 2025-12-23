'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedTime: number; // in seconds
}

export interface TypingGameState {
  status: 'idle' | 'playing' | 'finished';
  currentIndex: number;
  userInput: string;
  errors: Set<number>;
  startTime: number | null;
  endTime: number | null;
}

interface UseTypingGameOptions {
  text: string;
  onComplete?: (stats: TypingStats) => void;
}

export function useTypingGame({ text, onComplete }: UseTypingGameOptions) {
  const [state, setState] = useState<TypingGameState>({
    status: 'idle',
    currentIndex: 0,
    userInput: '',
    errors: new Set(),
    startTime: null,
    endTime: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate stats
  const calculateStats = useCallback((): TypingStats => {
    const correctChars = state.currentIndex - state.errors.size;
    const incorrectChars = state.errors.size;
    const totalChars = state.currentIndex;
    const time = elapsedTime || 1; // Avoid division by zero

    // WPM = (characters / 5) / minutes
    const minutes = time / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;

    // Accuracy = correct / total * 100
    const accuracy = totalChars > 0
      ? Math.round((correctChars / totalChars) * 100)
      : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      elapsedTime: time,
    };
  }, [state.currentIndex, state.errors.size, elapsedTime]);

  // Start the game
  const start = useCallback(() => {
    setState({
      status: 'playing',
      currentIndex: 0,
      userInput: '',
      errors: new Set(),
      startTime: Date.now(),
      endTime: null,
    });
    setElapsedTime(0);
  }, []);

  // Reset the game
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState({
      status: 'idle',
      currentIndex: 0,
      userInput: '',
      errors: new Set(),
      startTime: null,
      endTime: null,
    });
    setElapsedTime(0);
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    if (state.status !== 'playing') return;

    setState((prev) => {
      const expectedChar = text[prev.currentIndex];
      const isCorrect = key === expectedChar;
      const newErrors = new Set(prev.errors);

      if (!isCorrect) {
        newErrors.add(prev.currentIndex);
      }

      const newIndex = prev.currentIndex + 1;
      const isFinished = newIndex >= text.length;

      if (isFinished) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }

      return {
        ...prev,
        status: isFinished ? 'finished' : 'playing',
        currentIndex: newIndex,
        userInput: prev.userInput + key,
        errors: newErrors,
        endTime: isFinished ? Date.now() : null,
      };
    });
  }, [state.status, text]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (state.status !== 'playing') return;

    setState((prev) => {
      if (prev.currentIndex === 0) return prev;

      const newIndex = prev.currentIndex - 1;
      const newErrors = new Set(prev.errors);
      newErrors.delete(newIndex); // Remove error at previous position if exists

      return {
        ...prev,
        currentIndex: newIndex,
        userInput: prev.userInput.slice(0, -1),
        errors: newErrors,
      };
    });
  }, [state.status]);

  // Timer effect
  useEffect(() => {
    if (state.status === 'playing') {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status]);

  // Call onComplete when finished
  useEffect(() => {
    if (state.status === 'finished' && onComplete) {
      onComplete(calculateStats());
    }
  }, [state.status, onComplete, calculateStats]);

  return {
    state,
    stats: calculateStats(),
    elapsedTime,
    start,
    reset,
    handleKeyPress,
    handleBackspace,
    text,
    isPlaying: state.status === 'playing',
    isFinished: state.status === 'finished',
    isIdle: state.status === 'idle',
  };
}
