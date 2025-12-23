'use client';

import { useState } from 'react';
import { Card, CardFormData } from '@/types';
import { Button } from '@/components/ui/button';
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
  const [front, setFront] = useState(initialData?.front || '');
  const [back, setBack] = useState(initialData?.back || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ front, back });
      setFront('');
      setBack('');
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
            <div className="grid gap-2">
              <Label htmlFor="front">
                Front <span className="text-muted-foreground">(supports Markdown)</span>
              </Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="e.g., What does 'ephemeral' mean?"
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="back">
                Back <span className="text-muted-foreground">(supports Markdown)</span>
              </Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="e.g., ## Ephemeral&#10;*adjective*&#10;&#10;Lasting for a very short time.&#10;&#10;**Example:** The ephemeral beauty of cherry blossoms."
                rows={6}
                required
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Markdown tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code>**bold**</code> for <strong>bold</strong></li>
                <li><code>*italic*</code> for <em>italic</em></li>
                <li><code>`code`</code> for <code>code</code></li>
                <li><code>## Heading</code> for headings</li>
                <li><code>- item</code> for lists</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !front.trim() || !back.trim()}>
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
