import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { seed } from "./seed";
import type { DB, DBKey } from "./types";

/**
 * Tiny JSON-file database that powers both the CMS and the CRM.
 * - Lives at data/db.json (auto-created from lib/seed.ts on first run).
 * - Falls back to in-memory storage on read-only hosts (e.g. serverless),
 *   so the demo never crashes. Swap this file for Postgres/Mongo in production.
 */
const FILE = path.join(process.cwd(), "data", "db.json");

const g = globalThis as unknown as { __kinetikDB?: DB; __kinetikWritable?: boolean };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

async function load(): Promise<DB> {
  if (g.__kinetikDB) return g.__kinetikDB;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    // merge with seed so newly added keys always exist
    g.__kinetikDB = { ...clone(seed), ...JSON.parse(raw) } as DB;
  } catch {
    g.__kinetikDB = clone(seed);
    await persist(g.__kinetikDB);
  }
  return g.__kinetikDB!;
}

async function persist(db: DB) {
  if (g.__kinetikWritable === false) return;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
    g.__kinetikWritable = true;
  } catch {
    g.__kinetikWritable = false; // read-only FS → keep data in memory
  }
}

export async function getDB(): Promise<DB> {
  return load();
}

export async function get<K extends DBKey>(key: K): Promise<DB[K]> {
  const db = await load();
  return db[key];
}

export async function set<K extends DBKey>(key: K, value: DB[K]): Promise<DB[K]> {
  const db = await load();
  db[key] = value;
  await persist(db);
  return value;
}

export async function update<K extends DBKey>(key: K, fn: (current: DB[K]) => DB[K]): Promise<DB[K]> {
  const db = await load();
  db[key] = fn(db[key]);
  await persist(db);
  return db[key];
}

export async function resetDB(): Promise<DB> {
  g.__kinetikDB = clone(seed);
  await persist(g.__kinetikDB);
  return g.__kinetikDB;
}

export const uid = (prefix = "") =>
  prefix + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
