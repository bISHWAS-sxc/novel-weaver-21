import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataExport } from '@/lib/database';
import { ExportData } from '@/types/novel';
import { toast } from 'sonner';

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await dataExport.exportAll();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `novel-companion-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup exported successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export backup');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      
      if (!data.version || !data.novels) {
        throw new Error('Invalid backup file');
      }
      
      await dataExport.importAll(data, 'overwrite');
      toast.success('Backup imported! Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to import backup. Invalid file format.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Backup & Restore</DialogTitle>
          <DialogDescription>
            Export your data as JSON or restore from a previous backup.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
              <FileJson className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Export all novels, characters, places, notes, and images.</p>
                <p className="text-muted-foreground mt-1">Download as a JSON file you can restore later.</p>
              </div>
            </div>
            <Button onClick={handleExport} disabled={loading} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {loading ? 'Exporting...' : 'Download Backup'}
            </Button>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">This will replace all existing data!</p>
                <p className="text-muted-foreground mt-1">Make sure to export your current data first if needed.</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Importing...' : 'Select Backup File'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
