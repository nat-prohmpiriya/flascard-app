'use client';

import Link from 'next/link';
import { TypingSnippet, getLanguageById } from '@/models/typingSnippet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { MoreVertical, Play, Pencil, Trash2, Globe, Lock } from 'lucide-react';

interface SnippetTableProps {
  snippets: TypingSnippet[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-600',
  medium: 'bg-yellow-500/10 text-yellow-600',
  hard: 'bg-red-500/10 text-red-600',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function SnippetTable({ snippets, selectedIds, onToggleSelect, onDelete }: SnippetTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-center">Visibility</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snippets.map((snippet) => {
            const lang = getLanguageById(snippet.language);
            const isSelected = selectedIds.has(snippet.id);
            return (
              <TableRow key={snippet.id} className={isSelected ? 'bg-muted/50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(snippet.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{snippet.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {snippet.description || (
                        <span className={lang?.isCode !== false ? 'font-mono' : ''}>
                          {snippet.code.slice(0, 50)}{snippet.code.length > 50 ? '...' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: lang?.color || '#6B7280' }}
                    >
                      {snippet.languageName.slice(0, 2)}
                    </span>
                    <span>{snippet.languageName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={difficultyColors[snippet.difficulty]}>
                    {snippet.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {snippet.isPublic ? (
                    <Globe className="h-4 w-4 text-muted-foreground mx-auto" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell>{formatDate(snippet.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm">
                      <Link href={`/typing/code/${snippet.language}`}>
                        <Play className="mr-1 h-3 w-3" />
                        Practice
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/typing/snippets/${snippet.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(snippet.id)}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
