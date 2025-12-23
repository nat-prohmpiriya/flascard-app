'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardFormData } from '@/types';
import {
  getDeckCards,
  createCard,
  updateCard,
  deleteCard,
  bulkCreateCards,
} from '@/services/card';
import { useAuth } from '@/contexts/AuthContext';

export function useCards(deckId: string | null) {
  const { firebaseUser } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!deckId || !firebaseUser) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const deckCards = await getDeckCards(deckId, firebaseUser.uid);
      setCards(deckCards);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deckId, firebaseUser]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = async (data: CardFormData): Promise<Card | null> => {
    if (!firebaseUser || !deckId) return null;

    try {
      const newCard = await createCard(firebaseUser.uid, deckId, data);
      setCards((prev) => [newCard, ...prev]);
      return newCard;
    } catch (err) {
      setError('Failed to create card');
      console.error(err);
      return null;
    }
  };

  const editCard = async (cardId: string, data: Partial<CardFormData>): Promise<boolean> => {
    try {
      await updateCard(cardId, data);
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, ...data, updatedAt: new Date() } : card
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update card');
      console.error(err);
      return false;
    }
  };

  const removeCard = async (cardId: string): Promise<boolean> => {
    if (!deckId) return false;

    try {
      await deleteCard(cardId, deckId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      return true;
    } catch (err) {
      setError('Failed to delete card');
      console.error(err);
      return false;
    }
  };

  const importCards = async (cardsData: CardFormData[]): Promise<boolean> => {
    if (!firebaseUser || !deckId) return false;

    try {
      await bulkCreateCards(firebaseUser.uid, deckId, cardsData);
      await fetchCards();
      return true;
    } catch (err) {
      setError('Failed to import cards');
      console.error(err);
      return false;
    }
  };

  return {
    cards,
    loading,
    error,
    fetchCards,
    addCard,
    editCard,
    removeCard,
    importCards,
  };
}
