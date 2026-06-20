import { useState, useEffect, useCallback } from "react";
import type { Parcelle } from "../types/database";
import { supabase } from "../lib/supabase";

const SUPABASE_OK = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

const MOCK_PARCELLES: Parcelle[] = [
  {
    id: 'mock-1', user_id: 'mock', nom: 'Parcelle Nord', description: 'Zone de culture principale', superficie: 2.5,
    unite: 'ha', culture: 'Tomates', variete: 'Roma', type_sol: 'Argileux', ph_sol: 6.8, drainage: 'Bon',
    fertilite: 'Élevée', statut: 'active', irrigation_active: true, type_irrigation: 'Goutte-à-goutte',
    source_eau: 'Forage', latitude: 3.848, longitude: 11.502, adresse: 'Zone Nord, Yaoundé',
    zone: 'Centre', geometry: null, photo_url: null, date_semis: '2026-03-15',
    date_recolte_estimee: '2026-07-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'mock-2', user_id: 'mock', nom: 'Parcelle Sud', description: null, superficie: 1.8,
    unite: 'ha', culture: 'Maïs', variete: null, type_sol: 'Limoneux', ph_sol: 7.0, drainage: 'Moyen',
    fertilite: 'Moyenne', statut: 'active', irrigation_active: false, type_irrigation: 'Aspersion',
    source_eau: 'Pluie', latitude: 3.845, longitude: 11.498, adresse: 'Zone Sud, Yaoundé',
    zone: 'Centre', geometry: null, photo_url: null, date_semis: '2026-04-01',
    date_recolte_estimee: '2026-08-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'mock-3', user_id: 'mock', nom: 'Serre A', description: 'Serre de production intensifiée', superficie: 0.5,
    unite: 'ha', culture: 'Poivrons', variete: 'Californie Wonder', type_sol: 'Sableux', ph_sol: 6.5, drainage: 'Excellent',
    fertilite: 'Élevée', statut: 'active', irrigation_active: true, type_irrigation: 'Micro-irrigation',
    source_eau: 'Réseau', latitude: 3.850, longitude: 11.505, adresse: 'Serre principale, Yaoundé',
    zone: 'Centre', geometry: null, photo_url: null, date_semis: '2026-02-01',
    date_recolte_estimee: '2026-06-30', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
];

export function useParcelles(userId?: string) {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetchParcelles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (SUPABASE_OK && userId) {
        const { data, error: err } = await supabase
          .from("parcelles")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!err && data) {
          setParcelles(data);
          setIsDemo(data.length === 0);
          if (data.length === 0) setParcelles(MOCK_PARCELLES);
          setLoading(false);
          return;
        }
      }
      setIsDemo(true);
      setParcelles(MOCK_PARCELLES);
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
      setIsDemo(true);
      setParcelles(MOCK_PARCELLES);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchParcelles(); }, [fetchParcelles]);

  const createParcelle = async (data: Partial<Parcelle>): Promise<Parcelle> => {
    const payload = {
      ...data,
      user_id: userId,
      statut: data.statut ?? 'active',
      irrigation_active: false,
      unite: data.unite ?? 'ha',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (SUPABASE_OK && userId) {
      const { data: result, error: err } = await supabase.from("parcelles").insert(payload).select().single();
      if (!err && result) {
        setParcelles(prev => [result, ...prev.filter(p => !p.id.startsWith('mock-'))]);
        setIsDemo(false);
        return result;
      }
    }
    const newP: Parcelle = {
      id: `mock-${Date.now()}`, culture: '', zone: null, superficie: 1, latitude: null, longitude: null,
      irrigation_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      description: null, unite: 'ha', variete: null, type_sol: null, ph_sol: null, drainage: null,
      fertilite: null, statut: 'active', type_irrigation: null, source_eau: null, adresse: null,
      geometry: null, photo_url: null, date_semis: null, date_recolte_estimee: null,
      user_id: userId ?? 'mock', nom: '',
      ...payload
    } as Parcelle;
    setParcelles(prev => [newP, ...prev]);
    return newP;
  };

  const updateParcelle = async (id: string, data: Partial<Parcelle>) => {
    const updated = { ...data, updated_at: new Date().toISOString() };
    if (SUPABASE_OK && !id.startsWith('mock-')) {
      const { data: result, error: err } = await supabase.from("parcelles").update(updated).eq("id", id).select().single();
      if (!err && result) {
        setParcelles(prev => prev.map(p => p.id === id ? result : p));
        return result;
      }
    }
    setParcelles(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteParcelle = async (id: string) => {
    if (SUPABASE_OK && !id.startsWith('mock-')) {
      await supabase.from("parcelles").delete().eq("id", id);
    }
    setParcelles(prev => prev.filter(p => p.id !== id));
  };

  const toggleIrrigation = async (id: string, active: boolean) => {
    if (SUPABASE_OK && !id.startsWith('mock-')) {
      const { data: result, error: err } = await supabase
        .from("parcelles")
        .update({ irrigation_active: active, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select().single();
      if (!err && result) {
        setParcelles(prev => prev.map(p => p.id === id ? result : p));
        return;
      }
    }
    setParcelles(prev => prev.map(p => p.id === id ? { ...p, irrigation_active: active } : p));
  };

  return { parcelles, loading, error, isDemo, refresh: fetchParcelles, createParcelle, updateParcelle, deleteParcelle, toggleIrrigation };
}
