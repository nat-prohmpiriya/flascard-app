'use client';

import Link from 'next/link';
import { Deck } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Play, Edit, Trash2, FileText } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onEdit: (deck: Deck) => void;
  onDelete: (deck: Deck) => void;
}

export function DeckCard({ deck, onEdit, onDelete }: DeckCardProps) {
  const categoryColors: Record<string, string> = {
    english: 'bg-blue-500',
    programming: 'bg-green-500',
    science: 'bg-purple-500',
    math: 'bg-orange-500',
    language: 'bg-pink-500',
    other: 'bg-gray-500',
  };

  return (
    <Card className="group relative hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{deck.name}</CardTitle>
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
              <DropdownMenuItem onClick={() => onEdit(deck)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/decks/${deck.id}/cards`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Cards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(deck)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Badge className={`${categoryColors[deck.category] || categoryColors.other} text-white w-fit`}>
          {deck.category}
        </Badge>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {deck.description || 'No description'}
        </p>
        <p className="text-sm mt-2">
          <span className="font-semibold">{deck.cardCount}</span> cards
        </p>
      </CardContent>

      <CardFooter className="pt-2">
        <Button asChild className="w-full">
          <Link href={`/study/${deck.id}`}>
            <Play className="mr-2 h-4 w-4" />
            Study
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
