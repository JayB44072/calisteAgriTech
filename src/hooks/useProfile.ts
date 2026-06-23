import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types/database';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) { setLoading(false); return; }
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Realtime : re-fetch si l'admin modifie le profil (suspension, suppression)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('profile-changes-' + userId)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}`,
      }, () => { fetchProfile(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }, [userId]);

  const setRole = useCallback(async (role: UserRole) => {
    return updateProfile({ role });
  }, [updateProfile]);

  return { profile, loading, updateProfile, setRole, refetch: fetchProfile };
}
