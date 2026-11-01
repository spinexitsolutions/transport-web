"use client";
import { useCallback, useEffect, useState } from "react";
import type { DB, DBKey } from "@/lib/types";

export async function getKey<K extends DBKey>(key: K): Promise<DB[K]> {
  const res = await fetch(`/api/admin/db/${key}`, { cache: "no-store" });
  if (res.status === 401) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`Failed to load ${key}`);
  return res.json();
}

export async function putKey<K extends DBKey>(key: K, value: DB[K]): Promise<DB[K]> {
  const res = await fetch(`/api/admin/db/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (res.status === 401) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`Failed to save ${key}`);
  return res.json();
}

/** Load a DB key; `save` persists immediately (used by CRM screens). */
export function useKey<K extends DBKey>(key: K) {
  const [data, setData] = useState<DB[K] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getKey(key)
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [key]);

  const save = useCallback(
    async (next: DB[K]) => {
      setData(next);
      return putKey(key, next);
    },
    [key],
  );

  return { data, setData, save, error };
}

export const newId = (prefix = "") =>
  prefix + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
