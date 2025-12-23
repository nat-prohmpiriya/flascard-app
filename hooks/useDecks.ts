'use client';

import { useState, useEffect, useCallback } from 'react';
import { Deck, DeckFormData } from '@/types';
import {
  getUserDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  deleteAllDecks,
} from '@/services/deck';
import { useAuth } from '@/contexts/AuthContext';

export function useDecks() {
  const { firebaseUser } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    if (!firebaseUser) {
      setDecks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDecks = await getUserDecks(firebaseUser.uid);
      setDecks(userDecks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch decks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const addDeck = async (data: DeckFormData): Promise<Deck | null> => {
    if (!firebaseUser) return null;

    try {
      const newDeck = await createDeck(firebaseUser.uid, data);
      setDecks((prev) => [newDeck, ...prev]);
      return newDeck;
    } catch (err) {
      setError('Failed to create deck');
      console.error(err);
      return null;
    }
  };

  const editDeck = async (deckId: string, data: Partial<DeckFormData>): Promise<boolean> => {
    try {
      await updateDeck(deckId, data);
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId ? { ...deck, ...data, updatedAt: new Date() } : deck
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update deck');
      console.error(err);
      return false;
    }
  };

  const removeDeck = async (deckId: string): Promise<boolean> => {
    try {
      await deleteDeck(deckId);
      setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
      return true;
    } catch (err) {
      setError('Failed to delete deck');
      console.error(err);
      return false;
    }
  };

  const removeAllDecks = async (): Promise<boolean> => {
    if (!firebaseUser) return false;
    try {
      await deleteAllDecks(firebaseUser.uid);
      setDecks([]);
      return true;
    } catch (err) {
      setError('Failed to delete all decks');
      console.error(err);
      return false;
    }
  };

  return {
    decks,
    loading,
    error,
    fetchDecks,
    addDeck,
    editDeck,
    removeDeck,
    removeAllDecks,
  };
}
