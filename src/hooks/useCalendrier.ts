import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CalendrierCulture } from '../types/database';

export function useCalendrier(userId: string | undefined) {
  const [events, setEvents] = useState<CalendrierCulture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('calendrier_culture')
      .select('*')
      .eq('user_id', userId)
      .order('date_debut', { ascending: true });
    if (error) throw error;
    setEvents(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvents = useCallback(async (newEvents: Omit<CalendrierCulture, 'id' | 'user_id' | 'created_at' | 'complete'>[]) => {
    const rows = newEvents.map(e => ({ ...e, user_id: userId }));
    const { data, error } = await supabase
      .from('calendrier_culture')
      .insert(rows)
      .select();
    if (error) throw error;
    setEvents(prev => [...prev, ...data].sort((a, b) => a.date_debut.localeCompare(b.date_debut)));
    return data;
  }, [userId]);

  const toggleComplete = useCallback(async (id: string, complete: boolean) => {
    const { data, error } = await supabase
      .from('calendrier_culture')
      .update({ complete })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setEvents(prev => prev.map(e => e.id === id ? data : e));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from('calendrier_culture').delete().eq('id', id);
    if (error) throw error;
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return { events, loading, addEvents, toggleComplete, deleteEvent, refetch: fetchEvents };
}
