import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SensorData } from '../types/database';

export function useSensorData(parcelleId: string | undefined) {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestData, setLatestData] = useState<SensorData | null>(null);

  const fetchData = useCallback(async () => {
    if (!parcelleId) return;
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('parcelle_id', parcelleId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    setSensorData(data ?? []);
    setLatestData(data?.[0] ?? null);
    setLoading(false);
  }, [parcelleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!parcelleId) return;

    const channel = supabase
      .channel(`sensor_data:${parcelleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
          filter: `parcelle_id=eq.${parcelleId}`,
        },
        (payload) => {
          const newEntry = payload.new as SensorData;
          setSensorData(prev => [newEntry, ...prev].slice(0, 100));
          setLatestData(newEntry);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parcelleId]);

  return { sensorData, latestData, loading, refetch: fetchData };
}

export function useAllSensorData(parcelleIds: string[]) {
  const [allData, setAllData] = useState<Record<string, SensorData[]>>({});
  const [latestAll, setLatestAll] = useState<Record<string, SensorData | null>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (parcelleIds.length === 0) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .in('parcelle_id', parcelleIds)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const grouped: Record<string, SensorData[]> = {};
    const latest: Record<string, SensorData | null> = {};
    for (const id of parcelleIds) {
      grouped[id] = [];
      latest[id] = null;
    }
    for (const row of data ?? []) {
      if (!grouped[row.parcelle_id]) grouped[row.parcelle_id] = [];
      grouped[row.parcelle_id].push(row);
      if (!latest[row.parcelle_id]) latest[row.parcelle_id] = row;
    }
    setAllData(grouped);
    setLatestAll(latest);
    setLoading(false);
  }, [parcelleIds.join(',')]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (parcelleIds.length === 0) return;

    const channel = supabase
      .channel('all_sensor_data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
        },
        (payload) => {
          const newEntry = payload.new as SensorData;
          if (parcelleIds.includes(newEntry.parcelle_id)) {
            setAllData(prev => ({
              ...prev,
              [newEntry.parcelle_id]: [newEntry, ...(prev[newEntry.parcelle_id] ?? [])].slice(0, 100),
            }));
            setLatestAll(prev => ({
              ...prev,
              [newEntry.parcelle_id]: newEntry,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parcelleIds.join(',')]);

  return { allData, latestAll, loading, refetch: fetchData };
}
