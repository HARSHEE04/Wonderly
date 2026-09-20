// Client-side app state shared across page navigations within this SPA-like
// Next.js App Router session — mirrors what Flutter passed as page-route
// constructor params (LearnSessionResult, CreativeChallenge, etc.) and the
// LibraryStore singleton (lib/state/library_store.dart).
//
// Module-level singletons persist across client-side <Link>/router.push
// navigations (same JS runtime, no full reload) but reset on a hard page
// refresh — same lifetime as Flutter's in-memory navigation stack.

import type { LearnSessionResult, CreativeChallenge, LibraryEntry, SceneAnalysis } from './types';

class FlowState {
  learnSessionResult: LearnSessionResult | null = null;
  challenge: CreativeChallenge | null = null;
  origin: 'Create' | 'Learn' = 'Create';
  conceptTitle?: string;
  sessionId?: string;
  capturedImageDataUrl?: string;
  pendingBlob?: Blob;
  currentSceneAnalysis: SceneAnalysis | null = null;
}

export const flowState = new FlowState();

const SEED_LIBRARY: LibraryEntry[] = [
  {
    id: 'seed-1',
    challengeTitle: 'Marigold Poster Study',
    origin: 'Create',
    photoTint: '#FBEAC9',
    photoGlyph: 'spark',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'seed-2',
    challengeTitle: 'Symmetry in the Garden',
    origin: 'Learn',
    conceptTitle: 'Symmetry',
    photoTint: '#DCEEEE',
    photoGlyph: 'symmetry',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

const LIBRARY_STORAGE_KEY = 'wonderly.library.v1';

type Listener = () => void;

class LibraryStore {
  private items: LibraryEntry[];
  private listeners = new Set<Listener>();

  constructor() {
    this.items = this.load();
  }

  private load(): LibraryEntry[] {
    if (typeof window === 'undefined') return SEED_LIBRARY;
    try {
      const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (!raw) return SEED_LIBRARY;
      const parsed = JSON.parse(raw) as LibraryEntry[];
      return parsed.length ? parsed : SEED_LIBRARY;
    } catch {
      return SEED_LIBRARY;
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(this.items));
  }

  getSnapshot = (): LibraryEntry[] => this.items;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.persist();
    for (const l of this.listeners) l();
  }

  add(entry: LibraryEntry) {
    this.items = [entry, ...this.items];
    this.notify();
  }

  mergeRemote(artworks: Record<string, unknown>[]) {
    let changed = false;
    for (const artwork of artworks) {
      const remoteId = artwork.id?.toString();
      if (!remoteId || this.items.some((e) => e.remoteId === remoteId)) continue;
      const metadata = (artwork.metadata as Record<string, unknown>) ?? {};
      const origin = (metadata.origin as string) === 'Learn' ? 'Learn' : 'Create';
      this.items = [
        {
          id: remoteId,
          remoteId,
          challengeTitle: (metadata.title as string) ?? (artwork.title as string) ?? 'Untitled challenge',
          origin,
          conceptTitle: metadata.conceptTitle as string | undefined,
          photoTint: origin === 'Learn' ? '#DCEEEE' : '#FBEAC9',
          photoGlyph: origin === 'Learn' ? 'symmetry' : 'spark',
          date: (artwork.createdAt as string) ?? new Date().toISOString(),
        },
        ...this.items,
      ];
      changed = true;
    }
    if (changed) this.notify();
  }
}

export const libraryStore = new LibraryStore();
