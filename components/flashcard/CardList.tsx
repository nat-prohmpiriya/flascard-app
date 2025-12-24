'use client';

import Image from 'next/image';
import { Card, Language, LANG_TO_TTS } from '@/types';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Volume2 } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  sourceLang?: Language;
  targetLang?: Language;
}

export function CardList({
  cards,
  onEdit,
  onDelete,
  sourceLang = 'en',
  targetLang = 'th'
}: CardListProps) {
  const { speak, isSupported } = useTTS();

  const handleSpeak = (text: string, lang: Language) => {
    speak(text, { lang: LANG_TO_TTS[lang] });
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No cards yet. Create your first card!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {cards.map((card) => (
        <UICard key={card.id} className="group">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image Thumbnail */}
              {card.imageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={card.imageUrl}
                    alt={card.vocab}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}

              <div className="flex-1 grid md:grid-cols-2 gap-4">
                {/* Vocab & Pronunciation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Vocabulary
                    </span>
                    {isSupported && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSpeak(card.vocab, sourceLang)}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-lg font-semibold">{card.vocab}</div>
                  {card.pronunciation && (
                    <div className="text-sm text-muted-foreground">{card.pronunciation}</div>
                  )}
                </div>

                {/* Meaning & Example */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Meaning
                    </span>
                    {isSupported && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSpeak(card.meaning, targetLang)}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-base">{card.meaning}</div>
                  {card.example && (
                    <div className="text-sm text-muted-foreground mt-1 italic line-clamp-2">
                      {card.example}
                    </div>
                  )}
                  {card.exampleTranslation && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {card.exampleTranslation}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(card)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(card)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </UICard>
      ))}
    </div>
  );
}
