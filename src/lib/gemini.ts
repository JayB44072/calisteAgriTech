import { supabase } from '../lib/supabase';

const GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_API_KEY = 'AIzaSyCKIaFMDD4QOV2s4ZFg5D5eWo3BwIoVieg';

async function getApiKey(): Promise<string> {
  const { data } = await supabase.from('user_settings').select('gemini_api_key').single();
  return data?.gemini_api_key || DEFAULT_API_KEY;
}

interface GeminiRequestBody {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}

export async function callGemini(
  userMessage: string,
  systemPrompt?: string,
  history?: Array<{ role: string; content: string }>,
  responseFormat?: 'text' | 'json'
): Promise<string> {
  const apiKey = await getApiKey();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non authentifié');

  const contents: GeminiRequestBody['contents'] = [];

  if (history) {
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const payload: GeminiRequestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
    },
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ apiKey, payload }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Gemini: ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export const AGRONOME_SYSTEM_PROMPT = `Tu es CalisteAgriTech AI, un expert agronome spécialisé dans l'agriculture au Cameroun. Tu aides l'agriculteur à:
- Diagnostiquer les maladies des cultures locales (tomates, piments, maïs, manioc, etc.)
- Choisir les engrais et traitements adaptés au climat tropical camerounais
- Optimiser les récoltes en fonction des saisons (saison des pluies: mars-octobre, saison sèche: novembre-février)
- Conseiller sur l'irrigation en fonction des données de capteurs (température, humidité du sol et de l'air)
- Recommander des pratiques agricoles durables et modernes (smart farming)

Réponds toujours en français, de manière claire et pratique. Utilise des données chiffrées quand c'est possible. Si on te donne des données de capteurs, analyse-les précisément.`;

export async function analyzeParcelle(
  parcelleNom: string,
  culture: string,
  zone: string,
  sensorData: Array<{ temperature: number | null; humidite_sol: number | null; humidite_air: number | null; created_at: string }>
): Promise<string> {
  const dataSummary = sensorData.slice(0, 10).map(d =>
    `Date: ${new Date(d.created_at).toLocaleString('fr-FR')} | Temp: ${d.temperature ?? 'N/A'}°C | Hum. Sol: ${d.humidite_sol ?? 'N/A'}% | Hum. Air: ${d.humidite_air ?? 'N/A'}%`
  ).join('\n');

  const avgTemp = sensorData.reduce((s, d) => s + (d.temperature ?? 0), 0) / sensorData.length;
  const avgHumSol = sensorData.reduce((s, d) => s + (d.humidite_sol ?? 0), 0) / sensorData.length;
  const avgHumAir = sensorData.reduce((s, d) => s + (d.humidite_air ?? 0), 0) / sensorData.length;

  const prompt = `Analyse cette parcelle et donne des recommandations d'irrigation:

Parcelle: ${parcelleNom}
Culture: ${culture}
Zone: ${zone}, Cameroun

Derniers relevés capteurs:
${dataSummary}

Moyennes: Température ${avgTemp.toFixed(1)}°C | Humidité Sol ${avgHumSol.toFixed(1)}% | Humidité Air ${avgHumAir.toFixed(1)}%

Donne une analyse détaillée avec:
1. État actuel de la parcelle
2. Recommandations d'irrigation précises (quantité et fréquence)
3. Risques identifiés
4. Actions urgentes à entreprendre`;

  return callGemini(prompt, AGRONOME_SYSTEM_PROMPT);
}

export async function generateCultureCalendar(
  culture: string,
  datePlantation: string,
  region: string
): Promise<Array<{ etape: string; date_debut: string; date_fin: string; description: string }>> {
  const prompt = `Génère un calendrier de culture détaillé pour:
- Culture: ${culture}
- Date de plantation: ${datePlantation}
- Région: ${region}, Cameroun

Génère un tableau JSON avec les étapes suivantes (ajuste les durées selon la culture):
Semis, Repiquage (si applicable), Fertilisation 1, Traitement phytosanitaire 1, Fertilisation 2, Traitement phytosanitaire 2, Récolte

Format JSON requis:
[
  {
    "etape": "nom de l'étape",
    "date_debut": "YYYY-MM-DD",
    "date_fin": "YYYY-MM-DD",
    "description": "description détaillée de l'action à réaliser"
  }
]

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

  const result = await callGemini(prompt, AGRONOME_SYSTEM_PROMPT, undefined, 'json');

  try {
    const parsed = JSON.parse(result);
    return Array.isArray(parsed) ? parsed : parsed.etapes ?? parsed.calendar ?? [];
  } catch {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Format de réponse IA invalide');
  }
}
