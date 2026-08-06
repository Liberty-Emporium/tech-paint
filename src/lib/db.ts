// Persistent data store for TechPaint (Coltrane Tech Paint).
// Backed by JSON files on disk so data survives server restarts/redeploys.
// This replaces the previous in-memory `global.__estimates` / hardcoded demo
// rows, which were lost every restart.
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Files live under <cwd>/data/ (same directory the app already uses for users.json).
const DATA_DIR = join(process.cwd(), 'data');

export type Collection = 'estimates' | 'customers' | 'documents';

function fileFor(collection: Collection): string {
  return join(DATA_DIR, `${collection}.json`);
}

// In-memory cache per collection (avoids re-reading disk on every request).
const cache: Record<Collection, any[] | null> = {
  estimates: null,
  customers: null,
  documents: null,
};

async function load(collection: Collection): Promise<any[]> {
  if (cache[collection] !== null) return cache[collection];
  try {
    const raw = await readFile(fileFor(collection), 'utf-8');
    const parsed = JSON.parse(raw);
    cache[collection] = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache[collection] = [];
  }
  return cache[collection];
}

async function persist(collection: Collection): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const data = cache[collection] ?? [];
  await writeFile(fileFor(collection), JSON.stringify(data, null, 2), 'utf-8');
}

/** Return all records in a collection (clone so callers can't mutate the cache). */
export async function all<T = any>(collection: Collection): Promise<T[]> {
  const rows = await load(collection);
  return JSON.parse(JSON.stringify(rows));
}

/** Find a single record by `id`. */
export async function findById<T = any>(collection: Collection, id: string): Promise<T | undefined> {
  const rows = await load(collection);
  const hit = rows.find((r: any) => String(r.id) === String(id));
  return hit ? JSON.parse(JSON.stringify(hit)) : undefined;
}

/** Insert a record and return it. Assigns `id` if not already present. */
export async function insert<T extends { id?: string }>(collection: Collection, record: T): Promise<T & { id: string }> {
  const rows = await load(collection);
  const withId: T & { id: string } = {
    id: `${collection[0]}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    ...record,
  } as T & { id: string };
  rows.push(withId);
  await persist(collection);
  return JSON.parse(JSON.stringify(withId));
}

/** Update a record by id (merges `updates`). Returns the updated record or null. */
export async function update<T = any>(collection: Collection, id: string, updates: Partial<T>): Promise<T | null> {
  const rows = await load(collection);
  const idx = rows.findIndex((r: any) => String(r.id) === String(id));
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...updates };
  await persist(collection);
  return JSON.parse(JSON.stringify(rows[idx]));
}

/** Delete a record by id. Returns true if something was removed. */
export async function remove(collection: Collection, id: string): Promise<boolean> {
  const rows = await load(collection);
  const before = rows.length;
  const next = rows.filter((r: any) => String(r.id) !== String(id));
  if (next.length === before) return false;
  cache[collection] = next;
  await persist(collection);
  return true;
}

/** Insert a record only if a matching one doesn't already exist (upsert by id). */
export async function upsert<T extends { id: string }>(collection: Collection, record: T): Promise<T> {
  const rows = await load(collection);
  const idx = rows.findIndex((r: any) => String(r.id) === String(record.id));
  if (idx === -1) {
    rows.push(record);
  } else {
    rows[idx] = { ...rows[idx], ...record };
  }
  await persist(collection);
  return JSON.parse(JSON.stringify(record));
}
