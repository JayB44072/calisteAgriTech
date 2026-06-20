import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const SUPABASE_OK = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export interface Material {
  id: string;
  user_id: string;
  parcelle_id: string | null;
  nom: string;
  type: string;
  fabricant: string | null;
  modele: string | null;
  numero_serie: string | null;
  batterie: number | null;
  signal: number | null;
  statut: 'actif' | 'inactif' | 'maintenance' | 'hors_service';
  localisation: string | null;
  derniere_maintenance: string | null;
  prochaine_maintenance: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewMaterial = Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const MOCK_MATERIALS: Material[] = [
  { id: 'mock-m1', user_id: 'mock', parcelle_id: 'mock-1', nom: 'Capteur humidité N1', type: 'capteur', fabricant: 'AgriSense', modele: 'AS-200', numero_serie: 'AS200-001', batterie: 78, signal: 85, statut: 'actif', localisation: 'Parcelle Nord', derniere_maintenance: '2026-01-15', prochaine_maintenance: '2026-07-15', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mock-m2', user_id: 'mock', parcelle_id: 'mock-2', nom: 'Pompe irrigation S1', type: 'pompe', fabricant: 'IrriTech', modele: 'IP-500', numero_serie: 'IP500-042', batterie: null, signal: 72, statut: 'actif', localisation: 'Parcelle Sud', derniere_maintenance: '2026-02-01', prochaine_maintenance: '2026-08-01', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mock-m3', user_id: 'mock', parcelle_id: 'mock-1', nom: 'Station météo', type: 'station_meteo', fabricant: 'WeatherPro', modele: 'WP-100', numero_serie: 'WP100-007', batterie: 15, signal: 60, statut: 'maintenance', localisation: 'Zone centrale', derniere_maintenance: '2025-12-01', prochaine_maintenance: '2026-06-01', notes: 'Batterie faible', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mock-m4', user_id: 'mock', parcelle_id: null, nom: 'Drone inspection', type: 'drone', fabricant: 'AgriFly', modele: 'AF-Pro', numero_serie: 'AFP-012', batterie: 92, signal: null, statut: 'actif', localisation: 'Hangar principal', derniere_maintenance: '2026-03-10', prochaine_maintenance: '2026-09-10', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export function useMaterials(userId?: string) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    if (SUPABASE_OK && userId) {
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setMaterials(data);
          setIsDemo(false);
          setLoading(false);
          return;
        }
      } catch { /* fall through */ }
    }
    setMaterials(MOCK_MATERIALS);
    setIsDemo(true);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const addMaterial = useCallback(async (mat: NewMaterial) => {
    if (!SUPABASE_OK || !userId) throw new Error('Supabase non disponible');
    const { data, error } = await supabase
      .from('materials')
      .insert({ ...mat, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    setMaterials(prev => [data, ...prev]);
    setIsDemo(false);
    return data;
  }, [userId]);

  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    if (!SUPABASE_OK || id.startsWith('mock-')) {
      setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      return;
    }
    const { error } = await supabase.from('materials').update(updates).eq('id', id);
    if (error) throw error;
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMaterial = useCallback(async (id: string) => {
    if (!id.startsWith('mock-')) {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
    }
    setMaterials(prev => prev.filter(m => m.id !== id));
  }, []);

  return { materials, loading, isDemo, addMaterial, updateMaterial, deleteMaterial, refresh: fetchMaterials };
}
