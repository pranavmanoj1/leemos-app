import type { CharacterProfile } from './personality';

// ───────── Branded IDs ─────────

export type BookId = number & { readonly __brand: 'BookId' };
export type ChapterId = string & { readonly __brand: 'ChapterId' };
export type CharacterId = number & { readonly __brand: 'CharacterId' };

// ───────── Supporting types ─────────

export interface TextReference {
    page: number;
    chapter: ChapterId;
    quote: string;
}

// ───────── Domain model ─────────
//
// These shapes are the single source of truth for what a "book" looks like
// across the app: the backend types its API response against them
// (see backend/server.ts) and the frontend can use the same definitions.

export interface Chapter {
    id: ChapterId;
    bookId: BookId;
    position: number;
    prose: string;
    presentCharacters?: ReadonlyArray<CharacterId>;
}

export interface Book {
    id: BookId;
    title: string;
    author: string;
    chapters: ReadonlyArray<Chapter>;
}

export interface Character {
    id: CharacterId;
    bookId: BookId;
    name: string;
    profile: CharacterProfile;
}
