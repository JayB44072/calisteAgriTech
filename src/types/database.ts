export type UserRole = 'agriculteur' | 'gestionnaire' | 'fournisseur';

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
  culture: string;
  superficie: number;
  zone: string;
  latitude: number | null;
  longitude: number | null;
  irrigation_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SensorData {
  id: string;
  parcelle_id: string;
  temperature: number | null;
  humidite_sol: number | null;
  humidite_air: number | null;
  created_at: string;
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

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_alerts: boolean;
  push_moisture_alerts: boolean;
  critical_moisture_threshold: number;
  critical_temp_high: number;
  critical_temp_low: number;
  created_at: string;
  updated_at: string;
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
