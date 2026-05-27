import * as fs from 'fs';
import * as path from 'path';

const SOURCE_PATH =
    '/Users/pranavmanoj/leemos-app/backend/data/notes-from-the-undergound/notes_from_the_underground_.txt';
const OUTPUT_DIR = '/Users/pranavmanoj/leemos-app/backend/db';

// Chapter labels (Roman numerals) per part, in order.
const partChapters: Record<string, string[]> = {
    'PART I': ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
    'PART II': ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'],
};

type Boundary = { lineIndex: number; isPart: boolean; label: string };

function findBoundaries(lines: string[]): Boundary[] {
    const boundaries: Boundary[] = [];
    let currentPart: string | null = null;

    // The contents block at the top of the file lists items with a leading
    // space (" I", " II", " PART I Underground"), so exact-line matches on
    // "PART I" / "PART II" / "I" / ... will only hit the real headings.
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        if (line === 'PART I' || line === 'PART II') {
            currentPart = line;
            boundaries.push({ lineIndex: i, isPart: true, label: line });
            continue;
        }
        const chapters = currentPart ? partChapters[currentPart] : undefined;
        if (chapters && chapters.includes(line)) {
            boundaries.push({ lineIndex: i, isPart: false, label: line });
        }
    }
    return boundaries;
}

function trimSurroundingBlankLines(lines: string[]): string[] {
    let start = 0;
    let end = lines.length;
    while (start < end && (lines[start] ?? '').trim() === '') start++;
    while (end > start && (lines[end - 1] ?? '').trim() === '') end--;
    return lines.slice(start, end);
}

function main(): void {
    let textContent: string;
    try {
        textContent = fs.readFileSync(SOURCE_PATH, 'utf-8');
    } catch (error) {
        console.error('Could not read the text file:', error);
        return;
    }

    const lines = textContent.split('\n');
    const boundaries = findBoundaries(lines);

    let chapterNum = 0;
    for (let b = 0; b < boundaries.length; b++) {
        const cur = boundaries[b];
        if (!cur || cur.isPart) continue;

        chapterNum++;
        const next = boundaries[b + 1];
        const nextLine = next ? next.lineIndex : lines.length;

        const body = trimSurroundingBlankLines(
            lines.slice(cur.lineIndex + 1, nextLine),
        ).join('\n');

        const header = `Chapter ${chapterNum}\n\n\n`;
        const fileContent = `${header}${body}\n`;

        const padded = String(chapterNum).padStart(3, '0');
        const outPath = path.join(OUTPUT_DIR, `ch_${padded}.txt`);

        try {
            fs.writeFileSync(outPath, fileContent, 'utf-8');
            console.log(`Wrote ${outPath}`);
        } catch (error) {
            console.error(`Error writing ${outPath}:`, error);
        }
    }

    console.log(`Done. Wrote ${chapterNum} chapter file(s).`);
}

main();
