import { useState, useEffect, useCallback, useRef } from "react";
import type { Notification } from "../types/database";
import { supabase } from "../lib/supabase";

const SUPABASE_OK = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// Request browser notification permission
export async function requestBrowserNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function showBrowserNotif(titre: string, message: string, type: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const icons: Record<string, string> = {
    alerte: '🚨', succes: '✅', avertissement: '⚠️', info: 'ℹ️',
  };
  try {
    new Notification(`${icons[type] ?? 'ℹ️'} CalisteAgriTech`, {
      body: `${titre}\n${message}`,
      icon: '/favicon.ico',
      tag: `caliste-${Date.now()}`,
    });
  } catch { /* silently fail if blocked */ }
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter(n => !n.lu).length;

  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data && mountedRef.current) {
        setNotifications(data as Notification[]);
      }
    } catch { /* ignore */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchNotifications();

    if (!SUPABASE_OK || !userId) return;

    // Realtime: listen for new notifications
    const channel = supabase
      .channel(`notif:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const notif = payload.new as Notification;
        if (mountedRef.current) {
          setNotifications(prev => [notif, ...prev]);
          // Show browser notification
          showBrowserNotif(notif.titre, notif.message, notif.type);
        }
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markRead = async (id: string) => {
    if (SUPABASE_OK) {
      await supabase.from("notifications").update({ lu: true }).eq("id", id);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const markAllRead = async () => {
    if (SUPABASE_OK && userId) {
      await supabase.from("notifications").update({ lu: true }).eq("user_id", userId).eq("lu", false);
    }
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const dismiss = async (id: string) => {
    if (SUPABASE_OK) {
      await supabase.from("notifications").delete().eq("id", id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    if (SUPABASE_OK && userId) {
      await supabase.from("notifications").delete().eq("user_id", userId);
    }
    setNotifications([]);
  };

  // Send a notification (from within the app — e.g. sensor alert)
  const addNotification = async (
    targetUserId: string,
    titre: string,
    message: string,
    type: Notification['type'] = 'info',
    lien?: string
  ) => {
    if (!SUPABASE_OK) return;
    await supabase.from("notifications").insert({
      user_id: targetUserId,
      titre,
      message,
      type,
      lien: lien ?? null,
    });
    // If self-notification, show browser notif immediately (won't wait for realtime)
    if (targetUserId === userId) {
      showBrowserNotif(titre, message, type);
    }
  };

  return { notifications, unreadCount, loading, markRead, markAllRead, dismiss, clearAll, addNotification, refetch: fetchNotifications };
}

// Sensor alert thresholds — generates in-app notifications when data crosses limits
export function useSensorAlerts(
  userId: string | undefined,
  sensorData: Record<string, { humidite_sol?: number | null; temperature_air?: number | null } | null>,
  parcelleNames: Record<string, string>
) {
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || !SUPABASE_OK) return;

    Object.entries(sensorData).forEach(([parcelleId, data]) => {
      if (!data) return;
      const nom = parcelleNames[parcelleId] ?? parcelleId.slice(0, 8);

      // Humidity low alert
      if (data.humidite_sol !== null && data.humidite_sol !== undefined && data.humidite_sol < 30) {
        const key = `hum-${parcelleId}-${Math.floor(data.humidite_sol / 5)}`;
        if (!alertedRef.current.has(key)) {
          alertedRef.current.add(key);
          supabase.from("notifications").insert({
            user_id: userId,
            titre: 'Humidité critique',
            message: `Parcelle ${nom} : humidité du sol à ${data.humidite_sol.toFixed(0)}% — irrigation recommandée`,
            type: 'alerte',
            lien: '/irrigation',
          }).then(() => {
            showBrowserNotif('Humidité critique', `Parcelle ${nom} : ${data.humidite_sol!.toFixed(0)}% — irriguer`, 'alerte');
          });
        }
      }

      // High temperature alert
      if (data.temperature_air !== null && data.temperature_air !== undefined && data.temperature_air > 37) {
        const key = `temp-high-${parcelleId}-${Math.floor(data.temperature_air)}`;
        if (!alertedRef.current.has(key)) {
          alertedRef.current.add(key);
          supabase.from("notifications").insert({
            user_id: userId,
            titre: 'Température élevée',
            message: `Parcelle ${nom} : température à ${data.temperature_air.toFixed(0)}°C — risque de stress thermique`,
            type: 'avertissement',
          }).then(() => {
            showBrowserNotif('Température élevée', `Parcelle ${nom} : ${data.temperature_air!.toFixed(0)}°C`, 'avertissement');
          });
        }
      }
    });
  }, [sensorData, userId, parcelleNames]);
}
