import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Parcelle, SensorData } from '../types/database';

/**
 * Invisible background simulation that subtly updates sensor data
 * every 8 seconds with realistic small variations, mimicking live IoT telemetry.
 */
export function useBackgroundSimulation(parcelles: Parcelle[], latestData: Record<string, SensorData | null>) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const parcellesRef = useRef(parcelles);
  const latestRef = useRef(latestData);

  parcellesRef.current = parcelles;
  latestRef.current = latestData;

  const simulateTick = useCallback(async () => {
    const currentParcelles = parcellesRef.current;
    if (currentParcelles.length === 0) return;

    const inserts: Array<{ parcelle_id: string; temperature: number; humidite_sol: number; humidite_air: number }> = [];

    for (const p of currentParcelles) {
      const latest = latestRef.current[p.id];

      // Base values from latest reading or defaults
      const baseTemp = latest?.temperature ?? 28;
      const baseHumSol = latest?.humidite_sol ?? 50;
      const baseHumAir = latest?.humidite_air ?? 70;

      // Small organic variations: +/- 0.2°C, +/- 0.5% moisture
      const tempDelta = (Math.random() - 0.5) * 0.4;
      const solDelta = (Math.random() - 0.5) * 1.0;
      const airDelta = (Math.random() - 0.5) * 0.6;

      // Irrigation effect: slight moisture increase
      const irrigationBoost = p.irrigation_active ? 0.3 : 0;

      // Time-of-day subtle effect (warmer during day, cooler at night)
      const hour = new Date().getHours();
      const timeTempEffect = (hour >= 10 && hour <= 16) ? 0.1 : -0.05;

      const temperature = Math.round((baseTemp + tempDelta + timeTempEffect) * 100) / 100;
      const humidite_sol = Math.round(Math.max(15, Math.min(98, baseHumSol + solDelta + irrigationBoost)) * 100) / 100;
      const humidite_air = Math.round(Math.max(25, Math.min(100, baseHumAir + airDelta)) * 100) / 100;

      inserts.push({ parcelle_id: p.id, temperature, humidite_sol, humidite_air });
    }

    try {
      const { error } = await supabase.from('sensor_data').insert(inserts);
      if (error) console.error('Background simulation error:', error);
    } catch {
      // Silent fail - this runs in background
    }
  }, []);

  useEffect(() => {
    // Start background simulation after initial data exists
    // Wait 15 seconds before starting to allow user to create parcelles
    const startDelay = setTimeout(() => {
      // Do an initial tick
      simulateTick();
      // Then run every 8 seconds
      intervalRef.current = setInterval(simulateTick, 8000);
    }, 15000);

    return () => {
      clearTimeout(startDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulateTick]);
}
