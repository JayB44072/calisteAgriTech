import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = './diagrammes';
mkdirSync(OUT, { recursive: true });

function toPng(svg, filename, scale = 2) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(OUT, filename), png);
  console.log(`✅ ${filename}`);
}

const C1 = '#0891b2'; const C2 = '#0e7490'; const C3 = '#06b6d4';
const B1 = '#1d4ed8'; const B2 = '#3b82f6';
const DARK = '#0f172a'; const GRAY = '#64748b';
const WHITE = '#ffffff'; const LIGHT = '#f0f9ff';

// ═══════════════════════════════════════════════════════
// 09. DIAGRAMME DE CLASSE
// ═══════════════════════════════════════════════════════
const classDiag = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1050" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#0891b2" flood-opacity="0.12"/></filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${GRAY}"/>
    </marker>
    <marker id="diamond" markerWidth="12" markerHeight="8" refX="0" refY="4" orient="auto">
      <polygon points="0 4,6 0,12 4,6 8" fill="white" stroke="${GRAY}" stroke-width="1"/>
    </marker>
    <marker id="diamondF" markerWidth="12" markerHeight="8" refX="0" refY="4" orient="auto">
      <polygon points="0 4,6 0,12 4,6 8" fill="${GRAY}"/>
    </marker>
    <marker id="tri" markerWidth="10" markerHeight="8" refX="0" refY="4" orient="auto">
      <polygon points="0 0,10 4,0 8" fill="white" stroke="${C1}" stroke-width="1.5"/>
    </marker>
  </defs>
  <rect width="1600" height="1050" fill="url(#bg)"/>
  <rect width="1600" height="72" fill="url(#hdr)"/>
  <text x="800" y="30" text-anchor="middle" fill="white" font-size="24" font-weight="700">Diagramme de Classe — CalisteAgriTech</text>
  <text x="800" y="56" text-anchor="middle" fill="#a5f3fc" font-size="14">Système global · UML · Relations, attributs et méthodes principales</text>

  <!-- ── CLASS BOXES ── -->
  <!-- Helper macro: class box at (x,y) width w -->

  <!-- Profile (central) -->
  <g transform="translate(650,90)">
    <rect width="280" height="200" rx="8" fill="white" stroke="${C1}" stroke-width="2.5" filter="url(#sh)"/>
    <rect width="280" height="36" rx="8" fill="${C1}"/>
    <rect y="26" width="280" height="10" fill="${C1}"/>
    <text x="140" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">Profile</text>
    <line x1="0" y1="36" x2="280" y2="36" stroke="${C1}" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- email : String</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- full_name : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- role : UserRole</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- city : String</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- farm_size : Decimal</text>
    <line x1="0" y1="148" x2="280" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="164" fill="${C2}" font-size="11">+ getParcelles() : Parcelle[]</text>
    <text x="10" y="180" fill="${C2}" font-size="11">+ getTickets() : SupportTicket[]</text>
    <text x="10" y="196" fill="${C2}" font-size="11">+ getSettings() : UserSettings</text>
  </g>

  <!-- Parcelle -->
  <g transform="translate(50,90)">
    <rect width="260" height="220" rx="8" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
    <rect width="260" height="36" rx="8" fill="#16a34a"/>
    <rect y="26" width="260" height="10" fill="#16a34a"/>
    <text x="130" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">Parcelle</text>
    <line x1="0" y1="36" x2="260" y2="36" stroke="#16a34a" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- user_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- nom : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- culture : String</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- superficie : Decimal</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- statut : ParcelleStatus</text>
    <text x="10" y="152" fill="${DARK}" font-size="11">- latitude : Decimal</text>
    <text x="10" y="168" fill="${DARK}" font-size="11">- longitude : Decimal</text>
    <line x1="0" y1="180" x2="260" y2="180" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="196" fill="#16a34a" font-size="11">+ getSensorData() : SensorReading[]</text>
    <text x="10" y="212" fill="#16a34a" font-size="11">+ getIrrigationPlans() : IrrigPlan[]</text>
  </g>

  <!-- SensorReading -->
  <g transform="translate(50,360)">
    <rect width="260" height="190" rx="8" fill="white" stroke="#7c3aed" stroke-width="2" filter="url(#sh)"/>
    <rect width="260" height="36" rx="8" fill="#7c3aed"/>
    <rect y="26" width="260" height="10" fill="#7c3aed"/>
    <text x="130" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">SensorReading</text>
    <line x1="0" y1="36" x2="260" y2="36" stroke="#7c3aed" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- parcelle_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- humidite_sol : Decimal</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- temperature : Decimal</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- humidite_air : Decimal</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- created_at : DateTime</text>
    <line x1="0" y1="148" x2="260" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="164" fill="#7c3aed" font-size="11">+ getLatest() : SensorReading</text>
    <text x="10" y="180" fill="#7c3aed" font-size="11">+ getHistory(n) : Reading[]</text>
  </g>

  <!-- IrrigationPlan -->
  <g transform="translate(50,610)">
    <rect width="260" height="200" rx="8" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
    <rect width="260" height="36" rx="8" fill="${C1}"/>
    <rect y="26" width="260" height="10" fill="${C1}"/>
    <text x="130" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">IrrigationPlan</text>
    <line x1="0" y1="36" x2="260" y2="36" stroke="${C1}" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- parcelle_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- nom : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- type : 'manuel'|'auto'</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- debit_m3h : Decimal</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- statut : IrrigStatus</text>
    <line x1="0" y1="148" x2="260" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="164" fill="${C1}" font-size="11">+ activate() : void</text>
    <text x="10" y="180" fill="${C1}" font-size="11">+ schedule(days) : void</text>
    <text x="10" y="196" fill="${C1}" font-size="11">+ getHistory() : IrrigHistory[]</text>
  </g>

  <!-- Material -->
  <g transform="translate(380,360)">
    <rect width="240" height="190" rx="8" fill="white" stroke="#d97706" stroke-width="2" filter="url(#sh)"/>
    <rect width="240" height="36" rx="8" fill="#d97706"/>
    <rect y="26" width="240" height="10" fill="#d97706"/>
    <text x="120" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">Material</text>
    <line x1="0" y1="36" x2="240" y2="36" stroke="#d97706" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- user_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- nom : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- type : MaterialType</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- batterie : number</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- statut : MaterialStatus</text>
    <line x1="0" y1="148" x2="240" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="164" fill="#d97706" font-size="11">+ getReadings() : Reading[]</text>
    <text x="10" y="180" fill="#d97706" font-size="11">+ alertBattery() : void</text>
  </g>

  <!-- Notification -->
  <g transform="translate(380,610)">
    <rect width="240" height="160" rx="8" fill="white" stroke="#dc2626" stroke-width="2" filter="url(#sh)"/>
    <rect width="240" height="36" rx="8" fill="#dc2626"/>
    <rect y="26" width="240" height="10" fill="#dc2626"/>
    <text x="120" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">Notification</text>
    <line x1="0" y1="36" x2="240" y2="36" stroke="#dc2626" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- user_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- titre : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- type : NotifType</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- lu : Boolean</text>
    <line x1="0" y1="132" x2="240" y2="132" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="148" fill="#dc2626" font-size="11">+ markRead() : void</text>
  </g>

  <!-- SupportTicket -->
  <g transform="translate(980,90)">
    <rect width="260" height="200" rx="8" fill="white" stroke="#dc2626" stroke-width="2" filter="url(#sh)"/>
    <rect width="260" height="36" rx="8" fill="#dc2626"/>
    <rect y="26" width="260" height="10" fill="#dc2626"/>
    <text x="130" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">SupportTicket</text>
    <line x1="0" y1="36" x2="260" y2="36" stroke="#dc2626" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- user_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- subject : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- message : String</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- statut : TicketStatus</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- priorite : Priority</text>
    <text x="10" y="152" fill="${DARK}" font-size="11">- admin_reply : String</text>
    <line x1="0" y1="164" x2="260" y2="164" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="180" fill="#dc2626" font-size="11">+ reply(msg) : void</text>
    <text x="10" y="196" fill="#dc2626" font-size="11">+ close() : void</text>
  </g>

  <!-- UserSettings -->
  <g transform="translate(980,350)">
    <rect width="260" height="160" rx="8" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
    <rect width="260" height="36" rx="8" fill="#16a34a"/>
    <rect y="26" width="260" height="10" fill="#16a34a"/>
    <text x="130" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">UserSettings</text>
    <line x1="0" y1="36" x2="260" y2="36" stroke="#16a34a" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- user_id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- language : String</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- theme : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- plan_id : String</text>
    <line x1="0" y1="116" x2="260" y2="116" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="132" fill="#16a34a" font-size="11">+ update(data) : void</text>
    <text x="10" y="148" fill="#16a34a" font-size="11">+ getSubscription() : Plan</text>
  </g>

  <!-- AIRecommendation -->
  <g transform="translate(980,575)">
    <rect width="280" height="190" rx="8" fill="white" stroke="#7c3aed" stroke-width="2" filter="url(#sh)"/>
    <rect width="280" height="36" rx="8" fill="#7c3aed"/>
    <rect y="26" width="280" height="10" fill="#7c3aed"/>
    <text x="140" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">AIRecommendation</text>
    <line x1="0" y1="36" x2="280" y2="36" stroke="#7c3aed" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- parcelle_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- type : RecommType</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- titre : String</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- priorite : Priority</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- source : 'gemini'|'groq'</text>
    <line x1="0" y1="148" x2="280" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="164" fill="#7c3aed" font-size="11">+ generate(ctx) : string</text>
    <text x="10" y="180" fill="#7c3aed" font-size="11">+ markRead() : void</text>
  </g>

  <!-- CalendrierCulture -->
  <g transform="translate(660,360)">
    <rect width="260" height="190" rx="8" fill="white" stroke="#d97706" stroke-width="2" filter="url(#sh)"/>
    <rect width="260" height="36" rx="8" fill="#d97706"/>
    <rect y="26" width="260" height="10" fill="#d97706"/>
    <text x="130" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="700">CalendrierCulture</text>
    <line x1="0" y1="36" x2="260" y2="36" stroke="#d97706" stroke-width="1"/>
    <text x="10" y="56" fill="${DARK}" font-size="11">- id : UUID</text>
    <text x="10" y="72" fill="${DARK}" font-size="11">- parcelle_id : UUID</text>
    <text x="10" y="88" fill="${DARK}" font-size="11">- culture : String</text>
    <text x="10" y="104" fill="${DARK}" font-size="11">- etape : String</text>
    <text x="10" y="120" fill="${DARK}" font-size="11">- date_debut : Date</text>
    <text x="10" y="136" fill="${DARK}" font-size="11">- complete : Boolean</text>
    <line x1="0" y1="148" x2="260" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <text x="10" y="164" fill="#d97706" font-size="11">+ complete() : void</text>
    <text x="10" y="180" fill="#d97706" font-size="11">+ getNext() : CalEvent</text>
  </g>

  <!-- ENUM boxes -->
  <g transform="translate(660,620)">
    <rect width="260" height="150" rx="8" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5" filter="url(#sh)"/>
    <rect width="260" height="30" rx="8" fill="#ca8a04"/>
    <rect y="20" width="260" height="10" fill="#ca8a04"/>
    <text x="130" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="700">«enum» UserRole</text>
    <text x="130" y="50" text-anchor="middle" fill="${DARK}" font-size="12">agriculteur</text>
    <text x="130" y="68" text-anchor="middle" fill="${DARK}" font-size="12">gestionnaire</text>
    <text x="130" y="86" text-anchor="middle" fill="${DARK}" font-size="12">fournisseur</text>
    <text x="130" y="104" text-anchor="middle" fill="${DARK}" font-size="12">admin</text>
    <text x="130" y="122" text-anchor="middle" fill="${DARK}" font-size="12">technicien</text>
  </g>

  <!-- RELATIONS (lines) -->
  <!-- Profile 1---* Parcelle -->
  <line x1="650" y1="180" x2="310" y2="180" stroke="${GRAY}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="460" y="170" fill="${GRAY}" font-size="12" font-weight="600">1</text>
  <text x="315" y="170" fill="${GRAY}" font-size="12" font-weight="600">0..*</text>
  <text x="440" y="196" fill="${GRAY}" font-size="10">possède</text>

  <!-- Profile 1---* SupportTicket -->
  <line x1="930" y1="180" x2="980" y2="180" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arr)"/>
  <text x="935" y="170" fill="${GRAY}" font-size="12">1</text>
  <text x="960" y="170" fill="${GRAY}" font-size="12">0..*</text>

  <!-- Profile 1---1 UserSettings -->
  <line x1="930" y1="210" x2="980" y2="400" stroke="#16a34a" stroke-width="1.8" marker-end="url(#arr)"/>
  <text x="940" y="320" fill="${GRAY}" font-size="10">1..1</text>

  <!-- Parcelle 1---* SensorReading -->
  <line x1="180" y1="310" x2="180" y2="360" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#arr)"/>
  <text x="140" y="340" fill="${GRAY}" font-size="10">0..*</text>

  <!-- Parcelle 1---* IrrigationPlan -->
  <line x1="180" y1="310" x2="180" y2="610" stroke="${C1}" stroke-width="1.8" stroke-dasharray="6,3" marker-end="url(#arr)"/>

  <!-- Parcelle 1---* CalendrierCulture -->
  <line x1="310" y1="250" x2="660" y2="420" stroke="#d97706" stroke-width="1.8" stroke-dasharray="6,3" marker-end="url(#arr)"/>

  <!-- Profile 1---* Notification -->
  <line x1="650" y1="240" x2="620" y2="680" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>

  <!-- Profile 1---* AIRecommendation -->
  <line x1="930" y1="230" x2="980" y2="620" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>

  <!-- LEGEND -->
  <rect x="40" y="870" width="700" height="50" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="60" y1="895" x2="100" y2="895" stroke="${GRAY}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="112" y="899" fill="${DARK}" font-size="12">Association</text>
  <line x1="220" y1="895" x2="260" y2="895" stroke="${GRAY}" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="272" y="899" fill="${DARK}" font-size="12">Dépendance</text>
  <text x="420" y="899" fill="${DARK}" font-size="12">1..* Multiplicité</text>
  <text x="580" y="899" fill="#ca8a04" font-size="12">«enum» Énumération</text>

  <text x="800" y="1020" text-anchor="middle" fill="${GRAY}" font-size="12">CalisteAgriTech · Diagramme de Classe UML · 2025</text>
</svg>`;

toPng(classDiag, '09_diagramme_classe.png');
console.log('1/6 done');
