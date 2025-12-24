'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
import { validateImageFile, createImagePreview, revokeImagePreview } from '@/services/storage';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CardFormData, imageFile?: File | null, removeImage?: boolean) => Promise<void>;
  initialData?: Card;
  isUploadingImage?: boolean;
}

export function CardForm({ open, onClose, onSubmit, initialData, isUploadingImage }: CardFormProps) {
  const [vocab, setVocab] = useState(initialData?.vocab || '');
  const [pronunciation, setPronunciation] = useState(initialData?.pronunciation || '');
  const [meaning, setMeaning] = useState(initialData?.meaning || '');
  const [example, setExample] = useState(initialData?.example || '');
  const [exampleTranslation, setExampleTranslation] = useState(initialData?.exampleTranslation || '');
  const [loading, setLoading] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when initialData changes
  useEffect(() => {
    if (open) {
      setVocab(initialData?.vocab || '');
      setPronunciation(initialData?.pronunciation || '');
      setMeaning(initialData?.meaning || '');
      setExample(initialData?.example || '');
      setExampleTranslation(initialData?.exampleTranslation || '');
      setImageFile(null);
      setImagePreview(initialData?.imageUrl || null);
      setRemoveImage(false);
      setImageError(null);
    }
  }, [open, initialData]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        revokeImagePreview(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid file');
      return;
    }

    // Revoke previous preview
    if (imagePreview && imagePreview.startsWith('blob:')) {
      revokeImagePreview(imagePreview);
    }

    const preview = createImagePreview(file);
    setImageFile(file);
    setImagePreview(preview);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      revokeImagePreview(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocab.trim() || !meaning.trim()) return;

    setLoading(true);
    try {
      await onSubmit(
        { vocab, pronunciation, meaning, example, exampleTranslation },
        imageFile,
        removeImage
      );
      // Reset form
      setVocab('');
      setPronunciation('');
      setMeaning('');
      setExample('');
      setExampleTranslation('');
      setImageFile(null);
      setImagePreview(null);
      setRemoveImage(false);
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
            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Image (optional)</Label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Card image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveImage}
                      disabled={isUploadingImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Add Image</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="text-xs text-muted-foreground">
                  <p>Max size: 10MB</p>
                  <p>Formats: JPEG, PNG, GIF, WebP</p>
                  <p>Will be resized to 800px</p>
                </div>
              </div>
              {imageError && (
                <p className="text-sm text-destructive">{imageError}</p>
              )}
            </div>

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
            <Button type="button" variant="outline" onClick={onClose} disabled={loading || isUploadingImage}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploadingImage || !vocab.trim() || !meaning.trim()}>
              {loading || isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                initialData ? 'Save Changes' : 'Create Card'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
