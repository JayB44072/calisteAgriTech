// src/types/index.ts
// Entités de données complètes - WellAgriTech Smart Farm

// ─── Rôles & Utilisateur ────────────────────────────────────────────────────

export type UserRole = "agriculteur" | "admin" | "fournisseur";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in?: string;
  is_active: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  region?: string;
  ville?: string;
  bio?: string;
  updated_at?: string;
}

// ─── Parcelle ───────────────────────────────────────────────────────────────

export type SolType = "argileux" | "limoneux" | "sableux" | "tourbeux";
export type ParcelleStatus = "active" | "repos" | "preparation" | "recolte";

export interface Parcelle {
  id: string;
  user_id: string;
  nom: string;
  superficie: number; // en hectares
  localisation: string;
  latitude?: number;
  longitude?: number;
  type_sol: SolType;
  status: ParcelleStatus;
  culture_actuelle?: string;
  date_creation: string;
  description?: string;
  image_url?: string;
}

// ─── Culture ────────────────────────────────────────────────────────────────

export type StadeCulture = "semis" | "germination" | "croissance" | "floraison" | "fructification" | "recolte";

export interface Culture {
  id: string;
  parcelle_id: string;
  nom: string;
  variete?: string;
  date_semis: string;
  date_recolte_prevue: string;
  stade: StadeCulture;
  rendement_prevu?: number; // en kg/ha
  notes?: string;
}

// ─── Capteurs IoT ───────────────────────────────────────────────────────────

export interface SensorReading {
  id: string;
  parcelle_id: string;
  timestamp: string;
  humidite_sol: number;      // % (0-100)
  temperature: number;       // °C
  humidite_air: number;      // %
  luminosite?: number;       // lux
  ph_sol?: number;           // 0-14
  conductivite?: number;     // µS/cm
  mouvement_detecte?: boolean;
}

export interface WeatherReading {
  id: string;
  parcelle_id?: string;
  timestamp: string;
  temperature: number;       // °C
  humidite: number;          // %
  vitesse_vent: number;      // km/h
  precipitation: number;     // mm
  pression: number;          // hPa
  uv_index?: number;
  condition: "ensoleille" | "nuageux" | "pluvieux" | "orageux" | "brumeux";
}

// ─── Irrigation ─────────────────────────────────────────────────────────────

export type IrrigationStatus = "planifie" | "en_cours" | "termine" | "annule";

export interface IrrigationPlan {
  id: string;
  parcelle_id: string;
  date_debut: string;
  date_fin: string;
  volume_eau: number;        // en litres
  methode: string;           // goutte-à-goutte, aspersion, etc.
  status: IrrigationStatus;
  notes?: string;
  automatique: boolean;
  seuil_humidite?: number;   // déclenche si humidité sol < seuil
}

// ─── Matériels ──────────────────────────────────────────────────────────────

export type MaterialStatus = "actif" | "inactif" | "maintenance" | "hors_service";

export interface Material {
  id: string;
  parcelle_id?: string;
  user_id: string;
  nom: string;
  type: string;              // capteur, pompe, relais, drone, etc.
  numero_serie?: string;
  date_installation?: string;
  status: MaterialStatus;
  description?: string;
  // [MOCK] Données simulées tant que l'API IoT n'est pas prête
  batterie?: number;         // % charge
  signal?: number;           // % signal réseau
  derniere_lecture?: string; // timestamp
}

// ─── IA & Recommandations ───────────────────────────────────────────────────

export type RecommandationType = "irrigation" | "culture" | "nuisible" | "sol" | "meteo" | "recolte";
export type PrioriteRecommandation = "faible" | "moyenne" | "haute" | "urgente";

export interface AIRecommendation {
  id: string;
  parcelle_id: string;
  user_id: string;
  timestamp: string;
  type: RecommandationType;
  titre: string;
  description: string;
  priorite: PrioriteRecommandation;
  lu: boolean;
  action_requise?: string;
  // [MOCK] Généré par IA simulée jusqu'à intégration de l'API IA réelle
  source: "ia_mock" | "openai" | "anthropic";
}

// ─── Notifications ──────────────────────────────────────────────────────────

export type NotificationType = "alerte" | "info" | "succes" | "avertissement";

export interface Notification {
  id: string;
  user_id: string;
  parcelle_id?: string;
  titre: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  created_at: string;
  lien?: string;
}

// ─── Historique de connexion ─────────────────────────────────────────────────

export interface ConnectionHistory {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  statut: "succès" | "echec";
  localisation?: string;
}

// ─── Support ─────────────────────────────────────────────────────────────────

export type SupportStatus = "ouvert" | "en_cours" | "resolu" | "ferme";
export type SupportPriorite = "faible" | "normale" | "haute" | "critique";

export interface SupportRequest {
  id: string;
  user_id: string;
  sujet: string;
  description: string;
  status: SupportStatus;
  priorite: SupportPriorite;
  created_at: string;
  updated_at: string;
  reponse_admin?: string;
}

// ─── Calendrier de cultures ──────────────────────────────────────────────────

export interface CalendrierEvent {
  id: string;
  parcelle_id: string;
  titre: string;
  date_debut: string;
  date_fin?: string;
  type: "semis" | "irrigation" | "traitement" | "recolte" | "engrais" | "autre";
  description?: string;
  effectue: boolean;
}

// ─── Fournisseur ─────────────────────────────────────────────────────────────

export interface Produit {
  id: string;
  fournisseur_id: string;
  nom: string;
  categorie: string;
  prix: number;
  unite: string;
  description?: string;
  disponible: boolean;
  image_url?: string;
}

// ─── KPI Dashboard ───────────────────────────────────────────────────────────

export interface DashboardKPI {
  total_parcelles: number;
  parcelles_actives: number;
  humidite_moyenne: number;
  temperature_moyenne: number;
  alertes_actives: number;
  prochaines_irrigations: number;
  rendement_estime: number;
  capteurs_actifs: number;
}