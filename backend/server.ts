import * as path from 'path';
import * as dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { asc, eq } from 'drizzle-orm';
import { books, chapters } from './db/schema';
import type {
    Book,
    BookId,
    Chapter,
    ChapterId,
} from '../frontend/src/model/book';

dotenv.config({ path: path.resolve(__dirname, '.env') });

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

const viewDir = path.resolve(__dirname, '..', 'frontend', 'src', 'view');
app.use(express.static(viewDir));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`  API:  http://localhost:${port}/api/books/1`);
    console.log(`  View: http://localhost:${port}/`);
});
