// src/components/ui/StatusBadge.tsx

type Status = string;

const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  // Parcelles
  active: { label: "Active", classes: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  repos: { label: "En repos", classes: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  preparation: { label: "Préparation", classes: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  recolte: { label: "Récolte", classes: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  // Matériels
  actif: { label: "Actif", classes: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500 animate-pulse" },
  inactif: { label: "Inactif", classes: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  maintenance: { label: "Maintenance", classes: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  hors_service: { label: "Hors service", classes: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  // Irrigation
  planifie: { label: "Planifié", classes: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  en_cours: { label: "En cours", classes: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500 animate-pulse" },
  termine: { label: "Terminé", classes: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  annule: { label: "Annulé", classes: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  // Support
  ouvert: { label: "Ouvert", classes: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  en_cours_support: { label: "En cours", classes: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  resolu: { label: "Résolu", classes: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  ferme: { label: "Fermé", classes: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    classes: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}













