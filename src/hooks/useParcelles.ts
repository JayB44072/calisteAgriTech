// src/hooks/useParcelles.ts
// CRUD complet des parcelles via Supabase.
// Fallback sur MOCK_PARCELLES si Supabase non configuré.

import { useState, useEffect, useCallback } from "react";
import type { Parcelle } from "../types";
import { MOCK_PARCELLES } from "../data/mockdata";

// Import conditionnel Supabase
let supabase: any = null;
try {
  const mod = await import("../lib/supabase"); // ajuster selon le chemin existant
  supabase = mod.supabase;
} catch {
  // ⚠️ [MOCK] Supabase non disponible - utilisation des données simulées
}

export function useParcelles(userId?: string) {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParcelles = useCallback(async () => {
    setLoading(true);
    try {
      if (supabase && userId) {
        const { data, error: err } = await supabase
          .from("parcelles")
          .select("*")
          .eq("user_id", userId)
          .order("date_creation", { ascending: false });

        if (err) throw err;
        setParcelles(data ?? []);
      } else {
        // ⚠️ [MOCK]
        await new Promise((r) => setTimeout(r, 500));
        setParcelles(MOCK_PARCELLES.filter((p) => !userId || p.user_id === userId));
      }
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors du chargement des parcelles");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchParcelles(); }, [fetchParcelles]);

  const addParcelle = async (data: Omit<Parcelle, "id" | "date_creation">) => {
    if (supabase) {
      const { data: result, error: err } = await supabase
        .from("parcelles")
        .insert({ ...data, date_creation: new Date().toISOString() })
        .select()
        .single();
      if (err) throw err;
      setParcelles((prev) => [result, ...prev]);
      return result;
    }
    // ⚠️ [MOCK]
    const newP: Parcelle = { ...data, id: `p-${Date.now()}`, date_creation: new Date().toISOString() };
    setParcelles((prev) => [newP, ...prev]);
    return newP;
  };

  const updateParcelle = async (id: string, data: Partial<Parcelle>) => {
    if (supabase) {
      const { data: result, error: err } = await supabase
        .from("parcelles").update(data).eq("id", id).select().single();
      if (err) throw err;
      setParcelles((prev) => prev.map((p) => (p.id === id ? result : p)));
      return result;
    }
    // ⚠️ [MOCK]
    setParcelles((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteParcelle = async (id: string) => {
    if (supabase) {
      const { error: err } = await supabase.from("parcelles").delete().eq("id", id);
      if (err) throw err;
    }
    setParcelles((prev) => prev.filter((p) => p.id !== id));
  };

  return { parcelles, loading, error, refresh: fetchParcelles, addParcelle, updateParcelle, deleteParcelle };
}






