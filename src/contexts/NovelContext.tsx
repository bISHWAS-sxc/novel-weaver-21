import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Novel, Character, Place, Note } from '@/types/novel';
import { novelDB, characterDB, placeDB, noteDB } from '@/lib/database';

interface NovelContextType {
  novels: Novel[];
  currentNovel: Novel | null;
  characters: Character[];
  places: Place[];
  notes: Note[];
  loading: boolean;
  
  // Novel operations
  loadNovels: () => Promise<void>;
  selectNovel: (id: string | null) => Promise<void>;
  createNovel: (data: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Novel>;
  updateNovel: (id: string, data: Partial<Novel>) => Promise<void>;
  deleteNovel: (id: string) => Promise<void>;
  
  // Character operations
  createCharacter: (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Character>;
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  
  // Place operations
  createPlace: (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Place>;
  updatePlace: (id: string, data: Partial<Place>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  
  // Note operations
  createNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NovelContext = createContext<NovelContextType | null>(null);

export const useNovel = () => {
  const context = useContext(NovelContext);
  if (!context) {
    throw new Error('useNovel must be used within a NovelProvider');
  }
  return context;
};

export const NovelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNovels = useCallback(async () => {
    setLoading(true);
    try {
      const allNovels = await novelDB.getAll();
      setNovels(allNovels.reverse());
    } catch (error) {
      console.error('Failed to load novels:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNovelData = useCallback(async (novelId: string) => {
    const [chars, pls, nts] = await Promise.all([
      characterDB.getByNovel(novelId),
      placeDB.getByNovel(novelId),
      noteDB.getByNovel(novelId),
    ]);
    setCharacters(chars);
    setPlaces(pls);
    setNotes(nts);
  }, []);

  const selectNovel = useCallback(async (id: string | null) => {
    if (!id) {
      setCurrentNovel(null);
      setCharacters([]);
      setPlaces([]);
      setNotes([]);
      return;
    }

    const novel = await novelDB.get(id);
    if (novel) {
      setCurrentNovel(novel);
      await loadNovelData(id);
    }
  }, [loadNovelData]);

  const createNovel = useCallback(async (data: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novel = await novelDB.create(data);
    setNovels(prev => [novel, ...prev]);
    return novel;
  }, []);

  const updateNovel = useCallback(async (id: string, data: Partial<Novel>) => {
    const updated = await novelDB.update(id, data);
    if (updated) {
      setNovels(prev => prev.map(n => n.id === id ? updated : n));
      if (currentNovel?.id === id) {
        setCurrentNovel(updated);
      }
    }
  }, [currentNovel]);

  const deleteNovel = useCallback(async (id: string) => {
    await novelDB.delete(id);
    setNovels(prev => prev.filter(n => n.id !== id));
    if (currentNovel?.id === id) {
      setCurrentNovel(null);
      setCharacters([]);
      setPlaces([]);
      setNotes([]);
    }
  }, [currentNovel]);

  // Character operations
  const createCharacter = useCallback(async (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    const character = await characterDB.create(data);
    setCharacters(prev => [...prev, character]);
    return character;
  }, []);

  const updateCharacter = useCallback(async (id: string, data: Partial<Character>) => {
    const updated = await characterDB.update(id, data);
    if (updated) {
      setCharacters(prev => prev.map(c => c.id === id ? updated : c));
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    await characterDB.delete(id);
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  // Place operations
  const createPlace = useCallback(async (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    const place = await placeDB.create(data);
    setPlaces(prev => [...prev, place]);
    return place;
  }, []);

  const updatePlace = useCallback(async (id: string, data: Partial<Place>) => {
    const updated = await placeDB.update(id, data);
    if (updated) {
      setPlaces(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const deletePlace = useCallback(async (id: string) => {
    await placeDB.delete(id);
    setPlaces(prev => prev.filter(p => p.id !== id));
  }, []);

  // Note operations
  const createNote = useCallback(async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note = await noteDB.create(data);
    setNotes(prev => [...prev, note]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, data: Partial<Note>) => {
    const updated = await noteDB.update(id, data);
    if (updated) {
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await noteDB.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    loadNovels();
  }, [loadNovels]);

  return (
    <NovelContext.Provider
      value={{
        novels,
        currentNovel,
        characters,
        places,
        notes,
        loading,
        loadNovels,
        selectNovel,
        createNovel,
        updateNovel,
        deleteNovel,
        createCharacter,
        updateCharacter,
        deleteCharacter,
        createPlace,
        updatePlace,
        deletePlace,
        createNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};
