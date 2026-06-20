import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationSettings } from '../types/database';

const SUPABASE_OK = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

const DEFAULT_SETTINGS: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  email_alerts: true,
  push_moisture_alerts: true,
  push_weather_alerts: true,
  push_irrigation_alerts: true,
  push_sensor_alerts: true,
  critical_moisture_threshold: 30,
  critical_temp_high: 40,
  critical_temp_low: 5,
};

export function useNotificationSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    if (!SUPABASE_OK) {
      setSettings({ id: 'local', user_id: userId, created_at: '', updated_at: '', ...DEFAULT_SETTINGS });
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('notification_settings').select('*').eq('user_id', userId).single();
    if (error && error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase.from('notification_settings').insert({ user_id: userId, ...DEFAULT_SETTINGS }).select().single();
      if (!insertError && newData) setSettings(newData);
      else setSettings({ id: 'local', user_id: userId, created_at: '', updated_at: '', ...DEFAULT_SETTINGS });
    } else if (data) {
      setSettings(data);
    } else {
      setSettings({ id: 'local', user_id: userId, created_at: '', updated_at: '', ...DEFAULT_SETTINGS });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates } : null);
    if (!userId || !SUPABASE_OK) return;
    try {
      const { data, error } = await supabase.from('notification_settings').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single();
      if (error) throw error;
      if (data) setSettings(data);
    } catch { /* settings already updated optimistically */ }
  }, [userId]);

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
