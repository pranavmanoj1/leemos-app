import express, { type Express, type Request, type Response } from 'express';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { asc, eq } from 'drizzle-orm';
import { books, chapters } from '../db/schema';
import type {
    Book,
    BookId,
    Chapter,
    ChapterId,
} from '../model/book';

// Build the wired Express API: DB client, JSON + CORS middleware, and the book
// API. Kept as a factory (rather than top-level side effects) so the entry
// point controls when it runs — notably after environment variables have been
// loaded. Serving the frontend is Vite's job, not the backend's.
export function createApiApp(): Express {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set. Add it to backend/.env.');
    }

    // Supabase pooler (pgBouncer transaction mode) requires prepare: false.
    const client = postgres(databaseUrl, { prepare: false });
    const db = drizzle(client, { schema: { books, chapters } });

    const app = express();
    app.use(express.json());

    // Permissive CORS for local dev / opening the HTML directly.
    app.use((_req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        next();
    });

    app.get('/api/books/:id', async (req: Request, res: Response) => {
        const raw = Number(req.params.id);
        if (!Number.isFinite(raw)) {
            res.status(400).json({ error: 'invalid book id' });
            return;
        }
        const id = raw as BookId;

        try {
            const [book] = await db.select().from(books).where(eq(books.id, id));
            if (!book) {
                res.status(404).json({ error: 'book not found' });
                return;
            }

            const rows = await db
                .select({
                    id: chapters.id,
                    bookId: chapters.bookId,
                    position: chapters.position,
                    prose: chapters.prose,
                })
                .from(chapters)
                .where(eq(chapters.bookId, id))
                .orderBy(asc(chapters.position));

            const payload: Book = {
                id,
                title: book.title,
                author: book.author,
                chapters: rows.map(
                    (r): Chapter => ({
                        id: r.id as ChapterId,
                        bookId: r.bookId as BookId,
                        position: r.position,
                        prose: r.prose,
                    }),
                ),
            };

            res.json(payload);
        } catch (err) {
            console.error('GET /api/books/:id failed:', err);
            res.status(500).json({ error: 'server error' });
        }
    });

    app.get('/api/books', async (req, res) => {
        try {
            const items = await db.select().from(books);
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: '/api/books request failed' });
        }
    });
    

    // API only. The frontend is served separately by Vite (see frontend/).
    return app;
}
