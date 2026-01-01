import React, { useState } from 'react';
import { Plus, BookOpen, Grid, List, Download, Upload, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNovel } from '@/contexts/NovelContext';
import { Novel, ViewMode } from '@/types/novel';
import { NovelCard } from '@/components/NovelCard';
import { CreateNovelDialog } from '@/components/CreateNovelDialog';
import { ExportImportDialog } from '@/components/ExportImportDialog';

export const Library: React.FC = () => {
  const { novels, loading } = useNovel();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-display font-bold tracking-tight">Novel Companion</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportImportOpen(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Backup</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : novels.length === 0 ? (
          <EmptyLibrary onCreateClick={() => setCreateDialogOpen(true)} />
        ) : (
          <>
            {/* Novel Grid/List */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-3'
              }
            >
              <AnimatePresence mode="popLayout">
                {novels.map((novel, index) => (
                  <motion.div
                    key={novel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <NovelCard novel={novel} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Floating Add Button */}
            <Button
              variant="glow"
              size="lg"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </>
        )}
      </main>

      <CreateNovelDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ExportImportDialog open={exportImportOpen} onOpenChange={setExportImportOpen} />
    </div>
  );
};

const EmptyLibrary: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="mb-6 rounded-full bg-primary/10 p-6">
      <BookOpen className="h-12 w-12 text-primary" />
    </div>
    <h2 className="mb-2 text-2xl font-display font-semibold">Your Library is Empty</h2>
    <p className="mb-6 max-w-md text-muted-foreground">
      Start tracking your favorite novels by adding characters, places, and notes. 
      Everything stays on your device, no account needed.
    </p>
    <Button variant="glow" size="lg" onClick={onCreateClick} className="gap-2">
      <Plus className="h-5 w-5" />
      Add Your First Novel
    </Button>
  </motion.div>
);
