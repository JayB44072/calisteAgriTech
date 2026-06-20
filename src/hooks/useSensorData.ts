// src/hooks/useSensorData.ts
import { useState, useEffect, useCallback } from "react";
import type { SensorReading as SensorReadingLegacy, WeatherReading } from "../types";
import { getMockCurrentReading, MOCK_WEATHER, MOCK_SENSOR_READINGS } from "../data/mockData";
import { supabase } from "../lib/supabase";

const SUPABASE_OK = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const POLL_INTERVAL = 3000;

function addNoise(value: number, range = 2): number {
  return Math.round((value + (Math.random() - 0.5) * range) * 10) / 10;
}

// Unified sensor reading shape (works with both old sensor_data and new sensor_readings tables)
export interface SensorDataDB {
  id: string;
  parcelle_id: string | null;
  device_id?: string | null;
  temperature: number | null;
  temperature_air?: number | null;
  humidite_sol: number | null;
  humidite_air: number | null;
  niveau_eau?: number | null;
  pluviometrie?: number | null;
  created_at: string;
}

function legacyToDB(r: SensorReadingLegacy): SensorDataDB {
  return {
    id: r.id,
    parcelle_id: r.parcelle_id,
    temperature: r.temperature,
    humidite_sol: r.humidite_sol,
    humidite_air: r.humidite_air,
    created_at: r.timestamp,
  };
}

function makeLive(parcelleId: string): SensorDataDB {
  const base = getMockCurrentReading(parcelleId);
  return {
    id: `live-${parcelleId}-${Date.now()}`,
    parcelle_id: parcelleId,
    temperature: addNoise(base.temperature, 0.5),
    humidite_sol: Math.max(0, Math.min(100, addNoise(base.humidite_sol))),
    humidite_air: Math.max(0, Math.min(100, addNoise(base.humidite_air))),
    created_at: new Date().toISOString(),
  };
}

async function fetchFromSupabase(parcelleId: string): Promise<SensorDataDB[] | null> {
  if (parcelleId.startsWith('mock-')) return null;
  const { data: newData, error: newErr } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("parcelle_id", parcelleId)
    .order("created_at", { ascending: false })
    .limit(48);
  if (newErr || !newData) return null;
  return newData.map((r: any) => ({
    id: r.id,
    parcelle_id: r.parcelle_id,
    device_id: r.device_id,
    temperature: r.temperature_sol ?? r.temperature_air ?? null,
    temperature_air: r.temperature_air,
    humidite_sol: r.humidite_sol,
    humidite_air: r.humidite_air,
    niveau_eau: r.niveau_eau,
    pluviometrie: r.pluviometrie,
    created_at: r.created_at,
  }));
}

// ─── Hook : données capteurs d'une parcelle ──────────────────────────────────
export function useSensorData(parcelleId?: string) {
  const [sensorData, setSensorData] = useState<SensorDataDB[]>([]);
  const [latestData, setLatestData] = useState<SensorDataDB | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parcelleId) { setLoading(false); return; }
    setLoading(true);
    let cancelled = false;

    async function fetch() {
      if (SUPABASE_OK) {
        try {
          const data = await fetchFromSupabase(parcelleId!);
          if (data && !cancelled) {
            setSensorData(data);
            setLatestData(data[0]);
            setLoading(false);
            return;
          }
        } catch { /* fall through */ }
      }
      if (!cancelled) {
        const mockData = (MOCK_SENSOR_READINGS[parcelleId!] ?? []).map(legacyToDB);
        setSensorData(mockData);
        setLatestData(mockData[0] ?? null);
        setLoading(false);
      }
    }

    fetch();

    const interval = setInterval(() => {
      if (!cancelled) {
        const live = makeLive(parcelleId!);
        setSensorData(prev => [live, ...prev.slice(0, 47)]);
        setLatestData(live);
      }
    }, POLL_INTERVAL);

    return () => { cancelled = true; clearInterval(interval); };
  }, [parcelleId]);

  return { sensorData, latestData, loading };
}

// ─── Hook : données de toutes les parcelles ──────────────────────────────────
export function useAllSensorData(parcelleIds: string[]) {
  const [latestAll, setLatestAll] = useState<Record<string, SensorDataDB | null>>({});
  const [allData, setAllData] = useState<Record<string, SensorDataDB[]>>({});
  const [loading, setLoading] = useState(true);
  const key = parcelleIds.join(",");

  useEffect(() => {
    if (parcelleIds.length === 0) { setLoading(false); return; }
    let cancelled = false;

    async function fetchAll() {
      const results: Record<string, SensorDataDB[]> = {};
      const latest: Record<string, SensorDataDB | null> = {};

      for (const pid of parcelleIds) {
        if (SUPABASE_OK) {
          try {
            const data = await fetchFromSupabase(pid);
            if (data) {
              results[pid] = data;
              latest[pid] = data[0];
              continue;
            }
          } catch { /* fall through */ }
        }
        const mockData = (MOCK_SENSOR_READINGS[pid] ?? []).map(legacyToDB);
        results[pid] = mockData;
        latest[pid] = mockData[0] ?? null;
      }

      if (!cancelled) {
        // Ensure every parcelle has at least live-generated data
        const liveLatest: Record<string, SensorDataDB | null> = {};
        for (const pid of parcelleIds) {
          liveLatest[pid] = latest[pid] ?? makeLive(pid);
        }
        setAllData(results);
        setLatestAll(liveLatest);
        setLoading(false);
      }
    }

    fetchAll();

    const interval = setInterval(() => {
      if (!cancelled) {
        setLatestAll(prev => {
          const next = { ...prev };
          for (const pid of parcelleIds) next[pid] = makeLive(pid);
          return next;
        });
        // Append live readings to allData so charts stay alive
        setAllData(prev => {
          const next = { ...prev };
          for (const pid of parcelleIds) {
            const entry = makeLive(pid);
            next[pid] = [entry, ...(next[pid] ?? []).slice(0, 47)];
          }
          return next;
        });
      }
    }, POLL_INTERVAL);

    return () => { cancelled = true; clearInterval(interval); };
  }, [key]);

  return { latestAll, allData, loading };
}

// ─── Hook : météo ────────────────────────────────────────────────────────────
export function useWeather(_parcelleId?: string) {
  const [weather, setWeather] = useState<WeatherReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setWeather(MOCK_WEATHER); setLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);

  return { weather, current: weather[0] ?? null, forecast: weather.slice(1), loading };
}

// ─── Hook legacy : lecture capteur simple ────────────────────────────────────
export function useSensorReading(parcelleId: string) {
  const [reading, setReading] = useState<SensorReadingLegacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      await new Promise(r => setTimeout(r, 400));
      const base = getMockCurrentReading(parcelleId);
      const live: SensorReadingLegacy = {
        ...base,
        id: `live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        humidite_sol: Math.max(0, Math.min(100, addNoise(base.humidite_sol))),
        temperature: addNoise(base.temperature, 0.5),
        humidite_air: Math.max(0, Math.min(100, addNoise(base.humidite_air))),
      };
      setReading(live);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Impossible de récupérer les données capteur.");
    } finally {
      setLoading(false);
    }
  }, [parcelleId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { reading, loading, error, lastUpdated, refresh: fetchData };
}
