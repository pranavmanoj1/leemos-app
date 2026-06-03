// in-their-own-words.ts
// 

/** Source data for one word-portrait. Glyphs from `text` become the ink. */
export interface Author {
    image: string;
    line?: string;
    text: string;
    gamma?: number;
    fit?: number;
    cropTop?: number;
    blackBias?: number;
  }
  
  /** Live style overrides via `setTweaks()`. All fields optional. */
  export interface PortraitTweaks {
    fontSize?: number;
    contrast?: number;
    opacity?: number;
    font?: string;
    ink?: string;
    bg?: string;
  }
  
  /** Screen-space bounds of the portrait (used to punch rain around it). */
  export interface RainCutout {
    x: number;
    y: number;
    w: number;
    h: number;
    scale: number;
    pad?: number;
  }
  
  /** Custom events dispatched by the element. */
  export type PortraitLoadedEvent = CustomEvent<void>;
  export type PortraitErrorEvent = CustomEvent<unknown>;
  export type TweakChangeEvent = CustomEvent<PortraitTweaks>;
  
  declare global {
    interface HTMLElementTagNameMap {
      "in-their-own-words": InTheirOwnWords;
    }
  }
  
  // ── Hardcoded content ────────────────────────────────────────────────────────
  
  export const HARDCODED_AUTHORS: Author[] = [
    {
      image: "/images/dostoevsky.png",
      line: "Beauty will save the world.",
      gamma: 1.30,
      fit: 0.96,
      cropTop: 0.15,
      text:
        "I am a sick man. I am a spiteful man. I am an unattractive man. I believe my liver is diseased. " +
        "However, I know nothing at all about my disease, and do not know for certain what ails me. " +
        "Man is a mystery. If you have to spend your whole life unravelling it, do not say that you have " +
        "wasted time. I am occupying myself with that mystery, because I want to be a man. " +
        "Pain and suffering are always inevitable for a large intelligence and a deep heart. " +
        "The real great men, I think, must feel great sadness on the earth. " +
        "Beauty will save the world. The mystery of human existence lies not in just staying alive, " +
        "but in finding something to live for. " +
        "To love someone means to see them as God intended them. " +
        "What is hell? I maintain that it is the suffering of being unable to love. " +
        "Above all, do not lie to yourself. The man who lies to himself and listens to his own lie " +
        "comes to a point that he cannot distinguish the truth within him, or around him, and so loses " +
        "all respect for himself and for others. " +
        "Taking a new step, uttering a new word, is what people fear most. " +
        "We are all responsible to all for all, apart from our own sins. ",
    },
  ];
  
  /** The Brothers Karamazov — Book I, ch. 4 (Alyosha). Public-domain excerpt. */
  export const HARDCODED_RAIN_TEXT =
    "He was only twenty, his brother Ivan was in his twenty-fourth year at the time, while their elder brother Dmitri was twenty-seven. " +
    "First of all, I must explain that this young man, Alyosha, was not a fanatic, and, in my opinion at least, was not even a mystic. " +
    "I may as well give my full opinion from the beginning. He was simply an early lover of humanity, and that he adopted the monastic life was simply because at that time it struck him, so to say, as the ideal escape for his soul struggling from the darkness of worldly wickedness to the light of love. " +
    "And the reason this life struck him in this way was that he found in it at that time, as he thought, an extraordinary being, our celebrated elder, Zossima, to whom he became attached with all the warm first love of his ardent heart. " +
    "But I do not dispute that he was very strange even at that time, and had been so indeed from his cradle. I have mentioned already, by the way, that though he lost his mother in his fourth year he remembered her all his life—her face, her caresses, as though she stood living before me. " +
    "Such memories may persist, as every one knows, from an even earlier age, even from two years old, but scarcely standing out through a whole lifetime like spots of light out of darkness, like a corner torn out of a huge picture, which has all faded and disappeared except that fragment. That is how it was with him. " +
    "He remembered one still summer evening, an open window, the slanting rays of the setting sun; in a corner of the room the holy image, before it a lighted lamp, and on her knees before the image his mother, sobbing hysterically with cries and moans, snatching him up in both arms, squeezing him close till it hurt, and praying for him to the Mother of God, holding him out in both arms to the image as though to put him under the Mother's protection ... and suddenly a nurse runs in and snatches him from her in terror. That was the picture! " +
    "And Alyosha remembered his mother's face at that minute. He used to say that it was frenzied but beautiful as he remembered. But he rarely cared to speak of this memory to any one. " +
    "In his childhood and youth he was by no means expansive, and talked little indeed, but not from shyness or a sullen unsociability; quite the contrary, from something different, from a sort of inner preoccupation entirely personal and unconcerned with other people, but so important to him that he seemed, as it were, to forget others on account of it. " +
    "But he was fond of people: he seemed throughout his life to put implicit trust in people: yet no one ever looked on him as a simpleton or naïve person. There was something about him which made one feel at once that he did not care to be a judge of others—that he would never take it upon himself to criticize and would never condemn any one for anything. " +
    "He seemed, indeed, to accept everything without the least condemnation though often grieving bitterly: and this was so much so that no one could surprise or frighten him even in his earliest youth. " +
    "Coming at twenty to his father's house, which was a very sink of filthy debauchery, he, chaste and pure as he was, simply withdrew in silence when to look on was unbearable, but without the slightest sign of contempt or condemnation. " +
    "His father, who had once been in a dependent position, and so was sensitive and ready to take offense, met him at first with distrust and sullenness. He does not say much, he used to say, and thinks the more. But soon, within a fortnight indeed, he took to embracing him and kissing him terribly often, with drunken tears, with sottish sentimentality, yet he evidently felt a real and deep affection for him, such as he had never been capable of feeling for any one before. " +
    "Every one, indeed, loved this young man wherever he went, and it was so from his earliest childhood. When he entered the household of his patron and benefactor, Yefim Petrovitch Polenov, he gained the hearts of all the family, so that they looked on him quite as their own child. " +
    "Yet he entered the house at such a tender age that he could not have acted from design nor artfulness in winning affection. So that the gift of making himself loved directly and unconsciously was inherent in him, in his very nature, so to speak. " +
    "It was the same at school, though he seemed to be just one of those children who are distrusted, sometimes ridiculed, and even disliked by their schoolfellows. He was dreamy, for instance, and rather solitary. From his earliest childhood he was fond of creeping into a corner to read, and yet he was a general favorite all the while he was at school. " +
    "He was rarely playful or merry, but any one could see at the first glance that this was not from any sullenness. On the contrary he was bright and good-tempered. He never tried to show off among his schoolfellows. " +
    "Perhaps because of this, he was never afraid of any one, yet the boys immediately understood that he was not proud of his fearlessness and seemed to be unaware that he was bold and courageous. He never resented an insult. " +
    "It would happen that an hour after the offense he would address the offender or answer some question with as trustful and candid an expression as though nothing had happened between them. And it was not that he seemed to have forgotten or intentionally forgiven the affront, but simply that he did not regard it as an affront, and this completely conquered and captivated the boys. " +
    "He had one characteristic which made all his schoolfellows from the bottom class to the top want to mock at him, not from malice but because it amused them. This characteristic was a wild fanatical modesty and chastity. He could not bear to hear certain words and certain conversations about women. " +
    "Seeing that Alyosha Karamazov put his fingers in his ears when they talked of that, they used sometimes to crowd round him, pull his hands away, and shout nastiness into both ears, while he struggled, slipped to the floor, tried to hide himself without uttering one word of abuse, enduring their insults in silence. " +
    "But at last they left him alone and gave up taunting him with being a regular girl, and what's more they looked upon it with compassion as a weakness. He was always one of the best in the class but was never first. " +
    "At the time of Yefim Petrovitch's death Alyosha had two more years to complete at the provincial gymnasium. The inconsolable widow went almost immediately after his death for a long visit to Italy with her whole family, which consisted only of women and girls. " +
    "Alyosha went to live in the house of two distant relations of Yefim Petrovitch, ladies whom he had never seen before. On what terms he lived with them he did not know himself. It was very characteristic of him, indeed, that he never cared at whose expense he was living. " +
    "In that respect he was a striking contrast to his elder brother Ivan, who struggled with poverty for his first two years in the university, maintained himself by his own efforts, and had from childhood been bitterly conscious of living at the expense of his benefactor. " +
    "But this strange trait in Alyosha's character must not, I think, be criticized too severely, for at the slightest acquaintance with him any one would have perceived that Alyosha was one of those youths, almost of the type of religious enthusiast, who, if they were suddenly to come into possession of a large fortune, would not hesitate to give it away for the asking. " +
    "In general he seemed scarcely to know the value of money, not, of course, in a literal sense. When he was given pocket-money, which he never asked for, he was either terribly careless of it so that it was gone in a moment, or he kept it for weeks together, not knowing what to do with it. " +
    "In later years Pyotr Alexandrovitch Miüsov, a man very sensitive on the score of money and bourgeois honesty, pronounced the following judgment, after getting to know Alyosha: " +
    "Here is perhaps the one man in the world whom you might leave alone without a penny, in the center of an unknown town of a million inhabitants, and he would not come to harm, he would not die of cold and hunger, for he would be fed and sheltered at once. " +
    "He did not finish his studies at the gymnasium. A year before the end of the course he suddenly announced to the ladies that he was going to see his father about a plan which had occurred to him. " +
    "It soon became apparent that he was looking for his mother's tomb. He practically acknowledged at the time that that was the only object of his visit. But it can hardly have been the whole reason of it. " +
    "Fyodor Pavlovitch could not show him where his second wife was buried, for he had never visited her grave since he had thrown earth upon her coffin, and in the course of years had entirely forgotten where she was buried. " +
    "Fyodor Pavlovitch, by the way, had for some time previously not been living in our town. Three or four years after his wife's death he had gone to the south of Russia and finally turned up in Odessa, where he spent several years. " +
    "He finally returned to our town only three years before Alyosha's arrival. His former acquaintances found him looking terribly aged, although he was by no means an old man. " +
    "Alyosha's arrival seemed to affect even his moral side, as though something had awakened in this prematurely old man which had long been dead in his soul. " +
    "Do you know, he used often to say, looking at Alyosha, that you are like her, the crazy woman—that was what he used to call his dead wife, Alyosha's mother. " +
    "Grigory it was who pointed out the crazy woman's grave to Alyosha. He took him to our town cemetery and showed him in a remote corner a cast-iron tombstone, cheap but decently kept. " +
    "To Alyosha's amazement this tomb turned out to be Grigory's doing. He had put it up on the poor crazy woman's grave at his own expense. Alyosha showed no particular emotion at the sight of his mother's grave. " +
    "Not long after visiting his mother's grave Alyosha suddenly announced that he wanted to enter the monastery, and that the monks were willing to receive him as a novice. The old man knew that the elder Zossima, who was living in the monastery hermitage, had made a special impression upon his gentle boy. " +
    "That is the most honest monk among them, of course, he observed, after listening in thoughtful silence to Alyosha, and seeming scarcely surprised at his request. So that's where you want to be, my gentle boy? " +
    "He was half drunk, and suddenly he grinned his slow half-drunken grin. I had a presentiment that you would end in something like this. Well, to be sure you have your own two thousand. That's a dowry for you. And I'll never desert you, my angel. " +
    "But there are no hooks there, said Alyosha, looking gently and seriously at his father. Yes, yes, only the shadows of hooks, I know, I know. That's how a Frenchman described hell. " +
    "And he even began blubbering. He was sentimental. He was wicked and sentimental.";
  
  export const HARDCODED_TWEAKS: Required<PortraitTweaks> = {
    fontSize: 12,
    contrast: 1.0,
    opacity: 1.0,
    font: "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
    ink: "#f4f1ea",
    bg: "#000000",
  };
  
  // ── Internal types ───────────────────────────────────────────────────────────
  
  interface PortraitSettings {
    fontSize: number;
    contrast: number;
    opacity: number;
    font: string;
    ink: string;
    bg: string;
  }
  
  interface PortraitLayer {
    canvas: HTMLCanvasElement;
    w: number;
    h: number;
  }
  
  interface ScreenRect {
    x: number;
    y: number;
    w: number;
    h: number;
    scale: number;
  }
  
  interface MouseState {
    x: number;
    y: number;
    active: boolean;
  }
  
  interface RainColumn {
    x: number;
    chars: string;
    y: number;
    speed: number;
  }
  
  interface ViewportDims {
    w: number;
    h: number;
  }
  
  // ── Constants & helpers ──────────────────────────────────────────────────────
  
  const TAG_NAME = "in-their-own-words";

  const OVERLAY_TAGLINE_WORDS = ["Leemos", "Reading", "Love", "Beauty"] as const;
  const OVERLAY_WORD_CYCLE_MS = 3000;

  const DEFAULT_SETTINGS: PortraitSettings = { ...HARDCODED_TWEAKS };
  
  const STYLES = `
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--itow-bg, #000000);
      color: var(--itow-ink, #f4f1ea);
      font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
      -webkit-font-smoothing: antialiased;
    }
    canvas {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }
    .rain {
      z-index: 0;
      position: fixed !important;
      width: 100vw !important;
      height: 100vh !important;
      inset: 0 !important;
      top: 0 !important;
      left: 0 !important;
    }
    .stage { z-index: 2; }
    .overlay {
      position: absolute;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }
    .author-card {
      position: absolute;
      left: 50%;
      bottom: 13vh;
      transform: translateX(-50%);
      width: min(90vw, 60ch);
      text-align: center;
    }
    .author-card .line {
      font-family: inherit;
      font-size: 15px;
      font-weight: 400;
      color: #ffffff;
      line-height: 1.45;
    }
    .loading {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      background: var(--itow-bg, #000000);
      color: rgba(244, 241, 234, 0.45);
      font-size: 11px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      transition: opacity 0.8s ease;
    }
    :host(.loaded) .loading {
      opacity: 0;
      pointer-events: none;
    }
  `;
  
  const dpr = (): number => Math.min(2, window.devicePixelRatio || 1);
  
  function get2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    return ctx;
  }
  
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  function sampleLuminance(
    img: HTMLImageElement,
    cols: number,
    rows: number,
    cropTop = 0,
  ): Float32Array {
    const c = document.createElement("canvas");
    c.width = cols;
    c.height = rows;
    const ctx = get2d(c);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const sy = Math.round(img.naturalHeight * cropTop);
    const sh = img.naturalHeight - sy;
    ctx.drawImage(img, 0, sy, img.naturalWidth, sh, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      const r = data[i * 4]!;
      const g = data[i * 4 + 1]!;
      const b = data[i * 4 + 2]!;
      lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }
    return lum;
  }
  
  function percentile(sorted: Float32Array, p: number): number {
    const idx = Math.max(0, Math.min(sorted.length - 1, Math.round(p * (sorted.length - 1))));
    return sorted[idx]!;
  }
  
  function requireShadowChild<T extends Element>(
    root: ShadowRoot,
    selector: string,
  ): T {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`Missing shadow element: ${selector}`);
    return el;
  }
  
  // ── Web component ────────────────────────────────────────────────────────────
  
  export class InTheirOwnWords extends HTMLElement {
    // shadow DOM refs
    private readonly _shadow: ShadowRoot;
    private _rainCanvas!: HTMLCanvasElement;
    private _rainCtx!: CanvasRenderingContext2D;
    private _stageCanvas!: HTMLCanvasElement;
    private _stageCtx!: CanvasRenderingContext2D;
    private _overlay!: HTMLDivElement;
  
    // state (hardcoded defaults)
    private readonly _authors: Author[] = HARDCODED_AUTHORS;
    private readonly _rainText: string = HARDCODED_RAIN_TEXT;
    private _images: HTMLImageElement[] = [];
    private _portraits: PortraitLayer[] = [];
    private _ready = false;
    private _mouse: MouseState = { x: 0, y: 0, active: false };
    private _settings: PortraitSettings = { ...DEFAULT_SETTINGS };
    private _columns: RainColumn[] = [];
    private _lastRainT = 0;
    private _spot: HTMLCanvasElement | null = null;
    private _rebuildQueued = false;
    private _portraitRaf: number | null = null;
    private _rainRaf: number | null = null;
    private _wordCycleTimer: ReturnType<typeof setInterval> | null = null;
    private _wordCycleIndex = 0;
    private _taglineLine: HTMLDivElement | null = null;
    private _started = false;
    private _resizeObserver: ResizeObserver | null = null;
  
    private readonly _onResize: () => void;
    private readonly _onPointerMove: (e: PointerEvent) => void;
    private readonly _onPointerLeave: () => void;
  
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
  
      this._onResize = () => {
        this._resizeStage();
        this._resizeRain();
        this._queueRebuild();
      };
      this._onPointerMove = (e: PointerEvent) => {
        const r = this.getBoundingClientRect();
        this._mouse = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          active: true,
        };
      };
      this._onPointerLeave = () => {
        this._mouse.active = false;
      };
  
      this._renderShell();
      this._buildOverlay();
    }
  
    /** Apply live style overrides (density, contrast, palette, etc.). */
    setTweaks(tweaks: PortraitTweaks): void {
      const s = this._settings;
      let needRebuild = false;
  
      if (tweaks.fontSize != null && tweaks.fontSize !== s.fontSize) {
        s.fontSize = tweaks.fontSize;
        needRebuild = true;
      }
      if (tweaks.contrast != null && tweaks.contrast !== s.contrast) {
        s.contrast = tweaks.contrast;
        needRebuild = true;
      }
      if (tweaks.opacity != null && tweaks.opacity !== s.opacity) {
        s.opacity = tweaks.opacity;
        needRebuild = true;
      }
      if (tweaks.font != null && tweaks.font !== s.font) {
        s.font = tweaks.font;
        needRebuild = true;
      }
      if (tweaks.ink != null && tweaks.ink !== s.ink) {
        s.ink = tweaks.ink;
        needRebuild = true;
        this.style.setProperty("--itow-ink", tweaks.ink);
      }
      if (tweaks.bg != null && tweaks.bg !== s.bg) {
        s.bg = tweaks.bg;
        this.style.setProperty("--itow-bg", tweaks.bg);
      }
  
      if (needRebuild) this._queueRebuild();
      this.dispatchEvent(
        new CustomEvent("tweakchange", { detail: { ...tweaks }, bubbles: true }),
      );
    }
  
    /** Screen-space bounds of the portrait (for extensions / rain cutout). */
    getRainCutout(): RainCutout | null {
      return this._getRainCutoutNow();
    }
  
    connectedCallback(): void {
      this._resizeObserver = new ResizeObserver(this._onResize);
      this._resizeObserver.observe(this);
      this.addEventListener("pointermove", this._onPointerMove, { passive: true });
      this.addEventListener("pointerleave", this._onPointerLeave);
      this._startWordCycle();
      void this._start();
    }

    disconnectedCallback(): void {
      this._resizeObserver?.disconnect();
      this.removeEventListener("pointermove", this._onPointerMove);
      this.removeEventListener("pointerleave", this._onPointerLeave);
      this._stopWordCycle();
      if (this._portraitRaf != null) cancelAnimationFrame(this._portraitRaf);
      if (this._rainRaf != null) cancelAnimationFrame(this._rainRaf);
      this._portraitRaf = this._rainRaf = null;
      this._started = false;
      this._ready = false;
    }
  
    // ── shell ──────────────────────────────────────────────────────────────────
  
    private _renderShell(): void {
      this._shadow.innerHTML = `
        <style>${STYLES}</style>
        <canvas class="rain" part="rain"></canvas>
        <canvas class="stage" part="stage"></canvas>
        <div class="overlay" part="overlay"></div>
      `;
      this._rainCanvas = requireShadowChild(this._shadow, ".rain");
      this._rainCtx = get2d(this._rainCanvas);
      this._stageCanvas = requireShadowChild(this._shadow, ".stage");
      this._stageCtx = get2d(this._stageCanvas);
      this._overlay = requireShadowChild(this._shadow, ".overlay");
    }
  
    private _buildOverlay(): void {
      this._stopWordCycle();
      this._overlay.replaceChildren();

      const card = document.createElement("div");
      card.className = "author-card";
      const line = document.createElement("div");
      line.className = "line";
      card.appendChild(line);
      this._overlay.appendChild(card);
      this._taglineLine = line;
      this._updateTagline();
    }

    private _updateTagline(): void {
      if (!this._taglineLine) return;
      const word = OVERLAY_TAGLINE_WORDS[this._wordCycleIndex % OVERLAY_TAGLINE_WORDS.length];
      this._taglineLine.textContent = `${word} will save the world`;
    }

    private _startWordCycle(): void {
      this._stopWordCycle();
      if (!this._taglineLine) return;
      this._updateTagline();
      this._wordCycleTimer = setInterval(() => {
        this._wordCycleIndex =
          (this._wordCycleIndex + 1) % OVERLAY_TAGLINE_WORDS.length;
        this._updateTagline();
      }, OVERLAY_WORD_CYCLE_MS);
    }

    private _stopWordCycle(): void {
      if (this._wordCycleTimer != null) {
        clearInterval(this._wordCycleTimer);
        this._wordCycleTimer = null;
      }
    }
  
    private async _start(): Promise<void> {
      if (this._started) return;
      this._started = true;
      this._lastRainT = performance.now();
      this._resizeStage();
      this._resizeRain();
      this._portraitLoop();
      this._rainLoop();
  
      try {
        this._images = await Promise.all(
          this._authors.map((a) => loadImage(a.image)),
        );
        this._rebuildAll();
        this.classList.add("loaded");
        this.dispatchEvent(new CustomEvent("portrait-loaded", { bubbles: true }));
      } catch (err) {
        this.dispatchEvent(
          new CustomEvent("portrait-error", { detail: err, bubbles: true }),
        );
      }
    }
  
    private _dims(): ViewportDims {
      return {
        w: this.clientWidth || window.innerWidth,
        h: this.clientHeight || window.innerHeight,
      };
    }
  
    // ── portrait engine ────────────────────────────────────────────────────────
  
    private _buildPortrait(
      author: Author,
      img: HTMLImageElement,
      boxW: number,
      boxH: number,
    ): PortraitLayer {
      const s = this._settings;
      const scale = dpr();
      const fs = s.fontSize;
      const cellW = fs * 0.6;
      const cellH = fs * 0.95;
      const cols = Math.max(8, Math.round(boxW / cellW));
      const rows = Math.max(8, Math.round(boxH / cellH));
      const cropTop = author.cropTop ?? 0;
      const lum = sampleLuminance(img, cols, rows, cropTop);
  
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(boxW * scale);
      canvas.height = Math.round(boxH * scale);
      const ctx = get2d(canvas);
      ctx.scale(scale, scale);
      ctx.textBaseline = "top";
      ctx.font = `${fs}px ${s.font}`;
      ctx.fillStyle = s.ink;
  
      const sorted = Float32Array.from(lum).sort();
      const blackP = Math.max(0.05, Math.min(0.9, 0.46 + (s.contrast - 1) * 0.33));
      let black = percentile(sorted, blackP);
      const white = percentile(sorted, 0.985);
      black += author.blackBias ?? 0;
      const gamma = author.gamma ?? 1.35;
      const span = Math.max(0.0001, white - black);
      const text = author.text.replace(/\s+/g, " ");
      const tlen = text.length;
      let ti = 0;
      const CUT = 0.30;
  
      for (let r = 0; r < rows; r++) {
        const y = r * cellH;
        for (let c = 0; c < cols; c++) {
          const ch = text[ti++ % tlen]!;
          let v = (lum[r * cols + c]! - black) / span;
          v = v < 0 ? 0 : v > 1 ? 1 : v;
          v = Math.pow(v, gamma);
          if (v < CUT) continue;
          v = (v - CUT) / (1 - CUT);
          if (ch === " ") continue;
          ctx.globalAlpha = Math.min(1, v * 1.06) * s.opacity;
          ctx.fillText(ch, c * cellW, y);
        }
      }
      ctx.globalAlpha = 1;
      return { canvas, w: boxW, h: boxH };
    }
  
    private _portraitBox(img: HTMLImageElement, author: Author): { w: number; h: number } {
      const { w: vw, h: vh } = this._dims();
      const fit = author.fit ?? 1;
      const targetH = Math.min(vh * 0.82, 880) * fit;
      const cropTop = author.cropTop ?? 0;
      const ar = img.naturalWidth / (img.naturalHeight * (1 - cropTop));
      let h = targetH;
      let w = h * ar;
      const maxW = Math.min(vw * 0.92, 760) * fit;
      if (w > maxW) {
        w = maxW;
        h = w / ar;
      }
      return { w: Math.round(w), h: Math.round(h) };
    }
  
    private _rebuildAll(): void {
      if (!this._images.length) return;
      this._portraits = this._authors.map((author, i) => {
        const img = this._images[i]!;
        const box = this._portraitBox(img, author);
        return this._buildPortrait(author, img, box.w, box.h);
      });
      this._ready = true;
    }
  
    private _queueRebuild(): void {
      if (this._rebuildQueued) return;
      this._rebuildQueued = true;
      requestAnimationFrame(() => {
        this._rebuildQueued = false;
        this._rebuildAll();
      });
    }
  
    private _resizeStage(): void {
      const scale = dpr();
      const { w, h } = this._dims();
      this._stageCanvas.width = Math.round(w * scale);
      this._stageCanvas.height = Math.round(h * scale);
      this._stageCanvas.style.width = `${w}px`;
      this._stageCanvas.style.height = `${h}px`;
    }
  
    private _portraitScreenRect(p: PortraitLayer, scale: number): ScreenRect {
      const { w: vw, h: vh } = this._dims();
      const w = p.w * scale;
      const h = p.h * scale;
      return { x: (vw - w) / 2, y: (vh - h) / 2, w, h, scale };
    }
  
    private _drawPortraitAt(p: PortraitLayer, alpha: number, scale: number): void {
      if (alpha <= 0.001) return;
      const r = this._portraitScreenRect(p, scale);
      const scaleDpr = dpr();
      const sctx = this._stageCtx;
      sctx.setTransform(scaleDpr, 0, 0, scaleDpr, 0, 0);
      sctx.globalAlpha = 1;
      sctx.fillStyle = "#000000";
      sctx.fillRect(r.x, r.y, r.w, r.h);
      sctx.globalAlpha = alpha;
      sctx.drawImage(p.canvas, 0, 0, p.canvas.width, p.canvas.height, r.x, r.y, r.w, r.h);
      sctx.globalAlpha = 1;
      sctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  
    private _getRainCutoutNow(): RainCutout | null {
      if (!this._ready || !this._portraits.length) return null;
      const p = this._portraits[0];
      if (!p) return null;
      const breathe = 1 + 0.012 * Math.sin(performance.now() / 4200);
      return { pad: 10, ...this._portraitScreenRect(p, breathe) };
    }
  
    private _applySpotlight(): void {
      const m = this._mouse;
      if (!m.active) return;
      const scale = dpr();
      const R = 180;
      const sz = Math.round(R * 2 * scale);
      if (!this._spot) this._spot = document.createElement("canvas");
      if (this._spot.width !== sz) {
        this._spot.width = sz;
        this._spot.height = sz;
      }
      const g = get2d(this._spot);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = "source-over";
      g.clearRect(0, 0, sz, sz);
      const grad = g.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.45, "rgba(255,255,255,0.7)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, sz, sz);
      const sx = Math.round((m.x - R) * scale);
      const sy = Math.round((m.y - R) * scale);
      g.globalCompositeOperation = "source-in";
      g.drawImage(this._stageCanvas, sx, sy, sz, sz, 0, 0, sz, sz);
      const sctx = this._stageCtx;
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < 3; k++) sctx.drawImage(this._spot, sx, sy);
      sctx.globalCompositeOperation = "source-over";
    }
  
    private _renderPortrait(): void {
      if (!this._ready) return;
      const sctx = this._stageCtx;
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.clearRect(0, 0, this._stageCanvas.width, this._stageCanvas.height);
      const breathe = 1 + 0.012 * Math.sin(performance.now() / 4200);
      this._drawPortraitAt(this._portraits[0]!, 1, breathe);
      this._applySpotlight();
    }
  
    private _portraitLoop(): void {
      this._renderPortrait();
      this._portraitRaf = requestAnimationFrame(() => this._portraitLoop());
    }
  
    // ── rain engine ────────────────────────────────────────────────────────────
  
    private _buildColumnChars(count: number, startOffset: number): string {
      const stream = this._rainText.slice(startOffset) + this._rainText;
      let chars = "";
      while (chars.length < count) chars += stream;
      return chars.slice(0, count);
    }
  
    private _initRainColumns(): void {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const COL_SPACING = 11;
      const CHAR_HEIGHT = 12;
      const colCount = Math.floor(W / COL_SPACING);
      const charsNeeded = Math.ceil((H * 2) / CHAR_HEIGHT) + 10;
      this._columns = [];
      for (let i = 0; i < colCount; i++) {
        const start = Math.floor(Math.random() * this._rainText.length);
        this._columns.push({
          x: i * COL_SPACING + COL_SPACING / 2,
          chars: this._buildColumnChars(charsNeeded, start),
          y: Math.random() * H,
          speed: 60 + Math.random() * 50,
        });
      }
    }
  
    private _resizeRain(): void {
      const scale = dpr();
      const W = window.innerWidth;
      const H = window.innerHeight;
      this._rainCanvas.width = Math.round(W * scale);
      this._rainCanvas.height = Math.round(H * scale);
      this._rainCanvas.style.width = `${W}px`;
      this._rainCanvas.style.height = `${H}px`;
      this._rainCtx.setTransform(scale, 0, 0, scale, 0, 0);
      this._initRainColumns();
    }
  
    private _punchRainAroundPortrait(): void {
      const cut = this._getRainCutoutNow();
      if (!cut) return;
      const pad = cut.pad ?? 0;
      const ctx = this._rainCtx;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cut.x - pad, cut.y - pad, cut.w + pad * 2, cut.h + pad * 2);
      ctx.restore();
    }
  
    private _drawRain(now: number): void {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const CHAR_HEIGHT = 12;
      const dt = Math.min(0.05, (now - this._lastRainT) / 1000);
      this._lastRainT = now;
      const ctx = this._rainCtx;
      ctx.fillStyle = this._settings.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.font = `${CHAR_HEIGHT}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#ffffff";

      for (const col of this._columns) {
        col.y += col.speed * dt;
        const blockH = col.chars.length * CHAR_HEIGHT;
        if (col.y >= blockH) col.y -= blockH;
        for (let i = 0; i < col.chars.length; i++) {
          const ch = col.chars[i]!;
          if (ch === " ") continue;
          const charY = i * CHAR_HEIGHT + col.y;
          for (const drawY of [charY, charY - blockH]) {
            if (drawY < -CHAR_HEIGHT || drawY > H) continue;
            ctx.fillText(ch, col.x, drawY);
          }
        }
      }
      this._punchRainAroundPortrait();
    }
  
    private _rainLoop(): void {
      this._rainRaf = requestAnimationFrame((t) => {
        this._drawRain(t);
        this._rainLoop();
      });
    }
  }
  
  // ── Registration ─────────────────────────────────────────────────────────────
  
  export function registerInTheirOwnWords(
    name: string = TAG_NAME,
  ): typeof InTheirOwnWords {
    if (!customElements.get(name)) {
      customElements.define(name, InTheirOwnWords);
    }
    return InTheirOwnWords;
  }
  
  registerInTheirOwnWords();
  