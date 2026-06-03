// Backend-owned shape of the book API contract.
//
// These types describe the JSON the backend serves from /api/books. They are
// intentionally a standalone copy rather than an import from the frontend: the
// backend and frontend are separate TypeScript projects, and reaching into
// ../frontend/src dragged frontend-only modules (and their imports) into the
// backend build. Keeping the contract here lets each side compile on its own.
//
// If the shape changes, update the matching definitions in
// frontend/src/model/book.ts so the two stay in sync.

// ───────── Branded IDs ─────────

export type BookId = number & { readonly __brand: 'BookId' };
export type ChapterId = string & { readonly __brand: 'ChapterId' };
export type CharacterId = number & { readonly __brand: 'CharacterId' };

// ───────── Domain model ─────────

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
