export type UserRole = 'agriculteur' | 'gestionnaire' | 'fournisseur' | 'admin' | 'technicien';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
  city: string | null;
  farm_address: string | null;
  farm_size: number | null;
  primary_crop: string | null;
  created_at: string;
  updated_at: string;
}

export interface Parcelle {
  id: string;
  user_id: string;
  nom: string;
  description: string | null;
  superficie: number;
  unite: string;
  culture: string;
  variete: string | null;
  type_sol: string | null;
  ph_sol: number | null;
  drainage: string | null;
  fertilite: string | null;
  statut: 'active' | 'inactive' | 'archivee' | 'en_preparation';
  irrigation_active: boolean;
  type_irrigation: string | null;
  source_eau: string | null;
  latitude: number | null;
  longitude: number | null;
  adresse: string | null;
  zone: string | null;
  geometry: any | null;
  photo_url: string | null;
  date_semis: string | null;
  date_recolte_estimee: string | null;
  created_at: string;
  updated_at: string;
}

export interface SensorDevice {
  id: string;
  user_id: string;
  parcelle_id: string | null;
  nom: string;
  type: 'humidite_sol' | 'temperature_sol' | 'temperature_air' | 'humidite_air' | 'niveau_eau' | 'pluviometrie' | 'multi';
  fabricant: string | null;
  numero_serie: string | null;
  batterie: number | null;
  signal: number | null;
  statut: 'actif' | 'inactif' | 'maintenance' | 'hors_ligne';
  latitude: number | null;
  longitude: number | null;
  firmware_version: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string | null;
  parcelle_id: string | null;
  user_id: string;
  temperature_sol: number | null;
  temperature_air: number | null;
  humidite_sol: number | null;
  humidite_air: number | null;
  niveau_eau: number | null;
  pluviometrie: number | null;
  created_at: string;
}

export interface IrrigationPlan {
  id: string;
  user_id: string;
  parcelle_id: string;
  nom: string;
  type: 'manuel' | 'programmé' | 'automatique';
  statut: 'actif' | 'inactif' | 'en_cours' | 'terminé';
  debit_m3h: number | null;
  duree_minutes: number | null;
  heure_debut: string | null;
  jours_semaine: number[] | null;
  volume_total_m3: number;
  derniere_session: string | null;
  prochaine_session: string | null;
  actif: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IrrigationHistory {
  id: string;
  plan_id: string | null;
  parcelle_id: string;
  user_id: string;
  debut_at: string;
  fin_at: string | null;
  duree_minutes: number | null;
  volume_m3: number | null;
  declenchement: 'manuel' | 'programmé' | 'automatique';
  statut: 'en_cours' | 'terminé' | 'interrompu';
  created_at: string;
}

export interface Material {
  id: string;
  user_id: string;
  parcelle_id: string | null;
  nom: string;
  type: 'capteur' | 'pompe' | 'station_meteo' | 'drone' | 'vehicule' | 'outil' | 'autre';
  fabricant: string | null;
  modele: string | null;
  numero_serie: string | null;
  batterie: number | null;
  signal: number | null;
  statut: 'actif' | 'inactif' | 'maintenance' | 'hors_service';
  localisation: string | null;
  derniere_maintenance: string | null;
  prochaine_maintenance: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message: string;
  type: 'info' | 'alerte' | 'succes' | 'avertissement';
  lu: boolean;
  lien: string | null;
  metadata: any | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  priorite: 'low' | 'medium' | 'high' | 'critical';
  admin_reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_alerts: boolean;
  push_moisture_alerts: boolean;
  push_weather_alerts: boolean;
  push_irrigation_alerts: boolean;
  push_sensor_alerts: boolean;
  critical_moisture_threshold: number;
  critical_temp_high: number;
  critical_temp_low: number;
  created_at: string;
  updated_at: string;
}

export interface CalendrierCulture {
  id: string;
  parcelle_id: string;
  user_id: string;
  culture: string;
  etape: string;
  date_debut: string;
  date_fin: string;
  description: string | null;
  complete: boolean;
  created_at: string;
}

export interface AiActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  details: string | null;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}
