import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Novel, ViewMode } from '@/types/novel';
import { useNovel } from '@/contexts/NovelContext';
import { toast } from 'sonner';

interface NovelCardProps {
  novel: Novel;
  viewMode: ViewMode;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel, viewMode }) => {
  const navigate = useNavigate();
  const { deleteNovel } = useNovel();

  const handleClick = () => {
    navigate(`/novel/${novel.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this novel and all its data? This cannot be undone.')) {
      await deleteNovel(novel.id);
      toast.success('Novel deleted');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <Card 
        variant="interactive" 
        className="flex items-center gap-4 p-4"
        onClick={handleClick}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Book className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold truncate">{novel.title}</h3>
          {novel.author && (
            <p className="text-sm text-muted-foreground truncate">by {novel.author}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {formatDate(novel.updatedAt)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    );
  }

  return (
    <Card variant="interactive" className="group overflow-hidden" onClick={handleClick}>
      <div className="aspect-[3/4] relative bg-gradient-to-br from-primary/20 to-copper/10 flex items-center justify-center">
        <Book className="h-16 w-16 text-primary/50" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-base truncate">{novel.title}</CardTitle>
        {novel.author && (
          <p className="text-sm text-muted-foreground truncate">by {novel.author}</p>
        )}
      </CardHeader>
    </Card>
  );
};
