// src/pages/farmer/ParcelleForm.tsx
// Formulaire pour créer ou modifier une parcelle avec validation

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, MapPin, Leaf } from "lucide-react";
import { useParcelles } from "../../hooks/useParcelles";
import type { Parcelle, SolType, ParcelleStatus } from "../../types";

const SOL_TYPES: { value: SolType; label: string }[] = [
  { value: "argileux", label: "Argileux" },
  { value: "limoneux", label: "Limoneux" },
  { value: "sableux", label: "Sableux" },
  { value: "tourbeux", label: "Tourbeux" },
];

const STATUSES: { value: ParcelleStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "repos", label: "En repos" },
  { value: "preparation", label: "En préparation" },
  { value: "recolte", label: "Récolte en cours" },
];

interface FormData {
  nom: string;
  superficie: string;
  localisation: string;
  latitude: string;
  longitude: string;
  type_sol: SolType;
  status: ParcelleStatus;
  culture_actuelle: string;
  description: string;
}

const INITIAL: FormData = {
  nom: "", superficie: "", localisation: "",
  latitude: "", longitude: "", type_sol: "argileux",
  status: "active", culture_actuelle: "", description: "",
};

export default function ParcelleForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { parcelles, addParcelle, updateParcelle } = useParcelles();

  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [saving, setSaving] = useState(false);

  // Préremplir si édition
  useEffect(() => {
    if (isEdit) {
      const p = parcelles.find((x) => x.id === id);
      if (p) {
        setForm({
          nom: p.nom, superficie: String(p.superficie),
          localisation: p.localisation, latitude: String(p.latitude ?? ""),
          longitude: String(p.longitude ?? ""), type_sol: p.type_sol,
          status: p.status, culture_actuelle: p.culture_actuelle ?? "",
          description: p.description ?? "",
        });
      }
    }
  }, [id, parcelles, isEdit]);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.nom.trim()) e.nom = "Le nom est requis";
    if (!form.superficie || isNaN(+form.superficie) || +form.superficie <= 0)
      e.superficie = "Superficie invalide (ex: 1.5)";
    if (!form.localisation.trim()) e.localisation = "La localisation est requise";
    if (form.latitude && isNaN(+form.latitude)) e.latitude = "Latitude invalide";
    if (form.longitude && isNaN(+form.longitude)) e.longitude = "Longitude invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: Omit<Parcelle, "id" | "date_creation"> = {
        user_id: "u1", // remplacer par l'ID utilisateur réel
        nom: form.nom.trim(),
        superficie: +form.superficie,
        localisation: form.localisation.trim(),
        latitude: form.latitude ? +form.latitude : undefined,
        longitude: form.longitude ? +form.longitude : undefined,
        type_sol: form.type_sol,
        status: form.status,
        culture_actuelle: form.culture_actuelle.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      if (isEdit) {
        await updateParcelle(id!, payload);
      } else {
        const newP = await addParcelle(payload);
        navigate(`/parcelles/${newP.id}`);
        return;
      }
      navigate(`/parcelles/${id}`);
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = "text", placeholder = "", required = false }: {
    label: string; name: keyof FormData; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 ${
          errors[name] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isEdit ? `/parcelles/${id}` : "/parcelles")}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Modifier la parcelle" : "Nouvelle parcelle"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? "Mettez à jour les informations de votre parcelle" : "Ajoutez une parcelle à votre exploitation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-cyan-500" /> Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom de la parcelle" name="nom" placeholder="Ex: Champ Nord - Maïs" required />
            <Field label="Superficie (ha)" name="superficie" type="number" placeholder="Ex: 1.5" required />
          </div>
          <Field label="Culture actuelle" name="culture_actuelle" placeholder="Ex: Maïs, Tomates" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de sol <span className="text-red-500">*</span></label>
              <select
                value={form.type_sol}
                onChange={(e) => setForm((f) => ({ ...f, type_sol: e.target.value as SolType }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white"
              >
                {SOL_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ParcelleStatus }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white"
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Notes sur la parcelle, historique, particularités..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white resize-none"
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" /> Localisation
          </h2>
          <Field label="Adresse / Zone" name="localisation" placeholder="Ex: Yaoundé, Région Centre" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" name="latitude" type="number" placeholder="Ex: 3.848" />
            <Field label="Longitude" name="longitude" type="number" placeholder="Ex: 11.502" />
          </div>
          <p className="text-xs text-gray-400">Les coordonnées GPS permettent d'afficher votre parcelle sur la carte.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/parcelles/${id}` : "/parcelles")}
            className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la parcelle"}
          </button>
        </div>
      </form>
    </div>
  );
}