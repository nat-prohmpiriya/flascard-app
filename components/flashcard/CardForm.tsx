'use client';

import { useState } from 'react';
import { Card, CardFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CardFormData) => Promise<void>;
  initialData?: Card;
}

export function CardForm({ open, onClose, onSubmit, initialData }: CardFormProps) {
  const [vocab, setVocab] = useState(initialData?.vocab || '');
  const [pronunciation, setPronunciation] = useState(initialData?.pronunciation || '');
  const [meaning, setMeaning] = useState(initialData?.meaning || '');
  const [example, setExample] = useState(initialData?.example || '');
  const [exampleTranslation, setExampleTranslation] = useState(initialData?.exampleTranslation || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocab.trim() || !meaning.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ vocab, pronunciation, meaning, example, exampleTranslation });
      setVocab('');
      setPronunciation('');
      setMeaning('');
      setExample('');
      setExampleTranslation('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Card' : 'Create New Card'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vocab">Vocabulary *</Label>
                <Input
                  id="vocab"
                  value={vocab}
                  onChange={(e) => setVocab(e.target.value)}
                  placeholder="e.g., lend"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pronunciation">Pronunciation</Label>
                <Input
                  id="pronunciation"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="e.g., /lend/"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meaning">Meaning *</Label>
              <Input
                id="meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="e.g., ให้ยืม"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="example">Example Sentence</Label>
              <Textarea
                id="example"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="e.g., Could you lend me some money?"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exampleTranslation">Example Translation</Label>
              <Textarea
                id="exampleTranslation"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="e.g., คุณช่วยให้ฉันยืมเงินหน่อยได้ไหม?"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !vocab.trim() || !meaning.trim()}>
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
