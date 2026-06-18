import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationSettings } from '../types/database';

export function useNotificationSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code === 'PGRST116') {
      // No row yet, create default
      const { data: newData, error: insertError } = await supabase
        .from('notification_settings')
        .insert({ user_id: userId })
        .select()
        .single();
      if (!insertError) setSettings(newData);
    } else if (data) {
      setSettings(data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!userId || !settings) return;
    const { data, error } = await supabase
      .from('notification_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    setSettings(data);
    return data;
  }, [userId, settings]);

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
