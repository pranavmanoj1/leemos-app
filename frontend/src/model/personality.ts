// ---------- Supporting types ----------

/** A single page or location reference in the text. */

import { TextReference } from './book'

/** Wraps any claim about the character with provenance + confidence. */
interface Observation<T> {
  value: T;
  /** Where this was first revealed — critical for "as of page N" filtering. */
  revealedAt: TextReference;
  /** "stated" = explicit in text; "inferred" = deduced from behavior. */
  source: "stated" | "inferred";
  /** 0–1, how strongly the text supports this. */
  confidence: number;
}

/** A trait that can change over the course of the story. */
interface EvolvingTrait {
  trait: string;            // e.g. "trust in others"
  changes: Observation<string>[]; // ordered timeline of states
}

interface Relationship {
  characterName: string;
  relation: string;         // "brother", "rival", "mentor"
  dynamic: Observation<string>[]; // how it shifts over time
}

// ---------- The main class ----------

export class CharacterProfile {
  // Identity
  name: string;
  aliases: Observation<string>[] = [];
  role?: Observation<string>;        // protagonist, foil, etc.

  // The reading boundary — nothing past this should be exposed
  asOfPage: number;

  // Core descriptive attributes (each carries provenance)
  physicalAppearance: Observation<string>[] = [];
  personalityTraits: Observation<string>[] = [];
  values: Observation<string>[] = [];
  motivations: Observation<string>[] = [];
  fears: Observation<string>[] = [];
  flaws: Observation<string>[] = [];

  // Voice — the most useful part for recreation
  speechPatterns: Observation<string>[] = [];
  sampleDialogue: Observation<string>[] = []; // actual quoted lines

  // Knowledge & background
  backstory: Observation<string>[] = [];
  knowledgeDomains: Observation<string>[] = []; // what they'd plausibly know

  // Dynamic elements
  relationships: Relationship[] = [];
  arc: EvolvingTrait[] = [];          // how they change
  keyEvents: Observation<string>[] = []; // plot moments involving them

  // Meta
  openQuestions: string[] = [];        // unresolved mysteries as of this page

  constructor(name: string, asOfPage: number) {
    this.name = name;
    this.asOfPage = asOfPage;
  }

  /** Filter every observation to only what's revealed by `asOfPage`. */
  spoilerSafeView(): CharacterProfile { /* ... */ return this; }

  /** Serialize into a clean prompt payload for the LLM. */
  toPromptContext(): string { /* ... */ return ""; }
}