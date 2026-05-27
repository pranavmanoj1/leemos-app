import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { books, chapters } from './schema';

// Load backend/.env regardless of where the script is invoked from.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const CHAPTERS_DIR = path.resolve(__dirname);
const CHAPTER_FILE_RE = /^ch_(\d{3})\.txt$/;

const BOOK = {
    id: 1,
    title: 'Notes from the Underground',
    author: 'Fyodor Dostoyevsky',
};

async function main(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error(
            'DATABASE_URL is not set. Add it to backend/.env (or export it) before running.',
        );
    }

    // Supabase pooler (pgBouncer in transaction mode) requires prepare: false.
    const client = postgres(databaseUrl, { prepare: false });
    const db = drizzle(client, { schema: { books, chapters } });

    try {
        await db
            .insert(books)
            .values(BOOK)
            .onConflictDoUpdate({
                target: books.id,
                set: { title: BOOK.title, author: BOOK.author },
            });
        console.log(`Upserted book id=${BOOK.id}: "${BOOK.title}" by ${BOOK.author}`);

        const entries = fs
            .readdirSync(CHAPTERS_DIR)
            .map((name) => ({ name, match: CHAPTER_FILE_RE.exec(name) }))
            .filter(
                (e): e is { name: string; match: RegExpExecArray } => e.match !== null,
            )
            .sort((a, b) => Number(a.match[1]) - Number(b.match[1]));

        if (entries.length === 0) {
            console.warn(
                `No chapter files matched ${CHAPTER_FILE_RE} in ${CHAPTERS_DIR}.`,
            );
            return;
        }

        for (const { name, match } of entries) {
            const id = path.basename(name, '.txt');
            const positionStr = match[1];
            if (positionStr === undefined) continue;
            const position = Number(positionStr);
            const filePath = path.join(CHAPTERS_DIR, name);
            const prose = fs.readFileSync(filePath, 'utf-8');

            await db
                .insert(chapters)
                .values({
                    id,
                    bookId: BOOK.id,
                    prose,
                    position,
                })
                .onConflictDoUpdate({
                    target: chapters.id,
                    set: { prose, position, bookId: BOOK.id },
                });

            console.log(
                `Upserted ${id} (position=${position}, ${prose.length} chars)`,
            );
        }

        console.log(`Done. Pushed ${entries.length} chapter(s).`);
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
