'use client';

import { useState } from 'react';
import { Card, Language, LANG_TO_TTS } from '@/types';
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
  sourceLang?: Language;
  targetLang?: Language;
}

export function FlashCard({
  card,
  isFlipped,
  onFlip,
  showAudio = true,
  sourceLang = 'en',
  targetLang = 'th'
}: FlashCardProps) {
  const { speak, stop, isSpeaking, isSupported } = useTTS();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    onFlip();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSpeak = (text: string, lang: Language, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      const plainText = text.replace(/[#*`>\[\]()_~]/g, '').trim();
      speak(plainText, { lang: LANG_TO_TTS[lang] });
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
        {/* Front - Vocab & Pronunciation */}
        <UICard
          className="absolute inset-0 w-full min-h-[300px] flex flex-col backface-hidden p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-muted-foreground">Vocabulary</span>
            {showAudio && isSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleSpeak(card.vocab, sourceLang, e)}
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold mb-2">{card.vocab}</span>
            {card.pronunciation && (
              <span className="text-lg text-muted-foreground">{card.pronunciation}</span>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-sm text-muted-foreground">Click to flip</span>
          </div>
        </UICard>

        {/* Back - Meaning & Example */}
        <UICard
          className="absolute inset-0 w-full min-h-[300px] flex flex-col backface-hidden p-6 rotate-y-180"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-muted-foreground">Meaning</span>
            <div className="flex gap-2">
              {showAudio && isSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleSpeak(card.meaning, targetLang, e)}
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
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <span className="text-2xl font-semibold text-center">{card.meaning}</span>
            {(card.example || card.exampleTranslation) && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground block mb-1">Example:</span>
                {card.example && (
                  <div className="flex items-center justify-center">
                    <span className="text-base italic">{card.example}</span>
                    {showAudio && isSupported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1"
                        onClick={(e) => handleSpeak(card.example, sourceLang, e)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {card.exampleTranslation && (
                  <div className="flex items-center justify-center mt-1">
                    <span className="text-sm text-muted-foreground">{card.exampleTranslation}</span>
                    {showAudio && isSupported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1"
                        onClick={(e) => handleSpeak(card.exampleTranslation, targetLang, e)}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </UICard>
      </div>
    </div>
  );
}
