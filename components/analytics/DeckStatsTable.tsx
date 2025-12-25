'use client';

import { useState } from 'react';
import { DeckStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatStudyTime } from '@/services/analytics';
import {
  BookOpen,
  ArrowUpDown,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

interface DeckStatsTableProps {
  decks: DeckStats[];
}

type SortField = 'name' | 'progress' | 'accuracy' | 'lastStudied';
type SortOrder = 'asc' | 'desc';

export function DeckStatsTable({ decks }: DeckStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('lastStudied');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expanded, setExpanded] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedDecks = [...decks].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.deckName.localeCompare(b.deckName);
        break;
      case 'progress':
        const progressA =
          a.totalCards > 0 ? (a.cardsMastered / a.totalCards) * 100 : 0;
        const progressB =
          b.totalCards > 0 ? (b.cardsMastered / b.totalCards) * 100 : 0;
        comparison = progressA - progressB;
        break;
      case 'accuracy':
        comparison = a.averageAccuracy - b.averageAccuracy;
        break;
      case 'lastStudied':
        const dateA = a.lastStudied?.getTime() || 0;
        const dateB = b.lastStudied?.getTime() || 0;
        comparison = dateA - dateB;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const displayedDecks = expanded ? sortedDecks : sortedDecks.slice(0, 5);

  if (decks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Deck Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No decks available
          </div>
        </CardContent>
      </Card>
    );
  }

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown className="h-3 w-3" />
      )}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Deck Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b">
                <th className="pb-3 font-medium">
                  <SortButton field="name">Deck</SortButton>
                </th>
                <th className="pb-3 font-medium">
                  <SortButton field="progress">Progress</SortButton>
                </th>
                <th className="pb-3 font-medium">
                  <SortButton field="accuracy">Accuracy</SortButton>
                </th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">
                  <SortButton field="lastStudied">Last Studied</SortButton>
                </th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {displayedDecks.map((deck) => {
                const progress =
                  deck.totalCards > 0
                    ? Math.round((deck.cardsMastered / deck.totalCards) * 100)
                    : 0;

                return (
                  <tr key={deck.deckId} className="border-b last:border-0">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{deck.deckName}</p>
                        <p className="text-xs text-muted-foreground">
                          {deck.totalCards} cards
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{deck.cardsMastered} mastered</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          deck.averageAccuracy >= 80
                            ? 'default'
                            : deck.averageAccuracy >= 60
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {deck.averageAccuracy}%
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {formatStudyTime(deck.studyTime)}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {deck.lastStudied
                        ? deck.lastStudied.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Never'}
                    </td>
                    <td className="py-3">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/study/${deck.deckId}`}>
                          <Play className="h-3 w-3 mr-1" />
                          Study
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedDecks.length > 5 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show All ({sortedDecks.length} decks)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
