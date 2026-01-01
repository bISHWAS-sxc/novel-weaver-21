import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNovel } from '@/contexts/NovelContext';
import { TabType, CharacterTag } from '@/types/novel';

export const NovelDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentNovel, selectNovel, characters, places, notes, createCharacter, createPlace, createNote } = useNovel();
  const [activeTab, setActiveTab] = useState<TabType>('characters');

  useEffect(() => {
    if (id) selectNovel(id);
    return () => { selectNovel(null); };
  }, [id, selectNovel]);

  if (!currentNovel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleAddCharacter = async () => {
    const name = prompt('Character name:');
    if (name?.trim()) {
      await createCharacter({
        novelId: currentNovel.id,
        name: name.trim(),
        description: '',
        images: [],
        tags: [],
        linkedCharacterIds: [],
        linkedPlaceIds: [],
      });
    }
  };

  const handleAddPlace = async () => {
    const name = prompt('Place name:');
    if (name?.trim()) {
      await createPlace({
        novelId: currentNovel.id,
        name: name.trim(),
        description: '',
        images: [],
        linkedCharacterIds: [],
      });
    }
  };

  const handleAddNote = async () => {
    const title = prompt('Note title:');
    if (title?.trim()) {
      await createNote({
        novelId: currentNovel.id,
        title: title.trim(),
        content: '',
        linkedCharacterIds: [],
        linkedPlaceIds: [],
      });
    }
  };

  const getTagVariant = (tag: CharacterTag) => {
    const variants: Record<CharacterTag, any> = {
      mc: 'mc', villain: 'villain', ally: 'ally', mentor: 'mentor',
      'love-interest': 'love-interest', side: 'side', custom: 'outline'
    };
    return variants[tag] || 'outline';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-bold truncate">{currentNovel.title}</h1>
            {currentNovel.author && (
              <p className="text-sm text-muted-foreground truncate">by {currentNovel.author}</p>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="characters" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Characters</span>
              <Badge variant="secondary" className="ml-1">{characters.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="places" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Places</span>
              <Badge variant="secondary" className="ml-1">{places.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notes</span>
              <Badge variant="secondary" className="ml-1">{notes.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="space-y-4">
            {characters.length === 0 ? (
              <EmptyState icon={Users} title="No characters yet" onAdd={handleAddCharacter} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {characters.map((char) => (
                  <Card key={char.id} variant="interactive">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{char.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {char.description || 'No description'}
                      </p>
                      {char.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {char.tags.map((tag) => (
                            <Badge key={tag} variant={getTagVariant(tag)} className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button variant="glow" className="fixed bottom-6 right-6 h-14 w-14 rounded-full" onClick={handleAddCharacter}>
              <Plus className="h-6 w-6" />
            </Button>
          </TabsContent>

          <TabsContent value="places" className="space-y-4">
            {places.length === 0 ? (
              <EmptyState icon={MapPin} title="No places yet" onAdd={handleAddPlace} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <Card key={place.id} variant="interactive">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{place.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {place.description || 'No description'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button variant="glow" className="fixed bottom-6 right-6 h-14 w-14 rounded-full" onClick={handleAddPlace}>
              <Plus className="h-6 w-6" />
            </Button>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {notes.length === 0 ? (
              <EmptyState icon={FileText} title="No notes yet" onAdd={handleAddNote} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {notes.map((note) => (
                  <Card key={note.id} variant="interactive">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {note.content || 'Empty note'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button variant="glow" className="fixed bottom-6 right-6 h-14 w-14 rounded-full" onClick={handleAddNote}>
              <Plus className="h-6 w-6" />
            </Button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const EmptyState: React.FC<{ icon: any; title: string; onAdd: () => void }> = ({ icon: Icon, title, onAdd }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
    <div className="mb-4 rounded-full bg-primary/10 p-4">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">Tap the + button to add your first entry</p>
  </motion.div>
);
