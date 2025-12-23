'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/types';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTTS } from '@/hooks/useTTS';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  showAudio?: boolean;
}

export function FlashCard({ card, isFlipped, onFlip, showAudio = true }: FlashCardProps) {
  const { speakEnglish, stop, isSpeaking, isSupported } = useTTS();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    onFlip();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      // Remove markdown and speak plain text
      const plainText = text.replace(/[#*`>\[\]()_~]/g, '').trim();
      speakEnglish(plainText);
    }
  };

  return (
    <div
      className="relative w-full max-w-lg mx-auto perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn(
          'relative w-full min-h-[300px] transition-transform duration-300 transform-style-preserve-3d cursor-pointer',
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={handleFlip}
      >
        {/* Front */}
        <UICard
          className="absolute inset-0 w-full min-h-[300px] flex flex-col backface-hidden p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-muted-foreground">Front</span>
            {showAudio && isSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleSpeak(card.front, e)}
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="prose dark:prose-invert max-w-none text-center">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {card.front}
              </ReactMarkdown>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-sm text-muted-foreground">Click to flip</span>
          </div>
        </UICard>

        {/* Back */}
        <UICard
          className="absolute inset-0 w-full min-h-[300px] flex flex-col backface-hidden p-6 rotate-y-180"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-muted-foreground">Back</span>
            <div className="flex gap-2">
              {showAudio && isSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleSpeak(card.back, e)}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {card.back}
              </ReactMarkdown>
            </div>
          </div>
        </UICard>
      </div>
    </div>
  );
}
