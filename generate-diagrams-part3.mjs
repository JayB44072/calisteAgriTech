import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = './diagrammes';
mkdirSync(OUT, { recursive: true });

function toPng(svg, filename, scale = 2) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: scale }, font: { loadSystemFonts: true } });
  const png = resvg.render().asPng();
  writeFileSync(join(OUT, filename), png);
  console.log(`✅ ${filename}`);
}

const C1='#0891b2',C2='#0e7490',C3='#06b6d4',B1='#1d4ed8',DARK='#0f172a',GRAY='#64748b';

// ═══════════════════════════════════════════════════
// 10. DIAGRAMME DE PAQUETAGE
// ═══════════════════════════════════════════════════
const pkg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="${C1}" flood-opacity="0.13"/></filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${GRAY}"/>
    </marker>
    <marker id="arrD" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${C1}"/>
    </marker>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>
  <rect width="1400" height="70" fill="url(#hdr)"/>
  <text x="700" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="700">Diagramme de Paquetage — CalisteAgriTech</text>
  <text x="700" y="54" text-anchor="middle" fill="#a5f3fc" font-size="14">Organisation modulaire de l'application React + Supabase</text>

  <!-- Package helper: tab + body -->
  <!-- calisteAgriTech (root) -->
  <rect x="30" y="80" width="1340" height="740" rx="12" fill="none" stroke="${C1}" stroke-width="2.5" stroke-dasharray="12,5"/>
  <rect x="30" y="66" width="200" height="28" rx="6" fill="${C1}"/>
  <text x="130" y="85" text-anchor="middle" fill="white" font-size="13" font-weight="700">calisteAgriTech</text>

  <!-- src/ -->
  <rect x="60" y="110" width="1280" height="680" rx="10" fill="none" stroke="${C2}" stroke-width="2" stroke-dasharray="8,4"/>
  <rect x="60" y="96" width="60" height="24" rx="5" fill="${C2}"/>
  <text x="90" y="112" text-anchor="middle" fill="white" font-size="12" font-weight="600">src/</text>

  <!-- components/ -->
  <rect x="90" y="145" width="580" height="350" rx="10" fill="#ecfeff" stroke="${C1}" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="90" y="131" width="120" height="24" rx="5" fill="${C1}"/>
  <text x="150" y="147" text-anchor="middle" fill="white" font-size="12" font-weight="600">components/</text>
  ${[
    ['landing/', 110, 175, 160], ['auth/', 290, 175, 100],
    ['dashboard/', 110, 230, 160], ['admin/', 290, 230, 100],
    ['parcelles/', 110, 285, 160], ['irrigation/', 290, 285, 100],
    ['carte/', 110, 340, 130], ['meteo/', 260, 340, 110],
    ['ai/', 390, 340, 80], ['materiels/', 490, 340, 140],
    ['notifications/', 110, 395, 170], ['support/', 300, 395, 110],
    ['subscription/', 430, 395, 170], ['ui/', 110, 450, 80],
    ['layout/', 210, 450, 100], ['account/', 330, 450, 110],
  ].map(([label,x,y,w])=>`
    <rect x="${x}" y="${y}" width="${w}" height="30" rx="6" fill="white" stroke="${C1}" stroke-width="1"/>
    <text x="${x+w/2}" y="${y+19}" text-anchor="middle" fill="${C1}" font-size="11" font-weight="500">${label}</text>
  `).join('')}

  <!-- pages/ -->
  <rect x="90" y="520" width="200" height="100" rx="10" fill="#eff6ff" stroke="${B1}" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="90" y="506" width="70" height="24" rx="5" fill="${B1}"/>
  <text x="125" y="522" text-anchor="middle" fill="white" font-size="12" font-weight="600">pages/</text>
  ${[['farmer/ParcelleDetail', 110, 545, 170],['farmer/ParcelleForm', 110, 590, 165]].map(([label,x,y,w])=>`
    <rect x="${x}" y="${y}" width="${w}" height="26" rx="5" fill="white" stroke="${B1}" stroke-width="1"/>
    <text x="${x+w/2}" y="${y+17}" text-anchor="middle" fill="${B1}" font-size="10">${label}</text>
  `).join('')}

  <!-- hooks/ -->
  <rect x="310" y="520" width="210" height="180" rx="10" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="310" y="506" width="70" height="24" rx="5" fill="#ca8a04"/>
  <text x="345" y="522" text-anchor="middle" fill="white" font-size="12" font-weight="600">hooks/</text>
  ${['useAuth','useProfile','useParcelles','useSensorData','useCalendrier','useNotifications','useMaterials','useSubscription'].map((h,i)=>`
    <rect x="318" y="${545+i*17}" width="194" height="15" rx="4" fill="white" stroke="#fde047" stroke-width="0.8"/>
    <text x="415" y="${556+i*17}" text-anchor="middle" fill="#92400e" font-size="10">${h}</text>
  `).join('')}

  <!-- contexts/ -->
  <rect x="540" y="520" width="180" height="130" rx="10" fill="#fdf4ff" stroke="#a855f7" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="540" y="506" width="90" height="24" rx="5" fill="#a855f7"/>
  <text x="585" y="522" text-anchor="middle" fill="white" font-size="12" font-weight="600">contexts/</text>
  ${['ThemeContext','LanguageContext','SubscriptionContext'].map((c,i)=>`
    <rect x="548" y="${545+i*28}" width="164" height="22" rx="5" fill="white" stroke="#d8b4fe" stroke-width="1"/>
    <text x="630" y="${560+i*28}" text-anchor="middle" fill="#6b21a8" font-size="11">${c}</text>
  `).join('')}

  <!-- lib/ -->
  <rect x="740" y="145" width="220" height="200" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="740" y="131" width="50" height="24" rx="5" fill="#f97316}"/>
  <rect x="740" y="131" width="50" height="24" rx="5" fill="#f97316"/>
  <text x="765" y="147" text-anchor="middle" fill="white" font-size="12" font-weight="600">lib/</text>
  ${['supabase.ts','gemini.ts','groq.ts','weather.ts','pdfExport.ts','constants.ts','animations.ts'].map((f,i)=>`
    <rect x="750" y="${158+i*26}" width="200" height="22" rx="5" fill="white" stroke="#fed7aa" stroke-width="1"/>
    <text x="850" y="${173+i*26}" text-anchor="middle" fill="#9a3412" font-size="11">${f}</text>
  `).join('')}

  <!-- types/ -->
  <rect x="740" y="365" width="200" height="100" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="740" y="351" width="65" height="24" rx="5" fill="#16a34a"/>
  <text x="772" y="367" text-anchor="middle" fill="white" font-size="12" font-weight="600">types/</text>
  ${['index.ts','database.ts'].map((f,i)=>`
    <rect x="750" y="${382+i*32}" width="180" height="26" rx="5" fill="white" stroke="#86efac" stroke-width="1"/>
    <text x="840" y="${399+i*32}" text-anchor="middle" fill="#166534" font-size="12">${f}</text>
  `).join('')}

  <!-- supabase/ -->
  <rect x="990" y="145" width="320" height="360" rx="10" fill="#eff6ff" stroke="${B1}" stroke-width="1.8" filter="url(#sh)"/>
  <rect x="990" y="131" width="90" height="24" rx="5" fill="${B1}"/>
  <text x="1035" y="147" text-anchor="middle" fill="white" font-size="12" font-weight="600">supabase/</text>
  <text x="1000" y="178" fill="${B1}" font-size="11" font-weight="600">migrations/</text>
  ${['001_create_profiles.sql','002_create_parcelles.sql','003_create_sensor_data.sql','004_create_calendrier.sql','005_user_settings.sql','006_support_tickets.sql','007_update_trigger.sql','008_admin_blocking.sql','009_mobile_tables.sql'].map((f,i)=>`
    <rect x="1000" y="${188+i*22}" width="300" height="18" rx="4" fill="white" stroke="#bfdbfe" stroke-width="0.8"/>
    <text x="1150" y="${201+i*22}" text-anchor="middle" fill="${B1}" font-size="10">${f}</text>
  `).join('')}
  <text x="1000" y="398" fill="${B1}" font-size="11" font-weight="600">functions/</text>
  ${['gemini-proxy/index.ts','sensor-simulator/index.ts'].map((f,i)=>`
    <rect x="1000" y="${408+i*26}" width="300" height="22" rx="5" fill="white" stroke="#bfdbfe" stroke-width="1"/>
    <text x="1150" y="${423+i*26}" text-anchor="middle" fill="${B1}" font-size="11">${f}</text>
  `).join('')}
  <rect x="1000" y="465" width="300" height="22" rx="5" fill="white" stroke="#bfdbfe" stroke-width="1"/>
  <text x="1150" y="480" text-anchor="middle" fill="${B1}" font-size="11">schema.sql</text>

  <!-- ARROWS: dependencies -->
  <line x1="670" y1="320" x2="740" y2="260" stroke="${C1}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrD)"/>
  <text x="690" y="285" fill="${C1}" font-size="10">«use»</text>
  <line x1="520" y1="560" x2="740" y2="200" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <line x1="670" y1="300" x2="990" y2="260" stroke="${B1}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>

  <!-- App.tsx -->
  <rect x="740" y="520" width="200" height="60" rx="10" fill="white" stroke="${C2}" stroke-width="2" filter="url(#sh)"/>
  <text x="840" y="545" text-anchor="middle" fill="${C2}" font-size="14" font-weight="700">App.tsx</text>
  <text x="840" y="565" text-anchor="middle" fill="${GRAY}" font-size="11">Point d'entrée</text>

  <text x="700" y="845" text-anchor="middle" fill="${GRAY}" font-size="12">CalisteAgriTech · Diagramme de Paquetage UML · React + TypeScript + Supabase · 2025</text>
</svg>`;

toPng(pkg, '10_diagramme_paquetage.png');

// ═══════════════════════════════════════════════════
// 11. DIAGRAMME DE DEPLOIEMENT
// ═══════════════════════════════════════════════════
const deploy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="nodeGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#0f2744"/>
    </linearGradient>
    <filter id="glow"><feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${C1}" flood-opacity="0.4"/></filter>
    <filter id="sh"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/></filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${C3}"/>
    </marker>
    <marker id="arrW" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="white"/>
    </marker>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>
  <rect width="1400" height="70" fill="url(#hdr)"/>
  <text x="700" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="700">Diagramme de Déploiement — CalisteAgriTech</text>
  <text x="700" y="54" text-anchor="middle" fill="#a5f3fc" font-size="14">Infrastructure · Nœuds, artefacts et protocoles de communication</text>

  <!-- NODE: Navigateur Client -->
  <rect x="40" y="100" width="320" height="320" rx="14" fill="url(#nodeGrad)" stroke="${C1}" stroke-width="2.5" filter="url(#glow)"/>
  <rect x="40" y="100" width="320" height="44" rx="14" fill="${C1}"/>
  <rect x="40" y="130" width="320" height="14" fill="${C1}"/>
  <text x="60" y="124" fill="white" font-size="13">💻</text>
  <text x="90" y="124" fill="white" font-size="13" font-weight="700">«device» Navigateur Client</text>
  <!-- artifacts -->
  ${[
    ['React 18 SPA','Vite + TypeScript','Tailwind CSS','Framer Motion','Recharts','react-leaflet','supabase-js','Contexts & Hooks'],
  ][0].map((a,i)=>`
    <rect x="56" y="${155+i*28}" width="288" height="22" rx="6" fill="rgba(8,145,178,0.15)" stroke="${C3}" stroke-width="0.8"/>
    <text x="200" y="${170+i*28}" text-anchor="middle" fill="#a5f3fc" font-size="11">«artifact» ${a}</text>
  `).join('')}

  <!-- NODE: Supabase Cloud -->
  <rect x="520" y="100" width="360" height="380" rx="14" fill="url(#nodeGrad)" stroke="${B1}" stroke-width="2.5" filter="url(#glow)"/>
  <rect x="520" y="100" width="360" height="44" rx="14" fill="${B1}"/>
  <rect x="520" y="130" width="360" height="14" fill="${B1}"/>
  <text x="540" y="124" fill="white" font-size="13">☁️</text>
  <text x="570" y="124" fill="white" font-size="13" font-weight="700">«cloud» Supabase BaaS</text>
  ${[
    'PostgreSQL 15 DB','Auth Service (JWT)','Row Level Security','Supabase Storage','Realtime WebSocket','Edge Functions (Deno)','PostgREST API','Studio Admin'
  ].map((a,i)=>`
    <rect x="536" y="${155+i*28}" width="328" height="22" rx="6" fill="rgba(29,78,216,0.2)" stroke="#93c5fd" stroke-width="0.8"/>
    <text x="700" y="${170+i*28}" text-anchor="middle" fill="#bfdbfe" font-size="11">«artifact» ${a}</text>
  `).join('')}

  <!-- NODE: Google Cloud (Gemini) -->
  <rect x="1020" y="100" width="340" height="200" rx="14" fill="url(#nodeGrad)" stroke="#7c3aed" stroke-width="2.5" filter="url(#glow)"/>
  <rect x="1020" y="100" width="340" height="44" rx="14" fill="#7c3aed"/>
  <rect x="1020" y="130" width="340" height="14" fill="#7c3aed"/>
  <text x="1040" y="124" fill="white" font-size="13">🤖</text>
  <text x="1070" y="124" fill="white" font-size="13" font-weight="700">«cloud» Google Gemini AI</text>
  ${['Gemini Pro API','gemini-proxy Edge Fn','Groq API (backup)','AI Activity Logger'].map((a,i)=>`
    <rect x="1036" y="${155+i*28}" width="308" height="22" rx="6" fill="rgba(124,58,237,0.2)" stroke="#c4b5fd" stroke-width="0.8"/>
    <text x="1190" y="${170+i*28}" text-anchor="middle" fill="#c4b5fd" font-size="11">«artifact» ${a}</text>
  `).join('')}

  <!-- NODE: Open-Meteo -->
  <rect x="1020" y="330" width="340" height="150" rx="14" fill="url(#nodeGrad)" stroke="#0369a1" stroke-width="2.5" filter="url(#glow)"/>
  <rect x="1020" y="330" width="340" height="44" rx="14" fill="#0369a1"/>
  <rect x="1020" y="360" width="340" height="14" fill="#0369a1"/>
  <text x="1040" y="354" fill="white" font-size="13">⛅</text>
  <text x="1070" y="354" fill="white" font-size="13" font-weight="700">«cloud» Open-Meteo API</text>
  ${['Weather Forecast API','UV Index / Wind data'].map((a,i)=>`
    <rect x="1036" y="${385+i*30}" width="308" height="24" rx="6" fill="rgba(3,105,161,0.2)" stroke="#7dd3fc" stroke-width="0.8"/>
    <text x="1190" y="${401+i*30}" text-anchor="middle" fill="#7dd3fc" font-size="11">«artifact» ${a}</text>
  `).join('')}

  <!-- NODE: OpenStreetMap -->
  <rect x="1020" y="510" width="340" height="120" rx="14" fill="url(#nodeGrad)" stroke="#16a34a" stroke-width="2.5" filter="url(#glow)"/>
  <rect x="1020" y="510" width="340" height="44" rx="14" fill="#16a34a"/>
  <rect x="1020" y="540" width="340" height="14" fill="#16a34a"/>
  <text x="1040" y="534" fill="white" font-size="13">🗺️</text>
  <text x="1070" y="534" fill="white" font-size="13" font-weight="700">«cloud» OpenStreetMap / Leaflet</text>
  <rect x="1036" y="564" width="308" height="24" rx="6" fill="rgba(22,163,74,0.2)" stroke="#86efac" stroke-width="0.8"/>
  <text x="1190" y="580" text-anchor="middle" fill="#86efac" font-size="11">«artifact» Tiles API / react-leaflet</text>

  <!-- NODE: Vercel / CDN -->
  <rect x="40" y="470" width="320" height="150" rx="14" fill="url(#nodeGrad)" stroke="#d97706" stroke-width="2.5" filter="url(#glow)"/>
  <rect x="40" y="470" width="320" height="44" rx="14" fill="#d97706"/>
  <rect x="40" y="500" width="320" height="14" fill="#d97706"/>
  <text x="60" y="494" fill="white" font-size="13">🚀</text>
  <text x="90" y="494" fill="white" font-size="13" font-weight="700">«server» Vercel / CDN</text>
  ${['SPA Build (dist/)','Static Assets','HTTPS / TLS'].map((a,i)=>`
    <rect x="56" y="${525+i*30}" width="288" height="24" rx="6" fill="rgba(217,119,6,0.2)" stroke="#fcd34d" stroke-width="0.8"/>
    <text x="200" y="${541+i*30}" text-anchor="middle" fill="#fcd34d" font-size="11">«artifact» ${a}</text>
  `).join('')}

  <!-- COMMUNICATION LINES -->
  <!-- Client ↔ Supabase -->
  <line x1="360" y1="260" x2="520" y2="260" stroke="${C3}" stroke-width="2.5" marker-end="url(#arr)"/>
  <text x="420" y="250" fill="${C3}" font-size="11" font-weight="600">HTTPS / WSS</text>
  <line x1="520" y1="300" x2="360" y2="300" stroke="${C3}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="390" y="318" fill="#64748b" font-size="10">JSON / JWT</text>

  <!-- Client ↔ Gemini (via Edge Fn) -->
  <line x1="360" y1="200" x2="1020" y2="190" stroke="#a855f7" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arr)"/>
  <text x="680" y="185" fill="#a855f7" font-size="11">HTTPS (via gemini-proxy)</text>

  <!-- Client ↔ Open-Meteo -->
  <line x1="360" y1="160" x2="1020" y2="400" stroke="#0369a1" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="620" y="290" fill="#0369a1" font-size="10">REST API</text>

  <!-- Client ↔ OSM -->
  <line x1="355" y1="130" x2="1020" y2="570" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>

  <!-- Vercel → Client -->
  <line x1="200" y1="470" x2="200" y2="420" stroke="#d97706" stroke-width="2" marker-end="url(#arrW)"/>
  <text x="210" y="450" fill="#d97706" font-size="11">Deploy</text>

  <!-- Supabase ↔ Gemini -->
  <line x1="880" y1="200" x2="1020" y2="200" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="920" y="190" fill="#7c3aed" font-size="10">Edge Fn call</text>

  <!-- LEGEND -->
  <rect x="40" y="660" width="940" height="60" rx="10" fill="#1e3a5f" stroke="${C1}" stroke-width="1"/>
  <text x="60" y="685" fill="${C3}" font-size="12" font-weight="700">Protocoles :</text>
  <text x="60" y="705" fill="#94a3b8" font-size="11">HTTPS (REST) · WSS (WebSocket Realtime) · JWT (Auth) · Deno (Edge Functions) · PostgREST (DB API)</text>

  <text x="700" y="845" text-anchor="middle" fill="#475569" font-size="12">CalisteAgriTech · Diagramme de Déploiement UML · 2025</text>
</svg>`;

toPng(deploy, '11_diagramme_deploiement.png');
console.log('2/4 done');
