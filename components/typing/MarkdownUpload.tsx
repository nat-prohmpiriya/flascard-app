'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bulkCreateTypingSnippets } from '@/services/typingSnippet';
import {
  parseMarkdownToSnippets,
  convertToFormData,
  validateMarkdown,
  generateMarkdownTemplate,
} from '@/lib/markdownParser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, FileText, Check, X, Download, Loader2, Eye } from 'lucide-react';

interface MarkdownUploadProps {
  onSuccess?: () => void;
}

export function MarkdownUpload({ onSuccess }: MarkdownUploadProps) {
  const { firebaseUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseMarkdownToSnippets> | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      toast.error('Please upload a .md file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMarkdown(content);
      handlePreview(content);
    };
    reader.readAsText(file);
  };

  const handlePreview = (content: string) => {
    const validation = validateMarkdown(content);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    const result = parseMarkdownToSnippets(content);
    setPreview(result);

    if (result.errors.length > 0) {
      result.errors.forEach((err) => toast.warning(err));
    }
  };

  const handleImport = async () => {
    if (!firebaseUser) {
      toast.error('Please login first');
      return;
    }

    if (!preview || preview.snippets.length === 0) {
      toast.error('No snippets to import');
      return;
    }

    setLoading(true);

    try {
      const formData = convertToFormData(preview, isPublic);
      const count = await bulkCreateTypingSnippets(firebaseUser.uid, formData);
      toast.success(`Imported ${count} snippets!`);

      // Reset
      setMarkdown('');
      setPreview(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to import snippets:', error);
      toast.error('Failed to import snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateMarkdownTemplate();
    const blob = new Blob([template], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippets-template.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-600';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'hard':
        return 'bg-red-500/10 text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import from Markdown
          </CardTitle>
          <CardDescription>
            Upload a .md file with code snippets or paste markdown directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload .md File
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowEditor(!showEditor)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showEditor ? 'Hide Editor' : 'Paste Markdown'}
            </Button>
          </div>

          {/* Markdown Editor */}
          {showEditor && (
            <div className="space-y-2">
              <Label>Markdown Content</Label>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Paste your markdown here..."
                className="font-mono min-h-[300px]"
              />
              <Button
                variant="secondary"
                onClick={() => handlePreview(markdown)}
                disabled={!markdown.trim()}
              >
                Preview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview: {preview.languageName}</span>
              <Badge variant="secondary">
                {preview.snippets.length} snippets
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {preview.errors.length > 0 && (
              <div className="p-4 bg-red-500/10 rounded-lg space-y-1">
                {preview.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* Snippets List */}
            <div className="space-y-2">
              {preview.snippets.map((snippet, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{snippet.title}</span>
                  </div>
                  <Badge className={getDifficultyColor(snippet.difficulty)}>
                    {snippet.difficulty}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Share publicly</Label>
                <p className="text-sm text-muted-foreground">
                  Others can practice with these snippets
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={loading || preview.snippets.length === 0}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {preview.snippets.length} Snippets
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
