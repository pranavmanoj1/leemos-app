import { fetchBooks, type BookSummary } from '../controller/books.controller'
import { signOut } from '../controller/auth.controller'

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    --bg:          #faf8f3;
    --ink:         #1a1a1a;
    --panel-bg:    #f3f0e9;
    --char-accent: #6b4f2a;
    --border:      rgba(26,26,26,0.10);
    --ink-muted:   rgba(26,26,26,0.50);
    --ink-faint:   rgba(26,26,26,0.35);
    --shadow:      0 1px 3px rgba(26,26,26,.07), 0 4px 14px rgba(26,26,26,.06);
    --shadow-hov:  0 4px 12px rgba(26,26,26,.12), 0 8px 28px rgba(26,26,26,.10);
  }
  :host([data-theme="sepia"]) {
    --bg:          #f4ecd8;
    --ink:         #3b2f1e;
    --panel-bg:    #ede4cc;
    --char-accent: #7a4f1a;
    --border:      rgba(59,47,30,0.10);
    --ink-muted:   rgba(59,47,30,0.50);
    --ink-faint:   rgba(59,47,30,0.35);
    --shadow:      0 1px 3px rgba(59,47,30,.09), 0 4px 14px rgba(59,47,30,.07);
    --shadow-hov:  0 4px 12px rgba(59,47,30,.15), 0 8px 28px rgba(59,47,30,.11);
  }
  :host([data-theme="dark"]) {
    --bg:          #1c1c1e;
    --ink:         #e8e3d9;
    --panel-bg:    #252527;
    --char-accent: #c8a97a;
    --border:      rgba(232,227,217,0.10);
    --ink-muted:   rgba(232,227,217,0.50);
    --ink-faint:   rgba(232,227,217,0.35);
    --shadow:      0 1px 3px rgba(0,0,0,.30), 0 4px 14px rgba(0,0,0,.25);
    --shadow-hov:  0 4px 12px rgba(0,0,0,.40), 0 8px 28px rgba(0,0,0,.35);
  }

  .wrapper {
    background: var(--bg);
    color: var(--ink);
    font-family: 'Literata', Georgia, serif;
    font-weight: 400;
    line-height: 1.65;
    min-height: 100vh;
    transition: background .3s, color .3s;
    -webkit-font-smoothing: antialiased;
  }

  .header {
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    position: sticky; top: 0; z-index: 40;
    background: var(--bg);
    backdrop-filter: blur(12px);
    transition: background .3s;
  }
  .header-inner {
    max-width: 1200px; margin: 0 auto; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
  }
  .header-title-group { display: flex; align-items: baseline; gap: 12px; }
  .site-title {
    font-family: 'Literata', Georgia, serif;
    font-size: 1.15rem; font-weight: 400;
    letter-spacing: -.02em; line-height: 1; color: var(--ink);
  }
  .title-count {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .55rem; color: var(--ink-faint);
    letter-spacing: .08em; text-transform: uppercase;
  }
  .theme-switcher { display: flex; gap: 6px; }
  .theme-btn {
    display: flex; align-items: center; gap: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .6rem; letter-spacing: .04em;
    color: var(--ink-muted); background: transparent;
    border: 1px solid var(--border); border-radius: 8px;
    padding: 6px 12px; cursor: pointer; transition: all .15s;
  }
  .theme-btn.active {
    font-weight: 600; color: var(--ink);
    background: rgba(128,80,30,.10); border-color: var(--char-accent);
  }
  .theme-dot {
    width: 10px; height: 10px; border-radius: 50%;
    border: 1px solid rgba(0,0,0,.15); flex-shrink: 0;
  }

  .header-actions { display: flex; align-items: center; gap: 16px; }
  .signout-btn {
    display: flex; align-items: center; gap: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .6rem; letter-spacing: .04em;
    color: var(--ink-muted); background: transparent;
    border: 1px solid var(--border); border-radius: 8px;
    padding: 6px 12px; cursor: pointer; transition: all .15s;
  }
  .signout-btn:hover { color: var(--ink); border-color: var(--char-accent); }

  .main { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }

  .hero { margin-bottom: 48px; }
  .hero-eyebrow {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .55rem; font-weight: 600;
    letter-spacing: .12em; text-transform: uppercase;
    color: var(--char-accent); margin-bottom: 12px;
  }
  .hero-heading {
    font-family: 'Literata', Georgia, serif;
    font-size: 2.2rem; font-weight: 300; line-height: 1.2;
    letter-spacing: -.03em; color: var(--ink);
    max-width: 62ch; margin-bottom: 16px;
  }
  .hero-sub {
    font-family: 'Literata', Georgia, serif;
    font-style: italic; font-size: .85rem; font-weight: 300;
    color: var(--ink-muted); line-height: 1.65; max-width: 52ch;
  }

  .controls { margin-bottom: 40px; }
  .search-wrap { position: relative; max-width: 400px; }
  .search-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%); color: var(--ink-faint); pointer-events: none;
  }
  .search-input {
    width: 100%;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .7rem; color: var(--ink);
    background: var(--panel-bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 14px 10px 38px;
    outline: none; transition: border-color .15s;
  }
  .search-input:focus { border-color: var(--char-accent); }
  .search-input::placeholder { color: var(--ink-faint); }

  .results-count {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .6rem; color: var(--ink-faint);
    letter-spacing: .03em; margin-bottom: 24px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .card {
    background: var(--panel-bg);
    border: 1px solid var(--border); border-radius: 14px;
    padding: 28px; cursor: pointer;
    display: flex; flex-direction: column; gap: 14px;
    box-shadow: var(--shadow);
    transition: box-shadow .2s, transform .2s, border-color .2s;
  }
  .card:hover { box-shadow: var(--shadow-hov); transform: translateY(-2px); }
  .card-title {
    font-family: 'Literata', Georgia, serif;
    font-size: 1.05rem; font-weight: 400; line-height: 1.3;
    color: var(--ink); letter-spacing: -.01em;
  }
  .card-author {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .6rem; font-weight: 500; color: var(--char-accent);
    letter-spacing: .06em; text-transform: uppercase;
  }
  .card-footer {
    display: flex; justify-content: flex-end;
    padding-top: 10px; border-top: 1px solid var(--border);
    margin-top: auto;
  }
  .card-read-btn {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .55rem; letter-spacing: .08em; text-transform: uppercase;
    color: var(--char-accent); background: transparent;
    border: 1px solid var(--char-accent); border-radius: 20px;
    padding: 5px 14px; cursor: pointer; transition: all .15s;
  }
  .card-read-btn:hover { background: var(--char-accent); color: var(--bg); }

  .state-msg {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: .7rem; color: var(--ink-faint); letter-spacing: .04em; padding: 40px 0;
  }

  .footer { border-top: 1px solid var(--border); padding: 32px 24px; text-align: center; }
  .footer-text {
    font-family: 'Space Mono', ui-monospace, monospace;
    font-size: .55rem; color: var(--ink-faint); letter-spacing: .05em;
  }
`

const SHELL = `
  <div class="wrapper">
    <header class="header">
      <div class="header-inner">
        <div class="header-title-group">
          <span class="site-title">Leemos</span>
          
        </div>
        <div class="header-actions">
          <div class="theme-switcher" id="theme-switcher"></div>
          <button class="signout-btn" id="signout-btn" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <h1 class="hero-heading"> Available Titles</h1>
      </section>

      <div class="controls">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input class="search-input" id="search" type="search" placeholder="Search by title or author…" />
        </div>
      </div>

      <p class="results-count" id="results-count" style="display:none"></p>
      <div class="grid" id="grid"><p class="state-msg">Loading…</p></div>
    </main>

  
  </div>
`

export class BooksView extends HTMLElement {
    private _shadow: ShadowRoot
    private _books: BookSummary[] = []
    private _query = ''
    private _theme: string

    constructor() {
        super()
        this._shadow = this.attachShadow({ mode: 'open' })
        this._theme = localStorage.getItem('book-theme') || 'light'
    }

    async connectedCallback() {
        this._shadow.innerHTML = `<style>${STYLES}</style>${SHELL}`
        this._applyTheme(this._theme)
        this._buildThemeSwitcher()
        this._setupSearch()

        this._shadow.getElementById('signout-btn')?.addEventListener('click', () => signOut())

        

        await this._loadBooks()
    }

    private async _loadBooks() {
        try {
            this._books = await fetchBooks()
            const totalCount = this._shadow.getElementById('total-count')
            if (totalCount) totalCount.textContent = `${this._books.length} title${this._books.length === 1 ? '' : 's'}`
            this._render()
        } catch (err) {
            console.error('Failed to load books:', err)
            const grid = this._shadow.getElementById('grid')
            if (grid) grid.innerHTML = `<p class="state-msg">Could not load books. Please try refreshing.</p>`
        }
    }

    private _filtered(): BookSummary[] {
        const q = this._query.toLowerCase()
        if (!q) return this._books
        return this._books.filter(b =>
            b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
        )
    }

    private _render() {
        const books = this._filtered()
        const searching = this._query.length > 0

        const rc = this._shadow.getElementById('results-count')!
        rc.style.display = searching ? '' : 'none'
        if (searching) rc.textContent = books.length === 0
            ? 'No books match that search.'
            : `${books.length} book${books.length === 1 ? '' : 's'} found`

        const grid = this._shadow.getElementById('grid')!
        if (books.length === 0) {
            grid.innerHTML = `<p class="state-msg">No results.</p>`
            return
        }

        grid.innerHTML = books.map(b => `
            <article class="card">
                <h3 class="card-title">${b.title}</h3>
                <p class="card-author">${b.author}</p>
                <div class="card-footer">
                    <button class="card-read-btn" data-id="${b.id}">Read →</button>
                </div>
            </article>
        `).join('')

        grid.querySelectorAll('.card-read-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = (btn as HTMLElement).dataset.id
                window.location.href = `/old-index.html?book=${id}`
            })
        })
    }

    private _setupSearch() {
        const input = this._shadow.getElementById('search') as HTMLInputElement
        input?.addEventListener('input', () => {
            this._query = input.value
            this._render()
        })
    }

    private _applyTheme(t: string) {
        this._theme = t
        localStorage.setItem('book-theme', t)
        this.setAttribute('data-theme', t)
        this._shadow.querySelectorAll('.theme-btn').forEach(btn =>
            btn.classList.toggle('active', (btn as HTMLElement).dataset.theme === t)
        )
    }

    private _buildThemeSwitcher() {
        const themes = [
            { key: 'light', label: 'Light', dot: '#faf8f3' },
            { key: 'sepia', label: 'Sepia', dot: '#f4ecd8' },
            { key: 'dark',  label: 'Dark',  dot: '#1c1c1e'  },
        ]
        const sw = this._shadow.getElementById('theme-switcher')!
        themes.forEach(({ key, label, dot }) => {
            const btn = document.createElement('button')
            btn.className = 'theme-btn'
            btn.dataset.theme = key
            btn.innerHTML = `<span class="theme-dot" style="background:${dot}"></span>${label}`
            btn.addEventListener('click', () => this._applyTheme(key))
            sw.appendChild(btn)
        })
    }
}

customElements.define('books-view', BooksView)