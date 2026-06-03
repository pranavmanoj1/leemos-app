import type { BookId } from '../model/book'

export interface BookSummary {
    id: BookId
    title: string
    author: string
}

export async function fetchBooks(): Promise<BookSummary[]> {
    const res = await fetch('/api/books')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
}