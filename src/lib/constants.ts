export const ADMIN_EMAIL = 'admin@gmail.com';

export const ROLES = {
  agriculteur: { label: 'Agriculteur', labelEn: 'Farmer', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  gestionnaire: { label: 'Gestionnaire de cultures', labelEn: 'Crop Manager', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  fournisseur: { label: 'Fournisseur de services', labelEn: 'Service Provider', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
} as const;

export const CULTURES = ['Tomates', 'Piment', 'Maïs', 'Manioc', 'Haricot', 'Arachide', 'Cacao', 'Café', 'Plantain', 'Igname', 'Macabo', 'Légumes'];
export const ZONES = ['Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Est', 'Sud', 'Nord', 'Extrême-Nord', 'Adamaoua'];
