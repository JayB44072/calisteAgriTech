// src/pages/farmer/ParcelleDetail.tsx
// Vue détaillée d'une parcelle avec capteurs, irrigation, matériels, IA

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Droplets, Thermometer, Wind, Leaf, Cpu,
  Calendar, MapPin, Edit2, Trash2, AlertTriangle, Zap
} from "lucide-react";
import { useParcelles } from "../../hooks/useParcelles";
import { useSensorReading, useSensorHistory } from "../../hooks/useSensorData";
import { MOCK_AI_RECOMMENDATIONS, MOCK_IRRIGATION, MOCK_MATERIALS } from "../../data/mockdata";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MockBadge } from "../../components/ui/Mockbadge";
import { KpiCard } from "../../components/ui/KpiCard";

// Graphique simple en SVG (sans dépendance externe)
function MiniChart({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200; const h = 48;
  const pts = data
    .slice(0, 24)
    .map((v, i) => `${(i / 23) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ParcelleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parcelles, loading: parcellesLoading, deleteParcelle } = useParcelles();
  const { reading, loading: sensorLoading, lastUpdated, refresh } = useSensorReading(id ?? "");
  const { history } = useSensorHistory(id ?? "");
  const [activeTab, setActiveTab] = useState<"apercu" | "capteurs" | "irrigation" | "materiels" | "ia">("apercu");
  const [deleting, setDeleting] = useState(false);

  const parcelle = parcelles.find((p) => p.id === id);
  const recommendations = MOCK_AI_RECOMMENDATIONS.filter((r) => r.parcelle_id === id);
  const irrigations = MOCK_IRRIGATION.filter((i) => i.parcelle_id === id);
  const materials = MOCK_MATERIALS.filter((m) => m.parcelle_id === id);

  if (parcellesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement de la parcelle…</p>
        </div>
      </div>
    );
  }

  if (!parcelle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-semibold text-gray-800">Parcelle introuvable</h2>
        <button onClick={() => navigate("/parcelles")} className="btn-primary">
          Retour aux parcelles
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${parcelle.nom}" ?`)) return;
    setDeleting(true);
    try {
      await deleteParcelle(parcelle.id);
      navigate("/parcelles");
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { key: "apercu", label: "Aperçu" },
    { key: "capteurs", label: "Capteurs IoT" },
    { key: "irrigation", label: "Irrigation" },
    { key: "materiels", label: "Matériels" },
    { key: "ia", label: "Recommandations IA" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/parcelles")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{parcelle.nom}</h1>
              <StatusBadge status={parcelle.status} />
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {parcelle.localisation} · {parcelle.superficie} ha · Sol {parcelle.type_sol}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/parcelles/${id}/modifier`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" /> Modifier
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> {deleting ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white shadow-sm text-cyan-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>

        {/* ── Aperçu ─────────────────────────────────────────────────── */}
        {activeTab === "apercu" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Infos générales */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-cyan-500" /> Informations générales
              </h3>
              {[
                ["Culture actuelle", parcelle.culture_actuelle ?? "—"],
                ["Type de sol", parcelle.type_sol],
                ["Superficie", `${parcelle.superficie} ha`],
                ["Date création", new Date(parcelle.date_creation).toLocaleDateString("fr-FR")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 capitalize">{val}</span>
                </div>
              ))}
              {parcelle.description && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{parcelle.description}</p>
              )}
            </div>

            {/* Capteurs en direct */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" /> Données en direct
                </h3>
                <div className="flex items-center gap-2">
                  <MockBadge />
                  <button onClick={refresh} className="text-xs text-blue-600 hover:underline">Actualiser</button>
                </div>
              </div>
              {sensorLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />
                  ))}
                </div>
              ) : reading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Humidité sol", value: `${reading.humidite_sol}%`, icon: <Droplets className="w-4 h-4" />, color: "text-blue-500" },
                    { label: "Température", value: `${reading.temperature}°C`, icon: <Thermometer className="w-4 h-4" />, color: "text-red-400" },
                    { label: "Humidité air", value: `${reading.humidite_air}%`, icon: <Wind className="w-4 h-4" />, color: "text-cyan-500" },
                    { label: "pH Sol", value: reading.ph_sol ?? "—", icon: <Leaf className="w-4 h-4" />, color: "text-cyan-500" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <div className={`flex items-center gap-1 text-xs ${color} font-medium mb-1`}>
                        {icon} {label}
                      </div>
                      <p className="text-xl font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {lastUpdated && (
                <p className="text-xs text-gray-400">Dernière mise à jour : {lastUpdated.toLocaleTimeString("fr-FR")}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Capteurs IoT ───────────────────────────────────────────── */}
        {activeTab === "capteurs" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MockBadge size="md" label="IOT SIMULÉ - ESP32 / DHT11" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Humidité sol (24h)", data: history.map((r) => r.humidite_sol), unit: "%", color: "#3b82f6", current: reading?.humidite_sol },
                { label: "Température (24h)", data: history.map((r) => r.temperature), unit: "°C", color: "#ef4444", current: reading?.temperature },
                { label: "Humidité air (24h)", data: history.map((r) => r.humidite_air), unit: "%", color: "#06b6d4", current: reading?.humidite_air },
              ].map(({ label, data, unit, color, current }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600">{label}</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {current != null ? `${current}${unit}` : "—"}
                    </span>
                  </div>
                  <MiniChart data={data.length > 0 ? data : [50]} color={color} />
                  <p className="text-xs text-gray-400">{data.length} relevés</p>
                </div>
              ))}
            </div>
            {/* Table historique */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Historique des relevés</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Date/Heure", "Hum. Sol", "Temp.", "Hum. Air", "pH", "Luminosité"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.slice(0, 12).map((r, i) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="px-4 py-3 text-gray-600">{new Date(r.timestamp).toLocaleString("fr-FR")}</td>
                        <td className="px-4 py-3 font-medium">{r.humidite_sol}%</td>
                        <td className="px-4 py-3 font-medium">{r.temperature}°C</td>
                        <td className="px-4 py-3 font-medium">{r.humidite_air}%</td>
                        <td className="px-4 py-3">{r.ph_sol ?? "—"}</td>
                        <td className="px-4 py-3">{r.luminosite ? `${r.luminosite} lx` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Irrigation ─────────────────────────────────────────────── */}
        {activeTab === "irrigation" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Plans d'irrigation</h3>
              <button className="btn-primary text-sm px-4 py-2">+ Planifier</button>
            </div>
            {irrigations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
                Aucune irrigation planifiée pour cette parcelle.
              </div>
            ) : (
              <div className="space-y-3">
                {irrigations.map((plan, i) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4 animate-fade-in-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{plan.methode}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(plan.date_debut).toLocaleString("fr-FR")} · {plan.volume_eau}L
                          {plan.automatique && " · Automatique"}
                        </p>
                        {plan.notes && <p className="text-xs text-gray-400 mt-0.5">{plan.notes}</p>}
                      </div>
                    </div>
                    <StatusBadge status={plan.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Matériels ──────────────────────────────────────────────── */}
        {activeTab === "materiels" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MockBadge size="md" label="MATÉRIELS SIMULÉS" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat, i) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{mat.nom}</p>
                        <p className="text-xs text-gray-500 capitalize">{mat.type} · {mat.numero_serie}</p>
                      </div>
                    </div>
                    <StatusBadge status={mat.status} />
                  </div>
                  {(mat.batterie != null || mat.signal != null) && (
                    <div className="mt-4 flex gap-4 text-sm">
                      {mat.batterie != null && (
                        <div>
                          <p className="text-xs text-gray-400">Batterie</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-2 rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${mat.batterie}%`,
                                  backgroundColor: mat.batterie < 20 ? "#ef4444" : mat.batterie < 50 ? "#f59e0b" : "#10b981",
                                }}
                              />
                            </div>
                            <span className="font-medium">{mat.batterie}%</span>
                          </div>
                        </div>
                      )}
                      {mat.signal != null && (
                        <div>
                          <p className="text-xs text-gray-400">Signal</p>
                          <p className="font-medium mt-1">{mat.signal}%</p>
                        </div>
                      )}
                    </div>
                  )}
                  {mat.derniere_lecture && (
                    <p className="mt-2 text-xs text-gray-400">
                      Dernière lecture : {new Date(mat.derniere_lecture).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IA ─────────────────────────────────────────────────────── */}
        {activeTab === "ia" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MockBadge size="md" label="IA SIMULÉE - API IA non connectée" />
            </div>
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
                Aucune recommandation IA disponible pour cette parcelle.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, i) => {
                  const prioriteColor = {
                    faible: "border-l-gray-300 bg-white",
                    moyenne: "border-l-blue-400 bg-blue-50/30",
                    haute: "border-l-amber-400 bg-amber-50/30",
                    urgente: "border-l-red-500 bg-red-50/30",
                  }[rec.priorite];

                  return (
                    <div
                      key={rec.id}
                      className={`rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 ${prioriteColor} animate-fade-in-up`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                          <h4 className="font-semibold text-gray-800">{rec.titre}</h4>
                          {!rec.lu && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                          rec.priorite === "urgente" ? "bg-red-100 text-red-700" :
                          rec.priorite === "haute" ? "bg-amber-100 text-amber-700" :
                          rec.priorite === "moyenne" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {rec.priorite}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{rec.description}</p>
                      {rec.action_requise && (
                        <div className="mt-3 flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-100">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-gray-700">{rec.action_requise}</p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(rec.timestamp).toLocaleString("fr-FR")} · {rec.type}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}