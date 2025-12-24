'use client';

import Image from 'next/image';
import { Card, Language, LANG_TO_TTS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Volume2 } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface CardTableProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  sourceLang?: Language;
  targetLang?: Language;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function CardTable({
  cards,
  onEdit,
  onDelete,
  sourceLang = 'en',
  targetLang = 'th'
}: CardTableProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Vocabulary</TableHead>
            <TableHead className="w-[25%]">Meaning</TableHead>
            <TableHead className="w-[30%]">Example</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>
                <div className="flex items-start gap-2">
                  {card.imageUrl && (
                    <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                      <Image
                        src={card.imageUrl}
                        alt={card.vocab}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}
                  {isSupported && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 mt-0.5"
                      onClick={() => handleSpeak(card.vocab, sourceLang)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                  <div>
                    <div className="font-medium">{card.vocab}</div>
                    {card.pronunciation && (
                      <div className="text-xs text-muted-foreground">{card.pronunciation}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  {isSupported && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 mt-0.5"
                      onClick={() => handleSpeak(card.meaning, targetLang)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                  <div className="line-clamp-2">{card.meaning}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {card.example && (
                    <div className="italic line-clamp-1">{card.example}</div>
                  )}
                  {card.exampleTranslation && (
                    <div className="line-clamp-1">{card.exampleTranslation}</div>
                  )}
                  {!card.example && !card.exampleTranslation && '-'}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(card.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
