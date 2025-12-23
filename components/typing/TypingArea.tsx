'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TypingAreaProps {
  text: string;
  currentIndex: number;
  errors: Set<number>;
  userInput: string;
  isPlaying: boolean;
  isCode?: boolean;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onStart: () => void;
}

export function TypingArea({
  text,
  currentIndex,
  errors,
  userInput,
  isPlaying,
  isCode = true,
  onKeyPress,
  onBackspace,
  onStart,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus on container when playing
  useEffect(() => {
    if (isPlaying && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isPlaying]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      // Escape - do nothing
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }

      // Backspace - go back
      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        return;
      }

      // Tab - convert to spaces (check what the expected char is)
      if (e.key === 'Tab') {
        e.preventDefault();
        // Get expected characters from current position
        const expectedChar = text[currentIndex];
        if (expectedChar === '\t') {
          onKeyPress('\t');
        } else {
          // Type spaces for tab (common: 2 or 4 spaces)
          const spacesToType = text.slice(currentIndex, currentIndex + 4);
          const spaceCount = spacesToType.split('').filter(c => c === ' ').length;
          for (let i = 0; i < Math.min(spaceCount, 4); i++) {
            if (text[currentIndex + i] === ' ') {
              onKeyPress(' ');
            }
          }
        }
        return;
      }

      // Only process printable characters and special typing keys
      if (e.key.length === 1 || e.key === 'Enter') {
        e.preventDefault();
        const key = e.key === 'Enter' ? '\n' : e.key;
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onKeyPress, onBackspace, text, currentIndex]);

  // Render character with styling
  const renderChar = (char: string, index: number) => {
    const isTyped = index < currentIndex;
    const isCurrent = index === currentIndex;
    const isError = errors.has(index);
    const displayChar = char === '\n' ? '↵\n' : char === ' ' ? '\u00A0' : char;

    return (
      <span
        key={index}
        className={cn(
          'transition-colors duration-75',
          // Current character - cursor
          isCurrent && 'bg-primary/30 border-l-2 border-primary animate-pulse',
          // Typed correctly
          isTyped && !isError && 'text-green-500 dark:text-green-400',
          // Typed incorrectly
          isTyped && isError && 'text-red-500 dark:text-red-400 bg-red-500/20',
          // Not yet typed
          !isTyped && !isCurrent && 'text-muted-foreground'
        )}
      >
        {displayChar}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={() => !isPlaying && onStart()}
      className={cn(
        'relative p-6 rounded-lg border-2 text-lg leading-relaxed',
        isCode ? 'font-mono whitespace-pre-wrap' : 'font-sans whitespace-pre-wrap',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        'bg-card text-card-foreground',
        !isPlaying && 'cursor-pointer hover:border-primary/50',
        isPlaying && 'border-primary'
      )}
    >
      {!isPlaying && currentIndex === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <p className="text-xl text-muted-foreground">
            Click here or press any key to start
          </p>
        </div>
      )}
      <div className="select-none">
        {text.split('').map((char, index) => renderChar(char, index))}
      </div>
    </div>
  );
}
