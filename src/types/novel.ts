export interface Novel {
  id: string;
  title: string;
  author?: string;
  coverImage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Character {
  id: string;
  novelId: string;
  name: string;
  description: string;
  images: string[];
  tags: CharacterTag[];
  linkedCharacterIds: string[];
  linkedPlaceIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type CharacterTag = 'mc' | 'villain' | 'ally' | 'mentor' | 'love-interest' | 'side' | 'custom';

export interface Place {
  id: string;
  novelId: string;
  name: string;
  description: string;
  images: string[];
  linkedCharacterIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  novelId: string;
  title: string;
  content: string;
  linkedCharacterIds: string[];
  linkedPlaceIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ExportData {
  version: string;
  exportedAt: number;
  novels: Novel[];
  characters: Character[];
  places: Place[];
  notes: Note[];
  images: { [key: string]: string }; // id -> base64 data
}

export type ViewMode = 'grid' | 'list';
export type TabType = 'characters' | 'places' | 'notes';
