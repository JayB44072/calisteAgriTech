// src/data/mockData.ts
// ⚠️ [DONNÉES SIMULÉES] Ce module génère des données IoT fictives.
// Remplacer les fonctions par des appels API réels quand le backend IoT sera prêt.
// Indicateur visuel "DEMO" affiché dans l'UI tant que ce module est actif.

import type {
  Parcelle, SensorReading, WeatherReading, IrrigationPlan,
  Material, AIRecommendation, Notification, CalendrierEvent,
  DashboardKPI, Culture, ConnectionHistory, SupportRequest
} from "../types";

// ─── Parcelles simulées ──────────────────────────────────────────────────────

export const MOCK_PARCELLES: Parcelle[] = [
  {
    id: "p1",
    user_id: "u1",
    nom: "Champ Nord - Maïs",
    superficie: 2.5,
    localisation: "Yaoundé, Centre",
    latitude: 3.848,
    longitude: 11.502,
    type_sol: "argileux",
    status: "active",
    culture_actuelle: "Maïs",
    date_creation: "2024-02-15",
    description: "Parcelle principale, sol riche en nutriments",
  },
  {
    id: "p2",
    user_id: "u1",
    nom: "Jardin Sud - Légumes",
    superficie: 0.8,
    localisation: "Yaoundé, Centre",
    latitude: 3.845,
    longitude: 11.498,
    type_sol: "limoneux",
    status: "active",
    culture_actuelle: "Tomates, Poivrons",
    date_creation: "2024-01-10",
  },
  {
    id: "p3",
    user_id: "u1",
    nom: "Champ Est - Manioc",
    superficie: 1.2,
    localisation: "Yaoundé Est",
    latitude: 3.851,
    longitude: 11.512,
    type_sol: "sableux",
    status: "repos",
    culture_actuelle: "Manioc",
    date_creation: "2023-11-20",
  },
];

// ─── Lectures capteurs simulées ──────────────────────────────────────────────

function generateSensorReadings(parcelleId: string, count = 24): SensorReading[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `sr-${parcelleId}-${i}`,
    parcelle_id: parcelleId,
    timestamp: new Date(now - i * 3600000).toISOString(),
    humidite_sol: Math.round(45 + Math.sin(i * 0.4) * 20 + Math.random() * 5),
    temperature: Math.round((26 + Math.sin(i * 0.3) * 4 + Math.random() * 2) * 10) / 10,
    humidite_air: Math.round(60 + Math.sin(i * 0.5) * 15 + Math.random() * 5),
    luminosite: Math.round(Math.max(0, 800 + Math.sin((i - 6) * 0.4) * 600)),
    ph_sol: Math.round((6.5 + Math.random() * 0.8) * 10) / 10,
    conductivite: Math.round(200 + Math.random() * 100),
    mouvement_detecte: Math.random() > 0.9,
  }));
}

export const MOCK_SENSOR_READINGS: Record<string, SensorReading[]> = {
  p1: generateSensorReadings("p1"),
  p2: generateSensorReadings("p2"),
  p3: generateSensorReadings("p3"),
};

// Lecture "temps réel" (dernière valeur)
export function getMockCurrentReading(parcelleId: string): SensorReading {
  return MOCK_SENSOR_READINGS[parcelleId]?.[0] ?? generateSensorReadings(parcelleId, 1)[0];
}

// ─── Météo simulée ──────────────────────────────────────────────────────────

export const MOCK_WEATHER: WeatherReading[] = Array.from({ length: 7 }, (_, i) => ({
  id: `w-${i}`,
  timestamp: new Date(Date.now() + i * 86400000).toISOString(),
  temperature: Math.round(24 + Math.sin(i * 0.7) * 4),
  humidite: Math.round(65 + Math.sin(i * 0.5) * 10),
  vitesse_vent: Math.round(10 + Math.random() * 20),
  precipitation: i === 2 || i === 5 ? Math.round(Math.random() * 15) : 0,
  pression: Math.round(1013 + Math.random() * 5),
  uv_index: Math.round(4 + Math.random() * 5),
  condition: (["ensoleille", "nuageux", "ensoleille", "pluvieux", "ensoleille", "pluvieux", "nuageux"] as const)[i],
}));

// ─── Irrigation simulée ──────────────────────────────────────────────────────

export const MOCK_IRRIGATION: IrrigationPlan[] = [
  {
    id: "ir1",
    parcelle_id: "p1",
    date_debut: new Date(Date.now() + 2 * 3600000).toISOString(),
    date_fin: new Date(Date.now() + 3 * 3600000).toISOString(),
    volume_eau: 500,
    methode: "Goutte-à-goutte",
    status: "planifie",
    automatique: true,
    seuil_humidite: 35,
    notes: "Irrigation automatique si humidité < 35%",
  },
  {
    id: "ir2",
    parcelle_id: "p2",
    date_debut: new Date(Date.now() - 3600000).toISOString(),
    date_fin: new Date(Date.now()).toISOString(),
    volume_eau: 200,
    methode: "Aspersion",
    status: "termine",
    automatique: false,
  },
];

// ─── Matériels simulés ───────────────────────────────────────────────────────
// ⚠️ [MOCK] Données matérielles simulées - remplacer par API IoT réelle

export const MOCK_MATERIALS: Material[] = [
  {
    id: "m1", parcelle_id: "p1", user_id: "u1",
    nom: "Capteur DHT11 #1", type: "capteur",
    numero_serie: "DHT-001", date_installation: "2024-02-20",
    status: "actif", batterie: 87, signal: 94,
    derniere_lecture: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "m2", parcelle_id: "p1", user_id: "u1",
    nom: "Capteur Humidité Sol #1", type: "capteur",
    numero_serie: "SH-002", date_installation: "2024-02-20",
    status: "actif", batterie: 62, signal: 89,
    derniere_lecture: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "m3", parcelle_id: "p1", user_id: "u1",
    nom: "Pompe à eau ESP32", type: "pompe",
    numero_serie: "ESP-003", date_installation: "2024-03-01",
    status: "actif", batterie: 100, signal: 97,
  },
  {
    id: "m4", parcelle_id: "p2", user_id: "u1",
    nom: "Capteur mouvement PIR", type: "capteur",
    numero_serie: "PIR-004", date_installation: "2024-01-15",
    status: "maintenance", batterie: 15, signal: 70,
  },
];

// ─── Recommandations IA simulées ─────────────────────────────────────────────
// ⚠️ [MOCK IA] Recommandations générées localement - remplacer par API IA réelle

export const MOCK_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "ai1", parcelle_id: "p1", user_id: "u1",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: "irrigation", priorite: "haute",
    titre: "Irrigation recommandée d'ici 4h",
    description: "L'humidité du sol de votre parcelle 'Champ Nord - Maïs' est à 38%, proche du seuil critique de 35%. Une irrigation de 30 minutes est recommandée pour maintenir une croissance optimale du maïs.",
    action_requise: "Déclencher l'irrigation manuellement ou attendre le déclenchement automatique à 18h",
    lu: false, source: "ia_mock",
  },
  {
    id: "ai2", parcelle_id: "p2", user_id: "u1",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: "nuisible", priorite: "moyenne",
    titre: "Risque de mildiou détecté",
    description: "Les conditions météorologiques actuelles (humidité > 80%, température 22°C) favorisent le développement du mildiou sur vos tomates. Inspectez les feuilles et appliquez un fongicide préventif si nécessaire.",
    lu: false, source: "ia_mock",
  },
  {
    id: "ai3", parcelle_id: "p1", user_id: "u1",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: "sol", priorite: "faible",
    titre: "Enrichissement du sol conseillé",
    description: "Le pH de votre sol est à 5.8, légèrement acide. L'ajout de calcaire agricole (50 kg/ha) améliorerait la disponibilité des nutriments pour le maïs.",
    lu: true, source: "ia_mock",
  },
  {
    id: "ai4", parcelle_id: "p1", user_id: "u1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "recolte", priorite: "moyenne",
    titre: "Récolte prévue dans 3 semaines",
    description: "Selon les données de croissance collectées, votre maïs devrait atteindre la maturité aux alentours du 15 juillet. Préparez votre équipement de récolte.",
    lu: false, source: "ia_mock",
  },
];

// ─── Notifications simulées ──────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", user_id: "u1", parcelle_id: "p1",
    titre: "Humidité critique détectée",
    message: "L'humidité du sol du Champ Nord est descendue à 32% - sous le seuil d'alerte.",
    type: "alerte", lu: false,
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "n2", user_id: "u1",
    titre: "Irrigation terminée avec succès",
    message: "La session d'irrigation du Jardin Sud s'est terminée. 200L d'eau utilisés.",
    type: "succes", lu: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "n3", user_id: "u1",
    titre: "Nouvelle recommandation IA disponible",
    message: "Votre assistant IA a une nouvelle recommandation concernant vos cultures de tomates.",
    type: "info", lu: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

// ─── Calendrier simulé ───────────────────────────────────────────────────────

export const MOCK_CALENDRIER: CalendrierEvent[] = [
  {
    id: "c1", parcelle_id: "p1",
    titre: "Semis de maïs", date_debut: "2024-02-20",
    type: "semis", effectue: true,
  },
  {
    id: "c2", parcelle_id: "p1",
    titre: "Application engrais NPK",
    date_debut: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    type: "engrais", effectue: false,
    description: "50 kg/ha d'engrais NPK 20-10-10",
  },
  {
    id: "c3", parcelle_id: "p1",
    titre: "Récolte prévue",
    date_debut: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
    type: "recolte", effectue: false,
  },
  {
    id: "c4", parcelle_id: "p2",
    titre: "Traitement anti-mildiou",
    date_debut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    type: "traitement", effectue: false,
    description: "Fongicide cuivrique - 3L/ha",
  },
];

// ─── KPIs Dashboard ──────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_KPI: DashboardKPI = {
  total_parcelles: 3,
  parcelles_actives: 2,
  humidite_moyenne: 52,
  temperature_moyenne: 26.4,
  alertes_actives: 1,
  prochaines_irrigations: 2,
  rendement_estime: 4200,
  capteurs_actifs: 3,
};

// ─── Historique connexions admin ─────────────────────────────────────────────

export const MOCK_CONNECTION_HISTORY: ConnectionHistory[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ch-${i}`,
  user_id: "u1",
  ip_address: `192.168.1.${100 + i}`,
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64)",
  timestamp: new Date(Date.now() - i * 43200000).toISOString(),
  statut: i === 3 ? "echec" : "succès",
  localisation: "Yaoundé, Cameroun",
}));

// ─── Support simulé ──────────────────────────────────────────────────────────

export const MOCK_SUPPORT: SupportRequest[] = [
  {
    id: "s1", user_id: "u1",
    sujet: "Capteur DHT11 ne répond plus",
    description: "Mon capteur DHT11 n'envoie plus de données depuis hier soir.",
    status: "en_cours", priorite: "haute",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    reponse_admin: "Nous avons vu votre ticket. Essayez de redémarrer le module ESP32.",
  },
];