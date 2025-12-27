'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TypingSnippet } from '@/models/typingSnippet';
import { getAvailableSnippets, getUserSnippets } from '@/services/typingSnippet';
import { useAuth } from '@/contexts/AuthContext';

export function useTypingSnippets(userOnly: boolean = false) {
  const { firebaseUser } = useAuth();
  const [snippets, setSnippets] = useState<TypingSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnippets = useCallback(async () => {
    if (!firebaseUser) {
      setSnippets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = userOnly
        ? await getUserSnippets(firebaseUser.uid)
        : await getAvailableSnippets(firebaseUser.uid);
      setSnippets(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch snippets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, userOnly]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Group by language
  const snippetsByLanguage = useMemo(() => {
    const grouped: Record<string, TypingSnippet[]> = {};
    snippets.forEach((s) => {
      if (!grouped[s.language]) {
        grouped[s.language] = [];
      }
      grouped[s.language].push(s);
    });
    return grouped;
  }, [snippets]);

  // Popular snippets (most recent, limited)
  const popularSnippets = useMemo(
    () => [...snippets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [snippets]
  );

  return {
    snippets,
    snippetsByLanguage,
    popularSnippets,
    loading,
    error,
    refresh: fetchSnippets,
  };
}
