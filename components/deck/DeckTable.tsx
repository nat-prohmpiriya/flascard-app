'use client';

import Link from 'next/link';
import { Deck } from '@/types';
import { Badge } from '@/components/ui/badge';
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
import { MoreVertical, Play, Edit, Trash2, FileText } from 'lucide-react';

interface DeckTableProps {
  decks: Deck[];
  onEdit: (deck: Deck) => void;
  onDelete: (deck: Deck) => void;
}

const categoryColors: Record<string, string> = {
  english: 'bg-blue-500',
  programming: 'bg-green-500',
  science: 'bg-purple-500',
  math: 'bg-orange-500',
  language: 'bg-pink-500',
  other: 'bg-gray-500',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function DeckTable({ decks, onEdit, onDelete }: DeckTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Cards</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decks.map((deck) => (
            <TableRow key={deck.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{deck.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {deck.description || 'No description'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${categoryColors[deck.category] || categoryColors.other} text-white`}>
                  {deck.category}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{deck.cardCount}</TableCell>
              <TableCell>{formatDate(deck.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild size="sm">
                    <Link href={`/study/${deck.id}`}>
                      <Play className="mr-1 h-3 w-3" />
                      Study
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
