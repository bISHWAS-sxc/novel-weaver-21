import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNovel } from '@/contexts/NovelContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CreateNovelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateNovelDialog: React.FC<CreateNovelDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const { createNovel } = useNovel();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const novel = await createNovel({
        title: title.trim(),
        author: author.trim() || undefined,
      });
      toast.success('Novel created!');
      onOpenChange(false);
      setTitle('');
      setAuthor('');
      navigate(`/novel/${novel.id}`);
    } catch (error) {
      toast.error('Failed to create novel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Novel</DialogTitle>
          <DialogDescription>
            Start tracking characters, places, and notes for a novel you're reading.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Novel Title *</Label>
              <Input
                id="title"
                placeholder="e.g., The Name of the Wind"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author (optional)</Label>
              <Input
                id="author"
                placeholder="e.g., Patrick Rothfuss"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading ? 'Creating...' : 'Create Novel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
