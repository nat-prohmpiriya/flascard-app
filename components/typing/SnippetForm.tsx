'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createTypingSnippet, updateTypingSnippet } from '@/services/typingSnippet';
import { TypingSnippet, TypingSnippetFormData, SUPPORTED_LANGUAGES } from '@/models/typingSnippet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SnippetFormProps {
  snippet?: TypingSnippet;
  onSuccess?: () => void;
}

export function SnippetForm({ snippet, onSuccess }: SnippetFormProps) {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const isEditing = !!snippet;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TypingSnippetFormData>({
    language: snippet?.language || 'javascript',
    languageName: snippet?.languageName || 'JavaScript',
    title: snippet?.title || '',
    description: snippet?.description || '',
    code: snippet?.code || '',
    difficulty: snippet?.difficulty || 'medium',
    isPublic: snippet?.isPublic || false,
  });

  const handleLanguageChange = (languageId: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.id === languageId);
    setFormData((prev) => ({
      ...prev,
      language: languageId,
      languageName: lang?.name || languageId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firebaseUser) {
      toast.error('Please login first');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.code.trim()) {
      toast.error('Please enter code');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && snippet) {
        await updateTypingSnippet(snippet.id, formData);
        toast.success('Snippet updated!');
      } else {
        await createTypingSnippet(firebaseUser.uid, formData);
        toast.success('Snippet created!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/typing/snippets');
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      toast.error('Failed to save snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Snippet' : 'Create New Snippet'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={formData.language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                      {lang.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Hello World, useState Hook"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Explain what this code does or what you're practicing..."
              className="min-h-[80px]"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, difficulty: v as 'easy' | 'medium' | 'hard' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <span className="text-green-600">Easy</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="text-yellow-600">Medium</span>
                </SelectItem>
                <SelectItem value="hard">
                  <span className="text-red-600">Hard</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Textarea
              id="code"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="Paste your code here..."
              className="font-mono min-h-[200px]"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Share publicly</Label>
              <p className="text-sm text-muted-foreground">
                Others can practice with this snippet
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
