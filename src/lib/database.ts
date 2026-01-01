import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Novel, Character, Place, Note, ExportData } from '@/types/novel';

interface NovelCompanionDB extends DBSchema {
  novels: {
    key: string;
    value: Novel;
    indexes: { 'by-updated': number };
  };
  characters: {
    key: string;
    value: Character;
    indexes: { 'by-novel': string; 'by-updated': number };
  };
  places: {
    key: string;
    value: Place;
    indexes: { 'by-novel': string; 'by-updated': number };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-novel': string; 'by-updated': number };
  };
  images: {
    key: string;
    value: { id: string; data: string };
  };
}

const DB_NAME = 'novel-companion';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NovelCompanionDB>> | null = null;

export const getDB = async (): Promise<IDBPDatabase<NovelCompanionDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<NovelCompanionDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Novels store
        const novelStore = db.createObjectStore('novels', { keyPath: 'id' });
        novelStore.createIndex('by-updated', 'updatedAt');

        // Characters store
        const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
        characterStore.createIndex('by-novel', 'novelId');
        characterStore.createIndex('by-updated', 'updatedAt');

        // Places store
        const placeStore = db.createObjectStore('places', { keyPath: 'id' });
        placeStore.createIndex('by-novel', 'novelId');
        placeStore.createIndex('by-updated', 'updatedAt');

        // Notes store
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-novel', 'novelId');
        noteStore.createIndex('by-updated', 'updatedAt');

        // Images store
        db.createObjectStore('images', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Novel operations
export const novelDB = {
  async getAll(): Promise<Novel[]> {
    const db = await getDB();
    return db.getAllFromIndex('novels', 'by-updated');
  },

  async get(id: string): Promise<Novel | undefined> {
    const db = await getDB();
    return db.get('novels', id);
  },

  async create(novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Novel> {
    const db = await getDB();
    const now = Date.now();
    const newNovel: Novel = {
      ...novel,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.put('novels', newNovel);
    return newNovel;
  },

  async update(id: string, data: Partial<Novel>): Promise<Novel | undefined> {
    const db = await getDB();
    const existing = await db.get('novels', id);
    if (!existing) return undefined;
    
    const updated: Novel = {
      ...existing,
      ...data,
      id,
      updatedAt: Date.now(),
    };
    await db.put('novels', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    
    // Delete all related data
    const characters = await db.getAllFromIndex('characters', 'by-novel', id);
    const places = await db.getAllFromIndex('places', 'by-novel', id);
    const notes = await db.getAllFromIndex('notes', 'by-novel', id);

    const tx = db.transaction(['novels', 'characters', 'places', 'notes', 'images'], 'readwrite');
    
    // Delete characters and their images
    for (const char of characters) {
      await tx.objectStore('characters').delete(char.id);
      for (const imgId of char.images) {
        await tx.objectStore('images').delete(imgId);
      }
    }
    
    // Delete places and their images
    for (const place of places) {
      await tx.objectStore('places').delete(place.id);
      for (const imgId of place.images) {
        await tx.objectStore('images').delete(imgId);
      }
    }
    
    // Delete notes
    for (const note of notes) {
      await tx.objectStore('notes').delete(note.id);
    }
    
    // Delete novel
    await tx.objectStore('novels').delete(id);
    
    await tx.done;
  },
};

// Character operations
export const characterDB = {
  async getByNovel(novelId: string): Promise<Character[]> {
    const db = await getDB();
    return db.getAllFromIndex('characters', 'by-novel', novelId);
  },

  async get(id: string): Promise<Character | undefined> {
    const db = await getDB();
    return db.get('characters', id);
  },

  async create(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const db = await getDB();
    const now = Date.now();
    const newCharacter: Character = {
      ...character,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.put('characters', newCharacter);
    return newCharacter;
  },

  async update(id: string, data: Partial<Character>): Promise<Character | undefined> {
    const db = await getDB();
    const existing = await db.get('characters', id);
    if (!existing) return undefined;
    
    const updated: Character = {
      ...existing,
      ...data,
      id,
      updatedAt: Date.now(),
    };
    await db.put('characters', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const character = await db.get('characters', id);
    if (!character) return;

    const tx = db.transaction(['characters', 'images'], 'readwrite');
    
    // Delete images
    for (const imgId of character.images) {
      await tx.objectStore('images').delete(imgId);
    }
    
    await tx.objectStore('characters').delete(id);
    await tx.done;

    // Remove references from other characters
    const allChars = await db.getAllFromIndex('characters', 'by-novel', character.novelId);
    for (const char of allChars) {
      if (char.linkedCharacterIds.includes(id)) {
        await db.put('characters', {
          ...char,
          linkedCharacterIds: char.linkedCharacterIds.filter(cid => cid !== id),
          updatedAt: Date.now(),
        });
      }
    }
  },
};

// Place operations
export const placeDB = {
  async getByNovel(novelId: string): Promise<Place[]> {
    const db = await getDB();
    return db.getAllFromIndex('places', 'by-novel', novelId);
  },

  async get(id: string): Promise<Place | undefined> {
    const db = await getDB();
    return db.get('places', id);
  },

  async create(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
    const db = await getDB();
    const now = Date.now();
    const newPlace: Place = {
      ...place,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.put('places', newPlace);
    return newPlace;
  },

  async update(id: string, data: Partial<Place>): Promise<Place | undefined> {
    const db = await getDB();
    const existing = await db.get('places', id);
    if (!existing) return undefined;
    
    const updated: Place = {
      ...existing,
      ...data,
      id,
      updatedAt: Date.now(),
    };
    await db.put('places', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const place = await db.get('places', id);
    if (!place) return;

    const tx = db.transaction(['places', 'images'], 'readwrite');
    
    for (const imgId of place.images) {
      await tx.objectStore('images').delete(imgId);
    }
    
    await tx.objectStore('places').delete(id);
    await tx.done;
  },
};

// Note operations
export const noteDB = {
  async getByNovel(novelId: string): Promise<Note[]> {
    const db = await getDB();
    return db.getAllFromIndex('notes', 'by-novel', novelId);
  },

  async get(id: string): Promise<Note | undefined> {
    const db = await getDB();
    return db.get('notes', id);
  },

  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const db = await getDB();
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.put('notes', newNote);
    return newNote;
  },

  async update(id: string, data: Partial<Note>): Promise<Note | undefined> {
    const db = await getDB();
    const existing = await db.get('notes', id);
    if (!existing) return undefined;
    
    const updated: Note = {
      ...existing,
      ...data,
      id,
      updatedAt: Date.now(),
    };
    await db.put('notes', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('notes', id);
  },
};

// Image operations
export const imageDB = {
  async get(id: string): Promise<string | undefined> {
    const db = await getDB();
    const record = await db.get('images', id);
    return record?.data;
  },

  async save(data: string): Promise<string> {
    const db = await getDB();
    const id = generateId();
    await db.put('images', { id, data });
    return id;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('images', id);
  },
};

// Export/Import operations
export const dataExport = {
  async exportAll(): Promise<ExportData> {
    const db = await getDB();
    
    const novels = await db.getAll('novels');
    const characters = await db.getAll('characters');
    const places = await db.getAll('places');
    const notes = await db.getAll('notes');
    
    // Collect all image IDs
    const imageIds = new Set<string>();
    characters.forEach(c => c.images.forEach(id => imageIds.add(id)));
    places.forEach(p => p.images.forEach(id => imageIds.add(id)));
    novels.forEach(n => n.coverImage && imageIds.add(n.coverImage));
    
    // Get all images
    const images: { [key: string]: string } = {};
    for (const id of imageIds) {
      const data = await imageDB.get(id);
      if (data) images[id] = data;
    }
    
    return {
      version: '1.0',
      exportedAt: Date.now(),
      novels,
      characters,
      places,
      notes,
      images,
    };
  },

  async importAll(data: ExportData, mode: 'overwrite' | 'merge' = 'overwrite'): Promise<void> {
    const db = await getDB();
    
    if (mode === 'overwrite') {
      // Clear all stores
      await db.clear('novels');
      await db.clear('characters');
      await db.clear('places');
      await db.clear('notes');
      await db.clear('images');
    }
    
    // Import images first
    for (const [id, dataStr] of Object.entries(data.images)) {
      await db.put('images', { id, data: dataStr });
    }
    
    // Import novels
    for (const novel of data.novels) {
      await db.put('novels', novel);
    }
    
    // Import characters
    for (const character of data.characters) {
      await db.put('characters', character);
    }
    
    // Import places
    for (const place of data.places) {
      await db.put('places', place);
    }
    
    // Import notes
    for (const note of data.notes) {
      await db.put('notes', note);
    }
  },
};
