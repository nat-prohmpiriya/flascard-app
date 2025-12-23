'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTypingSnippet } from '@/services/typingSnippet';
import { TypingSnippet } from '@/models/typingSnippet';
import { SnippetForm } from '@/components/typing/SnippetForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSnippetPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [snippet, setSnippet] = useState<TypingSnippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSnippet() {
      try {
        const data = await getTypingSnippet(id);
        setSnippet(data);
      } catch (error) {
        console.error('Failed to load snippet:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSnippet();
  }, [id]);

  if (!firebaseUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please login to edit snippets</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Snippet not found</h1>
        <Button asChild>
          <Link href="/typing/snippets">Back to Snippets</Link>
        </Button>
      </div>
    );
  }

  // Check if user owns this snippet
  if (snippet.userId !== firebaseUser.uid) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">You cannot edit this snippet</h1>
        <Button asChild>
          <Link href="/typing/snippets">Back to Snippets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/typing/snippets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Snippet</h1>
      </div>

      <SnippetForm snippet={snippet} />
    </div>
  );
}
