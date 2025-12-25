'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  banUser,
  getPublicDecks,
  updateDeckStatus,
  getAdminStats,
  AdminUser,
  PublicDeck,
  DeckStatus,
  AdminStats,
} from '@/services/admin';
import { UserRole } from '@/types';

export function useIsAdmin() {
  const { user, loading } = useAuth();

  return {
    isAdmin: user?.role === 'admin',
    loading,
  };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUser = useCallback(async (userId: string) => {
    return await getUserById(userId);
  }, []);

  const setUserRole = useCallback(async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
    setUsers((prev) =>
      prev.map((u) => (u.uid === userId ? { ...u, role } : u))
    );
  }, []);

  const setBanStatus = useCallback(async (userId: string, banned: boolean) => {
    await banUser(userId, banned);
    setUsers((prev) =>
      prev.map((u) => (u.uid === userId ? { ...u, isBanned: banned } : u))
    );
  }, []);

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    getUser,
    setUserRole,
    setBanStatus,
  };
}

export function useAdminDecks() {
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async (status?: DeckStatus) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicDecks(status);
      setDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch decks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const setDeckStatus = useCallback(async (deckId: string, status: DeckStatus) => {
    await updateDeckStatus(deckId, status);
    setDecks((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, status } : d))
    );
  }, []);

  return {
    decks,
    loading,
    error,
    refresh: fetchDecks,
    setDeckStatus,
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
