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
// 12. DIAGRAMME DE COMPOSANT
// ═══════════════════════════════════════════════════
const comp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
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
    <marker id="arrC" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${C1}"/>
    </marker>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>
  <rect width="1400" height="70" fill="url(#hdr)"/>
  <text x="700" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="700">Diagramme de Composant — CalisteAgriTech</text>
  <text x="700" y="54" text-anchor="middle" fill="#a5f3fc" font-size="14">Composants React, interfaces et dépendances</text>

  <!-- COMPONENT icon helper: small rectangle with tabs -->

  <!-- App.tsx (root) -->
  <rect x="580" y="90" width="240" height="60" rx="10" fill="white" stroke="${C2}" stroke-width="2.5" filter="url(#sh)"/>
  <rect x="580" y="82" width="8" height="20" rx="2" fill="${C2}"/>
  <rect x="590" y="82" width="8" height="20" rx="2" fill="${C2}"/>
  <text x="700" y="118" text-anchor="middle" fill="${C2}" font-size="15" font-weight="700">«component» App.tsx</text>
  <text x="700" y="138" text-anchor="middle" fill="${GRAY}" font-size="11">Routeur principal · Providers</text>

  <!-- ROW 1: PROVIDERS -->
  ${[
    ['ThemeContext','#7c3aed',110,200],
    ['LanguageContext','#0369a1',310,200],
    ['SubscriptionContext','#16a34a',520,200],
    ['AuthProvider','#dc2626',740,200],
    ['AppLayout','${C1}',970,200],
  ].map(([label,color,x,y])=>`
    <rect x="${x}" y="${y}" width="180" height="50" rx="9" fill="white" stroke="${color}" stroke-width="1.8" filter="url(#sh)"/>
    <rect x="${x}" y="${y-8}" width="6" height="16" rx="2" fill="${color}"/>
    <rect x="${x+8}" y="${y-8}" width="6" height="16" rx="2" fill="${color}"/>
    <text x="${x+90}" y="${y+24}" text-anchor="middle" fill="${color}" font-size="12" font-weight="600">${label}</text>
    <text x="${x+90}" y="${y+40}" text-anchor="middle" fill="${GRAY}" font-size="10">«context»</text>
  `).join('')}

  <!-- Lines from App to providers -->
  ${[200,400,610,830,1060].map(x=>`
    <line x1="700" y1="150" x2="${x}" y2="200" stroke="${C1}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  `).join('')}

  <!-- ROW 2: PAGES/SCREENS -->
  <text x="700" y="295" text-anchor="middle" fill="${GRAY}" font-size="13" font-weight="600">PAGES ET ONGLETS PRINCIPAUX</text>

  ${[
    ['LandingPage','#f97316',80,320],
    ['LoginScreen','#dc2626',270,320],
    ['OverviewTab','${C1}',460,320],
    ['ParcellesTab','#16a34a',650,320],
    ['IrrigationTab','#0369a1',840,320],
    ['CarteTab','#16a34a',1030,320],
    ['MeteoTab','#0891b2',1220,320],
  ].map(([label,color,x,y])=>`
    <rect x="${x}" y="${y}" width="160" height="45" rx="8" fill="white" stroke="${color}" stroke-width="1.8" filter="url(#sh)"/>
    <rect x="${x}" y="${y-7}" width="5" height="14" rx="1" fill="${color}"/>
    <rect x="${x+7}" y="${y-7}" width="5" height="14" rx="1" fill="${color}"/>
    <text x="${x+80}" y="${y+27}" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">${label}</text>
  `).join('')}

  <!-- ROW 3: SHARED COMPONENTS -->
  <text x="700" y="415" text-anchor="middle" fill="${GRAY}" font-size="13" font-weight="600">COMPOSANTS PARTAGÉS</text>

  ${[
    ['AITab','#7c3aed',80,440],
    ['AdminDashboard','#dc2626',270,440],
    ['MaterielsTab','#d97706',460,440],
    ['NotificPanel','#f97316',650,440],
    ['SupportTab','#0369a1',840,440],
    ['SettingsTab','${GRAY}',1030,440],
    ['PlansPage','#7c3aed',1220,440],
  ].map(([label,color,x,y])=>`
    <rect x="${x}" y="${y}" width="160" height="45" rx="8" fill="white" stroke="${color}" stroke-width="1.8" filter="url(#sh)"/>
    <rect x="${x}" y="${y-7}" width="5" height="14" rx="1" fill="${color}"/>
    <rect x="${x+7}" y="${y-7}" width="5" height="14" rx="1" fill="${color}"/>
    <text x="${x+80}" y="${y+27}" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">${label}</text>
  `).join('')}

  <!-- ROW 4: HOOKS (interfaces fournies) -->
  <text x="700" y="535" text-anchor="middle" fill="${GRAY}" font-size="13" font-weight="600">HOOKS (INTERFACES FOURNIES AUX COMPOSANTS)</text>

  ${[
    ['useAuth','#dc2626',80,560],
    ['useParcelles','#16a34a',250,560],
    ['useSensorData','#7c3aed',420,560],
    ['useIrrigation','${C1}',590,560],
    ['useCalendrier','#d97706',760,560],
    ['useNotifications','#f97316',930,560],
    ['useMaterials','#d97706',1100,560],
    ['useSubscription','#7c3aed',1270,560],
  ].map(([label,color,x,y])=>`
    <rect x="${x}" y="${y}" width="150" height="38" rx="7" fill="#f8fafc" stroke="${color}" stroke-width="1.5"/>
    <text x="${x+75}" y="${y+23}" text-anchor="middle" fill="${color}" font-size="11" font-weight="600">${label}()</text>
  `).join('')}

  <!-- ROW 5: EXTERNAL (provided interfaces) -->
  <text x="700" y="650" text-anchor="middle" fill="${GRAY}" font-size="13" font-weight="600">INTERFACES EXTERNES</text>

  ${[
    ['supabase-js\nClient','${C1}',100,670,'☁️'],
    ['Gemini AI\nProxy','#7c3aed',330,670,'🤖'],
    ['Open-Meteo\nWeather API','#0369a1',560,670,'⛅'],
    ['react-leaflet\nMaps','#16a34a',790,670,'🗺️'],
    ['Recharts\nGraphiques','#f97316',1020,670,'📊'],
    ['html2canvas\nExport PDF','#d97706',1250,670,'📄'],
  ].map(([label,color,x,y,icon])=>`
    <rect x="${x}" y="${y}" width="180" height="55" rx="10" fill="white" stroke="${color}" stroke-width="2" filter="url(#sh)"/>
    <text x="${x+20}" y="${y+28}" font-size="20">${icon}</text>
    <text x="${x+45}" y="${y+25}" fill="${color}" font-size="11" font-weight="700">${label.split('\n')[0]}</text>
    <text x="${x+45}" y="${y+40}" fill="${GRAY}" font-size="10">${label.split('\n')[1]}</text>
  `).join('')}

  <!-- Dependency lines (samples) -->
  <line x1="700" y1="365" x2="700" y2="440" stroke="${C1}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <line x1="700" y1="485" x2="700" y2="560" stroke="${C1}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <line x1="700" y1="598" x2="700" y2="670" stroke="${C1}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>

  <text x="700" y="845" text-anchor="middle" fill="${GRAY}" font-size="12">CalisteAgriTech · Diagramme de Composant UML · React 18 + TypeScript · 2025</text>
</svg>`;

toPng(comp, '12_diagramme_composant.png');

// ═══════════════════════════════════════════════════
// 13. DIAGRAMME DE COMMUNICATION
// ═══════════════════════════════════════════════════
const comm = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/><stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="${C1}" flood-opacity="0.15"/></filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${C1}"/>
    </marker>
    <marker id="arrG" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#16a34a"/>
    </marker>
    <marker id="arrR" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#dc2626"/>
    </marker>
    <marker id="arrP" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#7c3aed"/>
    </marker>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>
  <rect width="1400" height="70" fill="url(#hdr)"/>
  <text x="700" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="700">Diagramme de Communication — CalisteAgriTech</text>
  <text x="700" y="54" text-anchor="middle" fill="#a5f3fc" font-size="14">Scénario : Agriculteur consulte son tableau de bord en temps réel</text>

  <!-- Objects (rounded rectangles) -->
  <!-- Agriculteur -->
  <ellipse cx="120" cy="200" rx="50" ry="50" fill="#ecfeff" stroke="${C1}" stroke-width="2.5" filter="url(#sh)"/>
  <text x="120" y="195" text-anchor="middle" font-size="34">👨‍🌾</text>
  <text x="120" y="265" text-anchor="middle" fill="${C2}" font-size="13" font-weight="700">:Agriculteur</text>

  <!-- App React -->
  <rect x="340" y="130" width="200" height="65" rx="12" fill="white" stroke="${C1}" stroke-width="2.5" filter="url(#sh)"/>
  <text x="440" y="158" text-anchor="middle" fill="${C2}" font-size="13" font-weight="700">:App React</text>
  <text x="440" y="178" text-anchor="middle" fill="${GRAY}" font-size="11">SPA Navigateur</text>

  <!-- useAuth hook -->
  <rect x="680" y="80" width="180" height="55" rx="10" fill="#fef2f2" stroke="#dc2626" stroke-width="2" filter="url(#sh)"/>
  <text x="770" y="107" text-anchor="middle" fill="#dc2626" font-size="13" font-weight="700">:useAuth</text>
  <text x="770" y="125" text-anchor="middle" fill="${GRAY}" font-size="10">Hook Auth</text>

  <!-- Supabase Auth -->
  <rect x="960" y="80" width="200" height="55" rx="10" fill="#eff6ff" stroke="${B1}" stroke-width="2" filter="url(#sh)"/>
  <text x="1060" y="107" text-anchor="middle" fill="${B1}" font-size="13" font-weight="700">:SupabaseAuth</text>
  <text x="1060" y="125" text-anchor="middle" fill="${GRAY}" font-size="10">JWT Service</text>

  <!-- useParcelles -->
  <rect x="340" y="310" width="200" height="55" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="440" y="337" text-anchor="middle" fill="#16a34a" font-size="13" font-weight="700">:useParcelles</text>
  <text x="440" y="353" text-anchor="middle" fill="${GRAY}" font-size="10">Hook Data</text>

  <!-- PostgreSQL -->
  <rect x="680" y="310" width="200" height="55" rx="10" fill="#eff6ff" stroke="${B1}" stroke-width="2" filter="url(#sh)"/>
  <text x="780" y="337" text-anchor="middle" fill="${B1}" font-size="13" font-weight="700">:PostgreSQL</text>
  <text x="780" y="353" text-anchor="middle" fill="${GRAY}" font-size="10">Supabase DB</text>

  <!-- useSensorData -->
  <rect x="960" y="310" width="200" height="55" rx="10" fill="#fdf4ff" stroke="#7c3aed" stroke-width="2" filter="url(#sh)"/>
  <text x="1060" y="337" text-anchor="middle" fill="#7c3aed" font-size="13" font-weight="700">:useSensorData</text>
  <text x="1060" y="353" text-anchor="middle" fill="${GRAY}" font-size="10">IoT Hook</text>

  <!-- Realtime WS -->
  <rect x="1200" y="310" width="160" height="55" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="2" filter="url(#sh)"/>
  <text x="1280" y="337" text-anchor="middle" fill="#f97316" font-size="13" font-weight="700">:Realtime</text>
  <text x="1280" y="353" text-anchor="middle" fill="${GRAY}" font-size="10">WebSocket</text>

  <!-- Gemini AI -->
  <rect x="680" y="510" width="200" height="55" rx="10" fill="#fdf4ff" stroke="#7c3aed" stroke-width="2" filter="url(#sh)"/>
  <text x="780" y="537" text-anchor="middle" fill="#7c3aed" font-size="13" font-weight="700">:GeminiAI</text>
  <text x="780" y="553" text-anchor="middle" fill="${GRAY}" font-size="10">Edge Function Proxy</text>

  <!-- useMeteo -->
  <rect x="340" y="510" width="200" height="55" rx="10" fill="#eff6ff" stroke="#0369a1" stroke-width="2" filter="url(#sh)"/>
  <text x="440" y="537" text-anchor="middle" fill="#0369a1" font-size="13" font-weight="700">:useMeteo</text>
  <text x="440" y="553" text-anchor="middle" fill="${GRAY}" font-size="10">Weather Hook</text>

  <!-- Open-Meteo -->
  <rect x="960" y="510" width="200" height="55" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="1060" y="537" text-anchor="middle" fill="#16a34a" font-size="13" font-weight="700">:Open-Meteo</text>
  <text x="1060" y="553" text-anchor="middle" fill="${GRAY}" font-size="10">API Météo</text>

  <!-- COMMUNICATION LINKS + MESSAGES -->
  <!-- 1: Agriculteur → App : ouvrirDashboard() -->
  <line x1="170" y1="200" x2="340" y2="163" stroke="${C1}" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="200" y="165" width="140" height="22" rx="5" fill="white" stroke="${C1}" stroke-width="0.5"/>
  <text x="270" y="181" text-anchor="middle" fill="${C1}" font-size="10" font-weight="600">1: ouvrirDashboard()</text>

  <!-- 2: App → useAuth : verifierSession() -->
  <line x1="540" y1="155" x2="680" y2="115" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arrR)"/>
  <rect x="545" y="118" width="140" height="22" rx="5" fill="white" stroke="#dc2626" stroke-width="0.5"/>
  <text x="615" y="134" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="600">2: verifierSession()</text>

  <!-- 3: useAuth → SupabaseAuth : getUser() -->
  <line x1="860" y1="107" x2="960" y2="107" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arrR)"/>
  <text x="905" y="100" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="600">3: getUser()</text>

  <!-- 4: SupabaseAuth → useAuth : user+JWT -->
  <line x1="960" y1="125" x2="860" y2="125" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>
  <text x="905" y="142" text-anchor="middle" fill="${GRAY}" font-size="10">4: {user, JWT}</text>

  <!-- 5: App → useParcelles : chargerParcelles() -->
  <line x1="440" y1="195" x2="440" y2="310" stroke="#16a34a" stroke-width="1.8" marker-end="url(#arrG)"/>
  <text x="455" y="260" fill="#16a34a" font-size="10" font-weight="600">5: chargerParcelles()</text>

  <!-- 6: useParcelles → PostgreSQL : SELECT * FROM parcelles -->
  <line x1="540" y1="337" x2="680" y2="337" stroke="#16a34a" stroke-width="1.8" marker-end="url(#arrG)"/>
  <rect x="540" y="317" width="145" height="22" rx="5" fill="white" stroke="#16a34a" stroke-width="0.5"/>
  <text x="612" y="333" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="600">6: SELECT parcelles (RLS)</text>

  <!-- 7: PostgreSQL → useParcelles : parcelles[] -->
  <line x1="680" y1="355" x2="540" y2="355" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>
  <text x="610" y="372" text-anchor="middle" fill="${GRAY}" font-size="10">7: parcelles[]</text>

  <!-- 8: App → useSensorData : abonnerCapteurs() -->
  <line x1="540" y1="175" x2="960" y2="320" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrP)"/>
  <rect x="680" y="230" width="160" height="22" rx="5" fill="white" stroke="#7c3aed" stroke-width="0.5"/>
  <text x="760" y="246" text-anchor="middle" fill="#7c3aed" font-size="10" font-weight="600">8: abonnerCapteurs()</text>

  <!-- 9: useSensorData → Realtime : subscribe(channel) -->
  <line x1="1160" y1="337" x2="1200" y2="337" stroke="#f97316" stroke-width="1.8" marker-end="url(#arr)"/>
  <text x="1175" y="328" text-anchor="middle" fill="#f97316" font-size="10">9: subscribe()</text>

  <!-- 10: Realtime → useSensorData : push(data) -->
  <line x1="1200" y1="357" x2="1160" y2="357" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>
  <text x="1175" y="373" text-anchor="middle" fill="${GRAY}" font-size="10">10: push(sensorData)</text>

  <!-- 11: App → useMeteo : chargerMeteo() -->
  <line x1="440" y1="195" x2="440" y2="510" stroke="#0369a1" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="400" y="400" fill="#0369a1" font-size="10" font-weight="600">11: chargerMeteo()</text>

  <!-- 12: useMeteo → Open-Meteo API -->
  <line x1="540" y1="537" x2="960" y2="537" stroke="#0369a1" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="750" y="527" text-anchor="middle" fill="#0369a1" font-size="10" font-weight="600">12: GET /forecast?lat=3.8&lng=11.5</text>

  <!-- 13: Open-Meteo → useMeteo -->
  <line x1="960" y1="555" x2="540" y2="555" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>
  <text x="750" y="572" text-anchor="middle" fill="${GRAY}" font-size="10">13: {temp, rain, wind...}</text>

  <!-- 14: Agriculteur demande IA -->
  <line x1="170" y1="230" x2="680" y2="530" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrP)"/>
  <rect x="290" y="380" width="155" height="22" rx="5" fill="white" stroke="#7c3aed" stroke-width="0.5"/>
  <text x="367" y="396" text-anchor="middle" fill="#7c3aed" font-size="10" font-weight="600">14: demanderDiagnostic()</text>

  <!-- LEGEND -->
  <rect x="40" y="660" width="1000" height="55" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1" filter="url(#sh)"/>
  <line x1="60" y1="682" x2="100" y2="682" stroke="${C1}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="110" y="686" fill="${DARK}" font-size="11">Appel (sync)</text>
  <line x1="250" y1="682" x2="290" y2="682" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>
  <text x="300" y="686" fill="${DARK}" font-size="11">Retour (async)</text>
  <text x="460" y="686" fill="${DARK}" font-size="11">N: Numéro de message = séquence</text>
  <line x1="60" y1="706" x2="100" y2="706" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrP)"/>
  <text x="110" y="710" fill="${DARK}" font-size="11">Appel conditionnel / asynchrone</text>

  <text x="700" y="845" text-anchor="middle" fill="${GRAY}" font-size="12">CalisteAgriTech · Diagramme de Communication UML · Scénario : Chargement Dashboard · 2025</text>
</svg>`;

toPng(comm, '13_diagramme_communication.png');
console.log('done part4');
