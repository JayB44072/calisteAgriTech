// Groq API — free tier: 14 400 req/day, Llama 3 70B
// Obtenir une clé gratuite: https://console.groq.com → API Keys (format gsk_...)

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export async function callGemini(
  userMessage: string,
  systemPrompt?: string,
  history?: Array<{ role: string; content: string }>,
  _responseFormat?: 'text' | 'json'
): Promise<string> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-key-here') {
    throw new Error('Clé Groq manquante. Ajoutez VITE_GROQ_API_KEY dans votre fichier .env\nObtenez une clé gratuite sur console.groq.com');
  }

  const messages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  if (history) {
    for (const msg of history) {
      messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erreur Groq (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export const AGRONOME_SYSTEM_PROMPT = `Tu es AgriTechIA, un expert agronome spécialisé dans l'agriculture au Cameroun. Tu aides l'agriculteur à:
- Diagnostiquer les maladies des cultures locales (tomates, piments, maïs, manioc, plantain, etc.)
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

  const prompt = `Analyse cette parcelle et donne des recommandations:

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

Réponds UNIQUEMENT avec un tableau JSON (sans texte avant ou après):
[
  {
    "etape": "nom de l'étape",
    "date_debut": "YYYY-MM-DD",
    "date_fin": "YYYY-MM-DD",
    "description": "description détaillée de l'action"
  }
]`;

  const result = await callGemini(prompt, AGRONOME_SYSTEM_PROMPT, undefined, 'json');

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(result);
  } catch {
    throw new Error('Format de réponse IA invalide');
  }
}
