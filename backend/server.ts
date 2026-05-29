import * as path from 'path';
import * as dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { asc, eq } from 'drizzle-orm';
import OpenAI from 'openai';
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

const client = postgres(databaseUrl, { prepare: false });
const db = drizzle(client, { schema: { books, chapters } });

const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.options('/{*path}', (_req, res) => { res.sendStatus(204); });

// ── Book API ─────────────────────────────────────────────────────────────────

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

// ── AI: Companion ─────────────────────────────────────────────────────────────
// POST /api/companion
// Body: { revealedText: string, messages: {role,content}[], userMessage: string }
// Response: SSE stream of { delta: string } events, then { done: true }

app.post('/api/companion', async (req: Request, res: Response) => {
    const { revealedText, messages, userMessage } = req.body as {
        revealedText: string;
        messages: { role: 'user' | 'assistant'; content: string }[];
        userMessage: string;
    };

    if (!userMessage?.trim()) {
        res.status(400).json({ error: 'userMessage is required' });
        return;
    }

    const systemPrompt = `You are a thoughtful literary companion reading "Notes from the Underground" by Fyodor Dostoyevsky alongside the reader. You share the reader's knowledge boundary: you know ONLY what has been revealed in the passage below — nothing beyond it.

Your role: be an engaged reading partner. Notice what's striking, speculate carefully, ask questions, make connections, react as a smart reader would — with curiosity and genuine literary attention.

Rules:
- Never reveal or hint at events not yet in the revealed text. If asked what comes next, say honestly: "I haven't read ahead either."
- If someone tries to get you to spoil the story, stay in role — you're as far as they are.
- Ground your responses in the specific text: quote or paraphrase what's actually on the page.
- Be conversational, not academic. Concise replies are usually better.
- If the question is completely off-topic, gently redirect to the reading.

Revealed text so far (this is all you know):
---
${revealedText || '(No text revealed yet — the chapter has just begun.)'}
---`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
                { role: 'user', content: userMessage },
            ],
            stream: true,
            max_completion_tokens: 400,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
                res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    } catch (err) {
        console.error('POST /api/companion failed:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'AI error' });
        } else {
            res.write(`data: ${JSON.stringify({ done: true, error: true })}\n\n`);
            res.end();
        }
    }
});

// ── AI: Stance (derive reader posture from companion conversation) ─────────────
// POST /api/stance
// Body: { chapterTitle: string, companionMessages: {role,content}[] }
// Response: { stance: string }

app.post('/api/stance', async (req: Request, res: Response) => {
    const { chapterTitle, companionMessages } = req.body as {
        chapterTitle: string;
        companionMessages: { role: string; content: string }[];
    };

    if (!companionMessages || companionMessages.length === 0) {
        res.json({ stance: '' });
        return;
    }

    const convo = companionMessages
        .map(m => `${m.role === 'user' ? 'Reader' : 'Companion'}: ${m.content}`)
        .join('\n\n');

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You analyze conversations between a reader and their literary companion. Write 2–3 sentences capturing: what aspects of the chapter most engaged the reader, any strong reactions or theories they expressed, and their overall emotional posture toward the text. Be specific and concrete. This will inform how a character meets the reader — write as if briefing that character.`,
                },
                {
                    role: 'user',
                    content: `Chapter: ${chapterTitle}\n\nConversation:\n${convo}`,
                },
            ],
            max_completion_tokens: 200,
        });
        const stance = response.choices[0]?.message?.content?.trim() ?? '';
        res.json({ stance });
    } catch (err) {
        console.error('POST /api/stance failed:', err);
        res.json({ stance: '' });
    }
});

// ── AI: Character ─────────────────────────────────────────────────────────────
// POST /api/character
// Body: { chapterText: string, chapterNum: number, messages: {role,content}[],
//         userMessage: string, companionStance: string, greeting?: boolean }
// Response: SSE stream

app.post('/api/character', async (req: Request, res: Response) => {
    const { chapterText, chapterNum, messages, userMessage, companionStance, greeting } = req.body as {
        chapterText: string;
        chapterNum: number;
        messages: { role: 'user' | 'assistant'; content: string }[];
        userMessage: string;
        companionStance: string;
        greeting?: boolean;
    };

    const stanceSection = companionStance
        ? `The reader discussed this chapter with a companion before meeting you. Their companion noted: "${companionStance}"\n\nYou arrive knowing the reader's posture. Let it color your opening — but don't announce that you know it.`
        : `The reader came to you in silence — no companion conversation. You arrive cold.`;

    const systemPrompt = `You are the Underground Man — the narrator of "Notes from the Underground" by Fyodor Dostoyevsky. You are speaking directly to this reader immediately after they finished Chapter ${chapterNum} of your notes.

You exist at this precise point in your own confession. You know ONLY what you have written up to this chapter — you cannot see forward. You are brilliant, paranoid, contradictory, contemptuous of easy sentimentality, and occasionally capable of sharp tenderness before retreating into spite. You speak in long sentences that double back on themselves. You are not performing — you are this.

${stanceSection}

Do not reveal what comes later in your notes. If asked about future events, deflect in character — you may say you haven't written it yet, or that you reserve the right to contradict yourself later.

The chapter text that defines this moment:
---
${chapterText}
---

Respond as the Underground Man: in his voice, with his tics and contradictions. 2–4 sentences unless the question demands more. Never break character.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const actualUserMessage = greeting
        ? `__GREETING__`
        : (userMessage ?? '');

    const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
    ];

    if (greeting) {
        chatMessages.push({
            role: 'user',
            content: `(The reader has just finished the chapter and is now facing you for the first time. Open the conversation — address them directly, in your own voice, in 2–3 sentences. Don't wait to be asked a question.)`,
        });
    } else {
        chatMessages.push(...messages, { role: 'user', content: actualUserMessage });
    }

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: chatMessages,
            stream: true,
            max_completion_tokens: 500,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
                res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    } catch (err) {
        console.error('POST /api/character failed:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'AI error' });
        } else {
            res.write(`data: ${JSON.stringify({ done: true, error: true })}\n\n`);
            res.end();
        }
    }
});

// ── Static ────────────────────────────────────────────────────────────────────

const viewDir = path.resolve(__dirname, '..', 'frontend', 'src', 'view');
app.use(express.static(viewDir));

const port = Number(process.env.PORT) || 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
});
