import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Parcelle } from '../types/database';

export function useParcelles(userId: string | undefined) {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParcelles = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('parcelles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setParcelles(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchParcelles();
  }, [fetchParcelles]);

  const createParcelle = useCallback(async (p: Omit<Parcelle, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'irrigation_active'>) => {
    const { data, error } = await supabase
      .from('parcelles')
      .insert({ ...p, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    setParcelles(prev => [data, ...prev]);
    return data;
  }, [userId]);

  const updateParcelle = useCallback(async (id: string, updates: Partial<Parcelle>) => {
    const { data, error } = await supabase
      .from('parcelles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setParcelles(prev => prev.map(p => p.id === id ? data : p));
    return data;
  }, []);

  const deleteParcelle = useCallback(async (id: string) => {
    const { error } = await supabase.from('parcelles').delete().eq('id', id);
    if (error) throw error;
    setParcelles(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleIrrigation = useCallback(async (id: string, active: boolean) => {
    return updateParcelle(id, { irrigation_active: active });
  }, [updateParcelle]);

  return { parcelles, loading, createParcelle, updateParcelle, deleteParcelle, toggleIrrigation, refetch: fetchParcelles };
}
