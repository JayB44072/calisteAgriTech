// src/hooks/useSensorData.ts
// ⚠️ [MOCK IoT] Simule un polling en temps réel vers les capteurs ESP32.
// Remplacer fetchSensorData() par un vrai appel API quand le backend IoT est prêt.

import { useState, useEffect, useCallback } from "react";
import type { SensorReading, WeatherReading } from "../types";
import { getMockCurrentReading, MOCK_WEATHER, MOCK_SENSOR_READINGS } from "../data/mockdata";

const POLL_INTERVAL = 30000; // 30 secondes - simulé

function addNoise(value: number, range = 2): number {
  return Math.round((value + (Math.random() - 0.5) * range) * 10) / 10;
}

// ─── Hook : lecture temps réel d'une parcelle ────────────────────────────────
export function useSensorReading(parcelleId: string) {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // ⚠️ [MOCK] Simuler latence réseau
      await new Promise((r) => setTimeout(r, 400));

      const base = getMockCurrentReading(parcelleId);
      const live: SensorReading = {
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

// ─── Hook : historique capteurs (24h) ────────────────────────────────────────
export function useSensorHistory(parcelleId: string) {
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // ⚠️ [MOCK] Simuler chargement
    const timeout = setTimeout(() => {
      setHistory(MOCK_SENSOR_READINGS[parcelleId] ?? []);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, [parcelleId]);

  return { history, loading };
}

// ─── Hook : météo (7 jours) ──────────────────────────────────────────────────
export function useWeather(parcelleId?: string) {
  const [weather, setWeather] = useState<WeatherReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWeather(MOCK_WEATHER);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [parcelleId]);

  const current = weather[0] ?? null;
  const forecast = weather.slice(1);

  return { weather, current, forecast, loading };
}