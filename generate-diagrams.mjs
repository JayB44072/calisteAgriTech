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

// ─── COULEURS DU PROJET ────────────────────────────────────────────────────────
const C1 = '#0891b2'; // cyan-600
const C2 = '#0e7490'; // cyan-700
const C3 = '#06b6d4'; // cyan-400
const B1 = '#1d4ed8'; // blue-700
const B2 = '#3b82f6'; // blue-500
const DARK = '#0f172a'; // slate-900
const GRAY = '#64748b'; // slate-500
const WHITE = '#ffffff';
const LIGHT = '#f0f9ff'; // cyan-50

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ARCHITECTURE TECHNIQUE
// ═══════════════════════════════════════════════════════════════════════════════
const arch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="box1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ecfeff"/>
      <stop offset="100%" stop-color="#cffafe"/>
    </linearGradient>
    <linearGradient id="box2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="box3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0891b2" flood-opacity="0.15"/>
    </filter>
    <filter id="shadow2">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.1"/>
    </filter>
    <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="${C1}"/>
    </marker>
    <marker id="arrow2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="${B1}"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="1400" height="860" fill="url(#bg)"/>

  <!-- Header -->
  <rect width="1400" height="90" fill="url(#hdr)" rx="0"/>
  <text x="700" y="40" text-anchor="middle" fill="white" font-size="28" font-weight="700">CalisteAgriTech — Architecture Technique</text>
  <text x="700" y="70" text-anchor="middle" fill="#a5f3fc" font-size="16">Stack complète · React + TypeScript + Supabase + Gemini AI</text>

  <!-- LAYER LABELS -->
  <text x="30" y="165" fill="${GRAY}" font-size="13" font-weight="600" transform="rotate(-90, 30, 165)">COUCHE PRÉSENTATION</text>
  <text x="30" y="400" fill="${GRAY}" font-size="13" font-weight="600" transform="rotate(-90, 30, 400)">COUCHE LOGIQUE</text>
  <text x="30" y="650" fill="${GRAY}" font-size="13" font-weight="600" transform="rotate(-90, 30, 650)">COUCHE DONNÉES</text>

  <!-- ── FRONTEND BLOCK ── -->
  <rect x="70" y="110" width="580" height="200" rx="16" fill="url(#box1)" stroke="${C1}" stroke-width="2" filter="url(#shadow)"/>
  <rect x="70" y="110" width="580" height="48" rx="16" fill="${C1}"/>
  <rect x="70" y="142" width="580" height="16" fill="${C1}"/>
  <text x="360" y="143" text-anchor="middle" fill="white" font-size="17" font-weight="700">🖥️  Frontend — React 18 + TypeScript + Vite</text>

  <!-- Frontend modules -->
  ${[
    ['Landing Page', 170, 190, '#ecfeff', C1],
    ['Auth Modal', 310, 190, '#ecfeff', C1],
    ['Dashboard', 450, 190, '#ecfeff', C1],
    ['Admin Panel', 590, 190, '#ecfeff', C1],
  ].map(([label, x, y, bg, stroke]) => `
    <rect x="${x - 60}" y="${y}" width="120" height="38" rx="10" fill="${bg}" stroke="${stroke}" stroke-width="1.5"/>
    <text x="${x}" y="${y + 24}" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">${label}</text>
  `).join('')}

  <!-- Frontend sub-modules -->
  ${[
    ['Parcelles', 120, 250],
    ['Météo', 230, 250],
    ['Irrigation', 340, 250],
    ['Carte', 450, 250],
    ['IoT/Matériels', 560, 250],
    ['IA Advisor', 670, 250],
  ].map(([label, x, y]) => `
    <rect x="${x - 50}" y="${y}" width="100" height="32" rx="8" fill="white" stroke="${C3}" stroke-width="1.2"/>
    <text x="${x}" y="${y + 21}" text-anchor="middle" fill="${C2}" font-size="11" font-weight="500">${label}</text>
  `).join('')}

  <!-- ── CONTEXTS & HOOKS ── -->
  <rect x="680" y="110" width="300" height="200" rx="16" fill="#fefce8" stroke="#eab308" stroke-width="2" filter="url(#shadow)"/>
  <rect x="680" y="110" width="300" height="48" rx="16" fill="#ca8a04"/>
  <rect x="680" y="142" width="300" height="16" fill="#ca8a04"/>
  <text x="830" y="143" text-anchor="middle" fill="white" font-size="15" font-weight="700">⚛️  Contexts &amp; Hooks</text>
  ${[
    ['ThemeContext', 760, 190],
    ['LanguageContext', 900, 190],
    ['SubscriptionCtx', 760, 240],
    ['useAuth / useProfile', 900, 240],
    ['useCalendrier', 760, 285],
    ['useNotifications', 900, 285],
  ].map(([label, x, y]) => `
    <rect x="${x - 70}" y="${y - 16}" width="140" height="28" rx="7" fill="white" stroke="#fde047" stroke-width="1.2"/>
    <text x="${x}" y="${y}" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="500">${label}</text>
  `).join('')}

  <!-- ── UI LIBS ── -->
  <rect x="1010" y="110" width="360" height="200" rx="16" fill="#fdf4ff" stroke="#a855f7" stroke-width="2" filter="url(#shadow)"/>
  <rect x="1010" y="110" width="360" height="48" rx="16" fill="#9333ea"/>
  <rect x="1010" y="142" width="360" height="16" fill="#9333ea"/>
  <text x="1190" y="143" text-anchor="middle" fill="white" font-size="15" font-weight="700">🎨  UI &amp; Librairies</text>
  ${[
    ['Tailwind CSS', 1090, 185],
    ['Framer Motion', 1290, 185],
    ['Lucide React', 1090, 230],
    ['Recharts', 1290, 230],
    ['react-leaflet', 1090, 275],
    ['date-fns', 1290, 275],
  ].map(([label, x, y]) => `
    <rect x="${x - 80}" y="${y - 16}" width="160" height="28" rx="7" fill="white" stroke="#d8b4fe" stroke-width="1.2"/>
    <text x="${x}" y="${y}" text-anchor="middle" fill="#6b21a8" font-size="12" font-weight="500">${label}</text>
  `).join('')}

  <!-- ── SUPABASE BLOCK ── -->
  <rect x="70" y="360" width="580" height="200" rx="16" fill="url(#box2)" stroke="${B1}" stroke-width="2" filter="url(#shadow)"/>
  <rect x="70" y="360" width="580" height="48" rx="16" fill="${B1}"/>
  <rect x="70" y="392" width="580" height="16" fill="${B1}"/>
  <text x="360" y="393" text-anchor="middle" fill="white" font-size="17" font-weight="700">☁️  Supabase BaaS (Backend-as-a-Service)</text>
  ${[
    ['Auth / JWT', 150, 430, '#eff6ff', B1],
    ['PostgreSQL DB', 310, 430, '#eff6ff', B1],
    ['Row Level Security', 480, 430, '#eff6ff', B1],
    ['Storage', 615, 430, '#eff6ff', B1],
  ].map(([label, x, y, bg, stroke]) => `
    <rect x="${x - 80}" y="${y}" width="160" height="36" rx="9" fill="${bg}" stroke="${stroke}" stroke-width="1.5"/>
    <text x="${x}" y="${y + 23}" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">${label}</text>
  `).join('')}
  ${[
    ['Edge Functions', 150, 495],
    ['Realtime', 310, 495],
    ['supabase-js Client', 480, 495],
    ['Triggers', 615, 495],
  ].map(([label, x, y]) => `
    <rect x="${x - 80}" y="${y}" width="160" height="32" rx="8" fill="white" stroke="${B2}" stroke-width="1"/>
    <text x="${x}" y="${y + 21}" text-anchor="middle" fill="${B1}" font-size="11">${label}</text>
  `).join('')}

  <!-- ── GEMINI AI ── -->
  <rect x="680" y="360" width="300" height="200" rx="16" fill="#fff7ed" stroke="#f97316" stroke-width="2" filter="url(#shadow)"/>
  <rect x="680" y="360" width="300" height="48" rx="16" fill="#ea580c"/>
  <rect x="680" y="392" width="300" height="16" fill="#ea580c"/>
  <text x="830" y="393" text-anchor="middle" fill="white" font-size="15" font-weight="700">🤖  Google Gemini AI</text>
  ${[
    ['gemini-proxy (Edge Fn)', 830, 440],
    ['Diagnostic IA', 760, 490],
    ['Conseils cultures', 900, 490],
    ['Analyse capteurs', 760, 535],
    ['Prédictions météo', 900, 535],
  ].map(([label, x, y]) => `
    <rect x="${x - 90}" y="${y - 16}" width="180" height="28" rx="7" fill="white" stroke="#fed7aa" stroke-width="1.2"/>
    <text x="${x}" y="${y}" text-anchor="middle" fill="#9a3412" font-size="11" font-weight="500">${label}</text>
  `).join('')}

  <!-- ── EXTERNAL APIs ── -->
  <rect x="1010" y="360" width="360" height="200" rx="16" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" filter="url(#shadow)"/>
  <rect x="1010" y="360" width="360" height="48" rx="16" fill="#15803d"/>
  <rect x="1010" y="392" width="360" height="16" fill="#15803d"/>
  <text x="1190" y="393" text-anchor="middle" fill="white" font-size="15" font-weight="700">🌐  APIs Externes</text>
  ${[
    ['Open-Meteo (Météo)', 1190, 435],
    ['OpenStreetMap / Leaflet', 1190, 475],
    ['Sensor Simulator (Edge Fn)', 1190, 515],
    ['Supabase Realtime WS', 1190, 555],
  ].map(([label, x, y]) => `
    <rect x="${x - 155}" y="${y - 16}" width="310" height="28" rx="7" fill="white" stroke="#86efac" stroke-width="1.2"/>
    <text x="${x}" y="${y}" text-anchor="middle" fill="#166534" font-size="12" font-weight="500">${label}</text>
  `).join('')}

  <!-- ── DATABASE TABLES ── -->
  <rect x="70" y="610" width="1300" height="200" rx="16" fill="url(#box3)" stroke="#16a34a" stroke-width="2" filter="url(#shadow)"/>
  <rect x="70" y="610" width="1300" height="48" rx="16" fill="#166534"/>
  <rect x="70" y="642" width="1300" height="16" fill="#166534"/>
  <text x="720" y="643" text-anchor="middle" fill="white" font-size="17" font-weight="700">🗄️  Base de données PostgreSQL — Tables principales</text>
  ${[
    ['profiles', 155, 690],
    ['parcelles', 310, 690],
    ['sensor_data', 470, 690],
    ['calendrier_culture', 650, 690],
    ['support_tickets', 850, 690],
    ['notification_settings', 1060, 690],
    ['ai_activity_log', 1230, 690],
    ['user_settings', 1350, 690],
  ].map(([label, x, y]) => `
    <rect x="${x - 80}" y="${y - 20}" width="160" height="40" rx="10" fill="white" stroke="#86efac" stroke-width="1.5" filter="url(#shadow2)"/>
    <text x="${x}" y="${y + 5}" text-anchor="middle" fill="#14532d" font-size="12" font-weight="700">${label}</text>
  `).join('')}

  <!-- Table subtitles -->
  ${[
    ['rôle, statut', 155, 755],
    ['culture, surface', 310, 755],
    ['humidité, temp', 470, 755],
    ['tâches, dates', 650, 755],
    ['tickets SAV', 850, 755],
    ['alertes capteurs', 1060, 755],
    ['logs IA', 1230, 755],
    ['préférences', 1350, 755],
  ].map(([label, x, y]) => `
    <text x="${x}" y="${y}" text-anchor="middle" fill="${GRAY}" font-size="10">${label}</text>
  `).join('')}

  <!-- ── ARROWS ── -->
  <!-- Frontend → Supabase -->
  <line x1="360" y1="310" x2="360" y2="360" stroke="${C1}" stroke-width="2.5" marker-end="url(#arrow)" stroke-dasharray="6,3"/>
  <text x="375" y="340" fill="${C1}" font-size="11">supabase-js</text>

  <!-- Frontend → Gemini -->
  <line x1="560" y1="310" x2="700" y2="360" stroke="${C1}" stroke-width="2.5" marker-end="url(#arrow)" stroke-dasharray="6,3"/>

  <!-- Supabase → DB -->
  <line x1="360" y1="560" x2="360" y2="610" stroke="${B1}" stroke-width="2.5" marker-end="url(#arrow2)" stroke-dasharray="6,3"/>
  <text x="375" y="590" fill="${B1}" font-size="11">SQL / RLS</text>

  <!-- Gemini → DB (logs) -->
  <line x1="830" y1="560" x2="830" y2="610" stroke="#ea580c" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrow2)"/>

  <!-- Footer -->
  <text x="700" y="845" text-anchor="middle" fill="${GRAY}" font-size="12">CalisteAgriTech · Plateforme Smart Farming · Cameroun · 2025</text>
</svg>`;

toPng(arch, '01_architecture_technique.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DIAGRAMME CAS D'UTILISATION
// ═══════════════════════════════════════════════════════════════════════════════
const usecase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="${C1}" flood-opacity="0.12"/>
    </filter>
    <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${GRAY}"/>
    </marker>
    <marker id="arrC" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${C1}"/>
    </marker>
    <marker id="arrB" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${B1}"/>
    </marker>
    <marker id="arrR" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#dc2626"/>
    </marker>
    <marker id="arrG" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a34a"/>
    </marker>
  </defs>

  <rect width="1400" height="900" fill="url(#bg)"/>
  <rect width="1400" height="80" fill="url(#hdr)"/>
  <text x="700" y="34" text-anchor="middle" fill="white" font-size="26" font-weight="700">Diagramme des Cas d'Utilisation — CalisteAgriTech</text>
  <text x="700" y="62" text-anchor="middle" fill="#a5f3fc" font-size="15">Acteurs, rôles et interactions avec le système</text>

  <!-- SYSTEM BOUNDARY -->
  <rect x="260" y="100" width="880" height="760" rx="20" fill="none" stroke="${C1}" stroke-width="2.5" stroke-dasharray="10,5"/>
  <text x="700" y="130" text-anchor="middle" fill="${C1}" font-size="16" font-weight="700">Système CalisteAgriTech</text>

  <!-- ── ACTORS ── -->
  <!-- Agriculteur -->
  <ellipse cx="80" cy="340" rx="32" ry="32" fill="${LIGHT}" stroke="${C1}" stroke-width="2.5"/>
  <text x="80" y="343" text-anchor="middle" font-size="26">👨‍🌾</text>
  <line x1="80" y1="372" x2="80" y2="430" stroke="${DARK}" stroke-width="2"/>
  <line x1="50" y1="395" x2="110" y2="395" stroke="${DARK}" stroke-width="2"/>
  <line x1="80" y1="430" x2="55" y2="470" stroke="${DARK}" stroke-width="2"/>
  <line x1="80" y1="430" x2="105" y2="470" stroke="${DARK}" stroke-width="2"/>
  <text x="80" y="495" text-anchor="middle" fill="${C2}" font-size="14" font-weight="700">Agriculteur</text>

  <!-- Gestionnaire -->
  <ellipse cx="80" cy="600" rx="32" ry="32" fill="#fff7ed" stroke="#f97316" stroke-width="2.5"/>
  <text x="80" y="603" text-anchor="middle" font-size="26">👨‍💼</text>
  <line x1="80" y1="632" x2="80" y2="690" stroke="${DARK}" stroke-width="2"/>
  <line x1="50" y1="655" x2="110" y2="655" stroke="${DARK}" stroke-width="2"/>
  <line x1="80" y1="690" x2="55" y2="730" stroke="${DARK}" stroke-width="2"/>
  <line x1="80" y1="690" x2="105" y2="730" stroke="${DARK}" stroke-width="2"/>
  <text x="80" y="755" text-anchor="middle" fill="#ea580c" font-size="14" font-weight="700">Gestionnaire</text>

  <!-- Admin -->
  <ellipse cx="1320" cy="340" rx="32" ry="32" fill="#fef2f2" stroke="#dc2626" stroke-width="2.5"/>
  <text x="1320" y="343" text-anchor="middle" font-size="26">🛡️</text>
  <line x1="1320" y1="372" x2="1320" y2="430" stroke="${DARK}" stroke-width="2"/>
  <line x1="1290" y1="395" x2="1350" y2="395" stroke="${DARK}" stroke-width="2"/>
  <line x1="1320" y1="430" x2="1295" y2="470" stroke="${DARK}" stroke-width="2"/>
  <line x1="1320" y1="430" x2="1345" y2="470" stroke="${DARK}" stroke-width="2"/>
  <text x="1320" y="495" text-anchor="middle" fill="#dc2626" font-size="14" font-weight="700">Administrateur</text>

  <!-- Fournisseur -->
  <ellipse cx="1320" cy="600" rx="32" ry="32" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5"/>
  <text x="1320" y="603" text-anchor="middle" font-size="26">🏪</text>
  <line x1="1320" y1="632" x2="1320" y2="690" stroke="${DARK}" stroke-width="2"/>
  <line x1="1290" y1="655" x2="1350" y2="655" stroke="${DARK}" stroke-width="2"/>
  <line x1="1320" y1="690" x2="1295" y2="730" stroke="${DARK}" stroke-width="2"/>
  <line x1="1320" y1="690" x2="1345" y2="730" stroke="${DARK}" stroke-width="2"/>
  <text x="1320" y="755" text-anchor="middle" fill="#16a34a" font-size="14" font-weight="700">Fournisseur</text>

  <!-- ── USE CASES ── -->
  ${[
    // Agriculteur use cases
    ['Gérer ses parcelles', 400, 175],
    ['Consulter météo', 400, 240],
    ['Programmer irrigation', 400, 305],
    ['Suivre capteurs IoT', 400, 370],
    ['Consulter IA advisor', 400, 435],
    ['Gérer calendrier culture', 400, 500],
    ['Ouvrir ticket support', 400, 565],
    ['Gérer son compte', 400, 630],
    // Admin use cases
    ['Gérer utilisateurs', 930, 200],
    ['Suspendre / Bloquer', 930, 265],
    ['Supprimer comptes', 930, 330],
    ['Répondre aux tickets', 930, 395],
    ['Voir statistiques', 930, 460],
    // Fournisseur use cases
    ['Consulter catalogue', 930, 570],
    ['Contacter agriculteurs', 930, 635],
    // Shared
    ["S'authentifier", 700, 175],
    ['Choisir abonnement', 700, 280],
    ['Mode sombre / langue', 700, 385],
    ['Notifications temps réel', 700, 490],
    ['Voir carte interactive', 700, 595],
    ['Gérer matériels IoT', 700, 700],
  ].map(([label, cx, cy]) => `
    <ellipse cx="${cx}" cy="${cy}" rx="145" ry="24" fill="white" stroke="${C1}" stroke-width="1.8" filter="url(#sh)"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="500">${label}</text>
  `).join('')}

  <!-- ── LINES: Agriculteur ── -->
  ${[175, 240, 305, 370, 435, 500, 565, 630].map(y => `
    <line x1="112" y1="${Math.min(Math.max(y, 372), 470)}" x2="255" y2="${y}" stroke="${C1}" stroke-width="1.5" marker-end="url(#arrC)"/>
  `).join('')}

  <!-- ── LINES: Gestionnaire ── -->
  <line x1="112" y1="655" x2="255" y2="500" stroke="#f97316" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="112" y1="655" x2="255" y2="565" stroke="#f97316" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="112" y1="655" x2="555" y2="385" stroke="#f97316" stroke-width="1.5" marker-end="url(#arr)"/>

  <!-- ── LINES: Admin ── -->
  ${[200, 265, 330, 395, 460].map(y => `
    <line x1="1288" y1="${Math.min(Math.max(y, 372), 470)}" x2="1075" y2="${y}" stroke="#dc2626" stroke-width="1.5" marker-end="url(#arrR)"/>
  `).join('')}

  <!-- ── LINES: Fournisseur ── -->
  ${[570, 635].map(y => `
    <line x1="1288" y1="655" x2="1075" y2="${y}" stroke="#16a34a" stroke-width="1.5" marker-end="url(#arrG)"/>
  `).join('')}

  <!-- ── SHARED AUTH ── -->
  <line x1="555" y1="175" x2="630" y2="175" stroke="${GRAY}" stroke-width="1.2" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="590" y="165" text-anchor="middle" fill="${GRAY}" font-size="10">«include»</text>

  <!-- LEGEND -->
  <rect x="280" y="820" width="840" height="50" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="310" y1="845" x2="360" y2="845" stroke="${C1}" stroke-width="2" marker-end="url(#arrC)"/>
  <text x="380" y="849" fill="${DARK}" font-size="12">Agriculteur</text>
  <line x1="460" y1="845" x2="510" y2="845" stroke="#f97316" stroke-width="2" marker-end="url(#arr)"/>
  <text x="530" y="849" fill="${DARK}" font-size="12">Gestionnaire</text>
  <line x1="630" y1="845" x2="680" y2="845" stroke="#dc2626" stroke-width="2" marker-end="url(#arrR)"/>
  <text x="700" y="849" fill="${DARK}" font-size="12">Admin</text>
  <line x1="760" y1="845" x2="810" y2="845" stroke="#16a34a" stroke-width="2" marker-end="url(#arrG)"/>
  <text x="830" y="849" fill="${DARK}" font-size="12">Fournisseur</text>
  <line x1="940" y1="845" x2="990" y2="845" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="1010" y="849" fill="${GRAY}" font-size="12">«include»</text>
</svg>`;

toPng(usecase, '02_cas_utilisation.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SCHÉMA BASE DE DONNÉES
// ═══════════════════════════════════════════════════════════════════════════════
const db = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" font-family="Consolas, monospace">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="glow">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${C1}" flood-opacity="0.4"/>
    </filter>
    <marker id="fk" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${C3}"/>
    </marker>
  </defs>

  <rect width="1600" height="1000" fill="url(#bg)"/>
  <rect width="1600" height="75" fill="url(#hdr)"/>
  <text x="800" y="32" text-anchor="middle" fill="white" font-size="24" font-weight="700" font-family="Segoe UI, sans-serif">Schéma Base de Données — CalisteAgriTech (Supabase PostgreSQL)</text>
  <text x="800" y="58" text-anchor="middle" fill="#a5f3fc" font-size="14" font-family="Segoe UI, sans-serif">8 tables · Row Level Security · UUID primary keys · Triggers automatiques</text>

  <!-- Helper function for table -->
  <!-- TABLE: profiles -->
  <g transform="translate(40, 100)">
    <rect width="260" height="290" rx="10" fill="#1e3a5f" stroke="${C1}" stroke-width="2" filter="url(#glow)"/>
    <rect width="260" height="40" rx="10" fill="${C1}"/>
    <rect y="30" width="260" height="10" fill="${C1}"/>
    <text x="130" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">profiles</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['📧 email', 'TEXT UNIQUE'],
      ['👤 full_name', 'TEXT'],
      ['🏷️ role', "'agriculteur'|'gestionnaire'|'fournisseur'"],
      ['📊 status', "'active'|'suspended'|'deleted'"],
      ['📅 blocked_until', 'TIMESTAMPTZ'],
      ['🌾 farm_size', 'DECIMAL'],
      ['🌿 primary_crop', 'TEXT'],
      ['📍 city', 'TEXT'],
      ['🕐 created_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 25}" width="260" height="25" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${57 + i * 25}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="250" y="${57 + i * 25}" text-anchor="end" fill="#64748b" font-size="10">${type.length > 20 ? type.substring(0,20)+'…' : type}</text>
    `).join('')}
  </g>

  <!-- TABLE: parcelles -->
  <g transform="translate(340, 100)">
    <rect width="260" height="235" rx="10" fill="#1e3a5f" stroke="${C2}" stroke-width="2"/>
    <rect width="260" height="40" rx="10" fill="${C2}"/>
    <rect y="30" width="260" height="10" fill="${C2}"/>
    <text x="130" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">parcelles</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['👤 user_id', 'UUID FK→profiles'],
      ['📝 nom', 'TEXT'],
      ['🌿 culture', 'TEXT'],
      ['📐 surface', 'DECIMAL(ha)'],
      ['📍 latitude', 'DECIMAL'],
      ['📍 longitude', 'DECIMAL'],
      ['📊 statut', "TEXT"],
      ['🕐 created_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 22}" width="260" height="22" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${56 + i * 22}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="250" y="${56 + i * 22}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- TABLE: sensor_data -->
  <g transform="translate(640, 100)">
    <rect width="260" height="220" rx="10" fill="#1e3a5f" stroke="#7c3aed" stroke-width="2"/>
    <rect width="260" height="40" rx="10" fill="#7c3aed"/>
    <rect y="30" width="260" height="10" fill="#7c3aed"/>
    <text x="130" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">sensor_data</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['🌾 parcelle_id', 'UUID FK→parcelles'],
      ['💧 moisture', 'DECIMAL(0-100%)'],
      ['🌡️ temperature', 'DECIMAL(°C)'],
      ['☀️ light_intensity', 'DECIMAL'],
      ['🔋 battery_level', 'DECIMAL'],
      ['📡 sensor_type', 'TEXT'],
      ['🕐 recorded_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 22}" width="260" height="22" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${56 + i * 22}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="250" y="${56 + i * 22}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- TABLE: calendrier_culture -->
  <g transform="translate(940, 100)">
    <rect width="260" height="220" rx="10" fill="#1e3a5f" stroke="#d97706" stroke-width="2"/>
    <rect width="260" height="40" rx="10" fill="#d97706"/>
    <rect y="30" width="260" height="10" fill="#d97706"/>
    <text x="130" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">calendrier_culture</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['👤 user_id', 'UUID FK→profiles'],
      ['🌾 parcelle_id', 'UUID FK→parcelles'],
      ['📝 titre', 'TEXT'],
      ['📄 description', 'TEXT'],
      ['📅 date_debut', 'DATE'],
      ['📅 date_fin', 'DATE'],
      ['🏷️ type_activite', 'TEXT'],
      ['🕐 created_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 22}" width="260" height="22" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${56 + i * 22}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="250" y="${56 + i * 22}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- TABLE: support_tickets -->
  <g transform="translate(1240, 100)">
    <rect width="320" height="265" rx="10" fill="#1e3a5f" stroke="#dc2626" stroke-width="2"/>
    <rect width="320" height="40" rx="10" fill="#dc2626"/>
    <rect y="30" width="320" height="10" fill="#dc2626"/>
    <text x="160" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">support_tickets</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['👤 user_id', 'UUID FK→profiles'],
      ['📝 subject', 'TEXT'],
      ['💬 message', 'TEXT'],
      ['📊 status', "'open'|'resolved'|…"],
      ['⚡ priority', "'low'|'medium'|'high'"],
      ['💬 admin_reply', 'TEXT'],
      ['📅 replied_at', 'TIMESTAMPTZ'],
      ['🕐 created_at', 'TIMESTAMPTZ'],
      ['🔄 updated_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 22}" width="320" height="22" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${56 + i * 22}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="310" y="${56 + i * 22}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- TABLE: notification_settings -->
  <g transform="translate(40, 520)">
    <rect width="300" height="240" rx="10" fill="#1e3a5f" stroke="#0891b2" stroke-width="2"/>
    <rect width="300" height="40" rx="10" fill="#0891b2"/>
    <rect y="30" width="300" height="10" fill="#0891b2"/>
    <text x="150" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">notification_settings</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['👤 user_id', 'UUID FK UNIQUE'],
      ['📧 email_alerts', 'BOOLEAN'],
      ['📱 push_moisture_alerts', 'BOOLEAN'],
      ['💧 critical_moisture_threshold', 'DECIMAL'],
      ['🌡️ critical_temp_high', 'DECIMAL'],
      ['🌡️ critical_temp_low', 'DECIMAL'],
      ['🕐 created_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 25}" width="300" height="25" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${57 + i * 25}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="290" y="${57 + i * 25}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- TABLE: ai_activity_log -->
  <g transform="translate(380, 520)">
    <rect width="280" height="175" rx="10" fill="#1e3a5f" stroke="#a855f7" stroke-width="2"/>
    <rect width="280" height="40" rx="10" fill="#a855f7"/>
    <rect y="30" width="280" height="10" fill="#a855f7"/>
    <text x="140" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">ai_activity_log</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['👤 user_id', 'UUID FK→profiles'],
      ['🤖 action_type', 'TEXT'],
      ['📝 details', 'TEXT'],
      ['🕐 created_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 27}" width="280" height="27" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${58 + i * 27}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="270" y="${58 + i * 27}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- TABLE: user_settings -->
  <g transform="translate(700, 520)">
    <rect width="280" height="200" rx="10" fill="#1e3a5f" stroke="#16a34a" stroke-width="2"/>
    <rect width="280" height="40" rx="10" fill="#16a34a"/>
    <rect y="30" width="280" height="10" fill="#16a34a"/>
    <text x="140" y="27" text-anchor="middle" fill="white" font-size="15" font-weight="700">user_settings</text>
    ${[
      ['🔑 id', 'UUID PK'],
      ['👤 user_id', 'UUID FK UNIQUE'],
      ['🌍 language', "TEXT DEFAULT 'fr'"],
      ['🎨 theme', "TEXT DEFAULT 'light'"],
      ['📱 plan_id', "TEXT DEFAULT 'free'"],
      ['🕐 created_at', 'TIMESTAMPTZ'],
    ].map(([col, type], i) => `
      <rect x="0" y="${40 + i * 27}" width="280" height="27" fill="${i % 2 === 0 ? '#1a3050' : '#1e3a5f'}"/>
      <text x="10" y="${58 + i * 27}" fill="#e2e8f0" font-size="11">${col}</text>
      <text x="270" y="${58 + i * 27}" text-anchor="end" fill="#64748b" font-size="10">${type}</text>
    `).join('')}
  </g>

  <!-- FK RELATIONS -->
  <!-- profiles → parcelles -->
  <line x1="300" y1="200" x2="340" y2="200" stroke="${C3}" stroke-width="2" marker-end="url(#fk)"/>
  <!-- parcelles → sensor_data -->
  <line x1="600" y1="200" x2="640" y2="200" stroke="${C3}" stroke-width="2" marker-end="url(#fk)"/>
  <!-- profiles → sensor_data (via parcelle) already shown -->
  <!-- profiles → calendrier -->
  <line x1="300" y1="240" x2="600" y2="150" stroke="${C3}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#fk)"/>
  <!-- profiles → support_tickets -->
  <line x1="300" y1="270" x2="1240" y2="200" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#fk)"/>
  <!-- profiles → notification_settings -->
  <line x1="150" y1="390" x2="150" y2="520" stroke="${C1}" stroke-width="2" marker-end="url(#fk)"/>
  <!-- profiles → ai_activity_log -->
  <line x1="220" y1="390" x2="430" y2="520" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#fk)"/>
  <!-- profiles → user_settings -->
  <line x1="260" y1="390" x2="720" y2="520" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#fk)"/>

  <!-- RLS BADGE -->
  <rect x="40" y="850" width="900" height="50" rx="12" fill="#1e3a5f" stroke="${C1}" stroke-width="1.5"/>
  <text x="50" y="872" fill="${C3}" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">🔒 Row Level Security (RLS)</text>
  <text x="50" y="892" fill="#94a3b8" font-size="12" font-family="Segoe UI, sans-serif">Toutes les tables ont RLS activé · Chaque utilisateur ne voit que ses propres données · Policies basées sur auth.uid()</text>

  <!-- TRIGGER BADGE -->
  <rect x="980" y="850" width="580" height="50" rx="12" fill="#1e3a5f" stroke="#d97706" stroke-width="1.5"/>
  <text x="990" y="872" fill="#fbbf24" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">⚡ Triggers automatiques</text>
  <text x="990" y="892" fill="#94a3b8" font-size="12" font-family="Segoe UI, sans-serif">handle_new_user() → crée profil + paramètres à l'inscription</text>

  <!-- FK LEGEND -->
  <line x1="980" y1="810" x2="1020" y2="810" stroke="${C3}" stroke-width="2" marker-end="url(#fk)"/>
  <text x="1030" y="815" fill="#94a3b8" font-size="12" font-family="Segoe UI, sans-serif">Clé étrangère (FK)</text>
  <line x1="1180" y1="810" x2="1220" y2="810" stroke="${C3}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#fk)"/>
  <text x="1230" y="815" fill="#94a3b8" font-size="12" font-family="Segoe UI, sans-serif">Relation indirecte</text>
</svg>`;

toPng(db, '03_schema_base_donnees.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FLUX NAVIGATION / USER FLOW
// ═══════════════════════════════════════════════════════════════════════════════
const flow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 820" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh">
      <feDropShadow dx="0" dy="3" stdDeviation="8" flood-color="${C1}" flood-opacity="0.15"/>
    </filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="${C1}"/>
    </marker>
    <marker id="arrR" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626"/>
    </marker>
    <marker id="arrG" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a34a"/>
    </marker>
  </defs>

  <rect width="1400" height="820" fill="url(#bg)"/>
  <rect width="1400" height="75" fill="url(#hdr)"/>
  <text x="700" y="32" text-anchor="middle" fill="white" font-size="24" font-weight="700">Flux de Navigation — CalisteAgriTech</text>
  <text x="700" y="58" text-anchor="middle" fill="#a5f3fc" font-size="15">Parcours utilisateur de l'accueil au tableau de bord</text>

  <!-- ── ROW 1: LANDING ── -->
  <!-- START -->
  <circle cx="100" cy="165" r="35" fill="${C1}" filter="url(#sh)"/>
  <text x="100" y="159" text-anchor="middle" fill="white" font-size="22">🌐</text>
  <text x="100" y="176" text-anchor="middle" fill="white" font-size="10" font-weight="600">DÉBUT</text>

  <!-- Landing Page -->
  <rect x="170" y="130" width="200" height="70" rx="14" fill="white" stroke="${C1}" stroke-width="2.5" filter="url(#sh)"/>
  <text x="270" y="158" text-anchor="middle" fill="${C1}" font-size="22">🏠</text>
  <text x="270" y="180" text-anchor="middle" fill="${DARK}" font-size="13" font-weight="600">Landing Page</text>

  <!-- Auth Modal -->
  <rect x="420" y="130" width="200" height="70" rx="14" fill="white" stroke="${C2}" stroke-width="2" filter="url(#sh)"/>
  <text x="520" y="158" text-anchor="middle" fill="${C2}" font-size="22">🔐</text>
  <text x="520" y="180" text-anchor="middle" fill="${DARK}" font-size="13" font-weight="600">Auth Modal</text>

  <!-- Decision: Compte suspendu? -->
  <polygon points="720,130 820,165 720,200 620,165" fill="#fff7ed" stroke="#f97316" stroke-width="2" filter="url(#sh)"/>
  <text x="720" y="160" text-anchor="middle" fill="#ea580c" font-size="11" font-weight="600">Compte</text>
  <text x="720" y="175" text-anchor="middle" fill="#ea580c" font-size="11" font-weight="600">actif ?</text>

  <!-- Suspended screen -->
  <rect x="860" y="120" width="180" height="60" rx="12" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <text x="950" y="145" text-anchor="middle" fill="#ea580c" font-size="20">⏸️</text>
  <text x="950" y="168" text-anchor="middle" fill="#9a3412" font-size="12" font-weight="600">Suspendu</text>

  <!-- Deleted screen -->
  <rect x="860" y="195" width="180" height="60" rx="12" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
  <text x="950" y="220" text-anchor="middle" fill="#dc2626" font-size="20">🚫</text>
  <text x="950" y="243" text-anchor="middle" fill="#991b1b" font-size="12" font-weight="600">Supprimé</text>

  <!-- Dashboard -->
  <rect x="1080" y="130" width="220" height="70" rx="14" fill="white" stroke="${B1}" stroke-width="2.5" filter="url(#sh)"/>
  <text x="1190" y="158" text-anchor="middle" fill="${B1}" font-size="22">📊</text>
  <text x="1190" y="180" text-anchor="middle" fill="${DARK}" font-size="13" font-weight="600">Dashboard</text>

  <!-- ── ARROWS ROW 1 ── -->
  <line x1="135" y1="165" x2="170" y2="165" stroke="${C1}" stroke-width="2.5" marker-end="url(#arr)"/>
  <line x1="370" y1="165" x2="420" y2="165" stroke="${C1}" stroke-width="2.5" marker-end="url(#arr)"/>
  <line x1="620" y1="165" x2="620" y2="165" stroke="${C1}" stroke-width="2.5" marker-end="url(#arr)"/>
  <line x1="620" y1="165" x2="820" y2="165" stroke="${C1}" stroke-width="2.5" marker-end="url(#arr)"/>
  <text x="720" y="120" text-anchor="middle" fill="${C1}" font-size="11">Sign in / Register</text>
  <!-- Suspended -->
  <line x1="820" y1="155" x2="860" y2="145" stroke="#f97316" stroke-width="1.8" marker-end="url(#arr)"/>
  <text x="840" y="140" fill="#ea580c" font-size="10">Non (suspendu)</text>
  <!-- Deleted -->
  <line x1="820" y1="175" x2="860" y2="220" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arrR)"/>
  <text x="835" y="215" fill="#dc2626" font-size="10">Non (supprimé)</text>
  <!-- OK -->
  <line x1="820" y1="165" x2="1080" y2="165" stroke="#16a34a" stroke-width="2.5" marker-end="url(#arr)"/>
  <text x="950" y="155" fill="#16a34a" font-size="11">Oui</text>

  <!-- ── ROW 2: DASHBOARD TABS ── -->
  <text x="700" y="290" text-anchor="middle" fill="${GRAY}" font-size="14" font-weight="600">ONGLETS DU TABLEAU DE BORD</text>

  ${[
    ['📈 Vue globale', 80, 330, C1, '#ecfeff'],
    ['🌿 Parcelles', 260, 330, C2, '#ecfeff'],
    ['💧 Irrigation', 440, 330, '#0369a1', '#eff6ff'],
    ['📡 Matériels IoT', 620, 330, '#7c3aed', '#fdf4ff'],
    ['🗺️ Carte', 800, 330, '#16a34a', '#f0fdf4'],
    ['⛅ Météo', 980, 330, '#0891b2', '#ecfeff'],
    ['🤖 IA Advisor', 1160, 330, '#7c3aed', '#fdf4ff'],
    ['🏪 Fournisseur', 1340, 330, '#d97706', '#fffbeb'],
  ].map(([label, x, y, stroke, bg]) => `
    <rect x="${x - 90}" y="${y}" width="180" height="55" rx="12" fill="${bg}" stroke="${stroke}" stroke-width="2" filter="url(#sh)"/>
    <text x="${x}" y="${y + 26}" text-anchor="middle" fill="${stroke}" font-size="19">${label.split(' ')[0]}</text>
    <text x="${x}" y="${y + 46}" text-anchor="middle" fill="${DARK}" font-size="11" font-weight="600">${label.split(' ').slice(1).join(' ')}</text>
  `).join('')}

  <!-- Arrow from Dashboard to Tabs -->
  <line x1="1190" y1="200" x2="700" y2="320" stroke="${B1}" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arr)"/>

  <!-- ── ROW 3: SUB-FEATURES ── -->
  <text x="700" y="430" text-anchor="middle" fill="${GRAY}" font-size="14" font-weight="600">FONCTIONNALITÉS DÉTAILLÉES</text>

  ${[
    // Overview
    ['KPIs temps réel', 80, 460],
    ['Alertes critiques', 80, 510],
    // Parcelles
    ['Liste + Carte', 260, 460],
    ['Détail parcelle', 260, 510],
    ['Historique sensors', 260, 560],
    // Irrigation
    ['Planning auto', 440, 460],
    ['Seuils alertes', 440, 510],
    // IoT
    ['Capteurs connectés', 620, 460],
    ['Données live', 620, 510],
    // Carte
    ['Leaflet map', 800, 460],
    ['Toutes parcelles', 800, 510],
    // Météo
    ['Open-Meteo API', 980, 460],
    ['7 jours forecast', 980, 510],
    // IA
    ['Diagnostic Gemini', 1160, 460],
    ['Recommandations', 1160, 510],
    // Fournisseur
    ['Catalogue produits', 1340, 460],
    ['Contact direct', 1340, 510],
  ].map(([label, x, y]) => `
    <rect x="${x - 85}" y="${y - 14}" width="170" height="28" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="${x}" y="${y + 5}" text-anchor="middle" fill="${DARK}" font-size="11">${label}</text>
  `).join('')}

  <!-- ── ROW 4: PLAN LOCK ── -->
  <rect x="330" y="630" width="740" height="80" rx="16" fill="#fdf4ff" stroke="#a855f7" stroke-width="2" filter="url(#sh)"/>
  <text x="700" y="660" text-anchor="middle" fill="#7c3aed" font-size="16" font-weight="700">🔒 Système d'Abonnement</text>
  <text x="700" y="685" text-anchor="middle" fill="${DARK}" font-size="13">Plan Gratuit → Accès limité · Plan Pro → Irrigation avancée, IoT, Carte</text>
  <text x="700" y="703" text-anchor="middle" fill="${GRAY}" font-size="12">LockedFeature component · Redirect vers PlansPage</text>

  <!-- ── ADMIN PATH ── -->
  <rect x="40" y="630" width="220" height="80" rx="14" fill="#fef2f2" stroke="#dc2626" stroke-width="2" filter="url(#sh)"/>
  <text x="150" y="658" text-anchor="middle" fill="#dc2626" font-size="16" font-weight="700">🛡️ Admin Panel</text>
  <text x="150" y="680" text-anchor="middle" fill="${DARK}" font-size="12">Bouton flottant</text>
  <text x="150" y="698" text-anchor="middle" fill="${GRAY}" font-size="11">si ADMIN_EMAILS</text>

  <!-- Admin arrow -->
  <line x1="1190" y1="200" x2="150" y2="630" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,3" marker-end="url(#arrR)"/>
  <text x="600" y="450" fill="#dc2626" font-size="11" transform="rotate(-18, 600, 450)">Admin uniquement</text>

  <!-- LOGOUT -->
  <rect x="1130" y="630" width="230" height="80" rx="14" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
  <text x="1245" y="658" text-anchor="middle" fill="#16a34a" font-size="16" font-weight="700">🚪 Déconnexion</text>
  <text x="1245" y="680" text-anchor="middle" fill="${DARK}" font-size="12">signOut()</text>
  <text x="1245" y="698" text-anchor="middle" fill="${GRAY}" font-size="11">→ Landing Page</text>
  <line x1="1245" y1="630" x2="270" y2="200" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrG)"/>
</svg>`;

toPng(flow, '04_flux_navigation.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CARTE DES FONCTIONNALITÉS
// ═══════════════════════════════════════════════════════════════════════════════
const features = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${C1}" flood-opacity="0.15"/></filter>
  </defs>

  <rect width="1400" height="900" fill="url(#bg)"/>
  <rect width="1400" height="80" fill="url(#hdr)"/>
  <text x="700" y="34" text-anchor="middle" fill="white" font-size="26" font-weight="700">Carte des Fonctionnalités — CalisteAgriTech</text>
  <text x="700" y="60" text-anchor="middle" fill="#a5f3fc" font-size="15">Vue complète de toutes les fonctionnalités par module</text>

  <!-- CENTER HUB -->
  <circle cx="700" cy="470" r="80" fill="url(#hdr)" filter="url(#sh)"/>
  <text x="700" y="460" text-anchor="middle" fill="white" font-size="30">🌾</text>
  <text x="700" y="488" text-anchor="middle" fill="white" font-size="15" font-weight="700">Caliste</text>
  <text x="700" y="506" text-anchor="middle" fill="#a5f3fc" font-size="12">AgriTech</text>

  <!-- MODULES + FEATURES -->
  ${[
    {
      emoji: '📈', label: 'Vue Globale', color: C1, bg: '#ecfeff', cx: 200, cy: 200,
      items: ['KPIs temps réel', 'Alertes capteurs', 'Parcelles récentes', 'Raccourcis rapides']
    },
    {
      emoji: '🌿', label: 'Parcelles', color: '#16a34a', bg: '#f0fdf4', cx: 700, cy: 180,
      items: ['Liste + filtres', 'Carte leaflet', 'Détail + stats', 'Capteurs IoT', 'Historique données']
    },
    {
      emoji: '⛅', label: 'Météo', color: '#0369a1', bg: '#eff6ff', cx: 1200, cy: 200,
      items: ['Prévisions 7j', 'Open-Meteo API', 'Alertes météo', 'Données agro']
    },
    {
      emoji: '💧', label: 'Irrigation', color: '#0891b2', bg: '#ecfeff', cx: 200, cy: 470,
      items: ['Planification auto', 'Seuils alertes', 'Historique arrosage', 'Économies eau']
    },
    {
      emoji: '🤖', label: 'IA Advisor', color: '#7c3aed', bg: '#fdf4ff', cx: 1200, cy: 470,
      items: ['Gemini AI', 'Diagnostic cultures', 'Recommandations', 'Prédictions', 'Chat intégré']
    },
    {
      emoji: '📡', label: 'Matériels IoT', color: '#d97706', bg: '#fffbeb', cx: 200, cy: 740,
      items: ['Capteurs connectés', 'Données live', 'Alertes batterie', 'Config capteurs']
    },
    {
      emoji: '🏪', label: 'Fournisseur', color: '#16a34a', bg: '#f0fdf4', cx: 700, cy: 760,
      items: ['Catalogue produits', 'Engrais & semences', 'Contact direct', 'Offres spéciales']
    },
    {
      emoji: '🛡️', label: 'Admin Panel', color: '#dc2626', bg: '#fef2f2', cx: 1200, cy: 740,
      items: ['Gestion users', 'Suspension / Blocage', 'Tickets support', 'Statistiques']
    },
  ].map(({ emoji, label, color, bg, cx, cy, items }) => {
    const w = 210; const h = 40 + items.length * 26 + 20;
    const rx = cx - w / 2; const ry = cy - h / 2;
    // Line from center to module
    const dx = cx - 700; const dy = cy - 470;
    const len = Math.sqrt(dx*dx + dy*dy);
    const nx = dx/len; const ny = dy/len;
    const x1 = 700 + nx*80; const y1 = 470 + ny*80;
    const mod = 0.85;
    const x2 = 700 + dx*mod; const y2 = 470 + dy*mod;
    return `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-dasharray="6,3" opacity="0.6"/>
      <rect x="${rx}" y="${ry}" width="${w}" height="${h}" rx="14" fill="${bg}" stroke="${color}" stroke-width="2" filter="url(#sh)"/>
      <rect x="${rx}" y="${ry}" width="${w}" height="40" rx="14" fill="${color}"/>
      <rect x="${rx}" y="${ry + 26}" width="${w}" height="14" fill="${color}"/>
      <text x="${cx}" y="${ry + 26}" text-anchor="middle" fill="white" font-size="15" font-weight="700">${emoji} ${label}</text>
      ${items.map((item, i) => `
        <text x="${cx}" y="${ry + 58 + i * 26}" text-anchor="middle" fill="${DARK}" font-size="12">• ${item}</text>
      `).join('')}
    `;
  }).join('')}
</svg>`;

toPng(features, '05_carte_fonctionnalites.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PLANS D'ABONNEMENT
// ═══════════════════════════════════════════════════════════════════════════════
const plans = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="${C1}" flood-opacity="0.2"/></filter>
    <filter id="shPro"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="${C1}" flood-opacity="0.35"/></filter>
  </defs>

  <rect width="1200" height="700" fill="url(#bg)"/>
  <rect width="1200" height="75" fill="url(#hdr)"/>
  <text x="600" y="32" text-anchor="middle" fill="white" font-size="24" font-weight="700">Plans d'Abonnement — CalisteAgriTech</text>
  <text x="600" y="58" text-anchor="middle" fill="#a5f3fc" font-size="15">Choisissez le plan adapté à votre exploitation agricole</text>

  <!-- PLAN GRATUIT -->
  <rect x="80" y="100" width="320" height="540" rx="20" fill="white" stroke="#e2e8f0" stroke-width="2" filter="url(#sh)"/>
  <text x="240" y="155" text-anchor="middle" fill="${GRAY}" font-size="16" font-weight="600">🌱 Plan Gratuit</text>
  <text x="240" y="210" text-anchor="middle" fill="${DARK}" font-size="44" font-weight="800">0<tspan font-size="20" baseline-shift="super">FCFA</tspan></text>
  <text x="240" y="235" text-anchor="middle" fill="${GRAY}" font-size="13">/mois · Pour démarrer</text>
  <line x1="110" y1="255" x2="370" y2="255" stroke="#f1f5f9" stroke-width="1.5"/>
  ${[
    ['✅', '3 parcelles maximum'],
    ['✅', 'Vue globale (Overview)'],
    ['✅', 'Météo basique'],
    ['✅', 'Calendrier cultures'],
    ['✅', 'Support standard'],
    ['✅', 'IA Advisor (limité)'],
    ['❌', 'Irrigation avancée'],
    ['❌', 'Carte interactive'],
    ['❌', 'Matériels IoT'],
    ['❌', 'Rapports avancés'],
    ['❌', 'Support prioritaire'],
  ].map(([icon, label], i) => `
    <text x="125" y="${285 + i * 36}" fill="${icon === '❌' ? '#94a3b8' : DARK}" font-size="13">${icon} ${label}</text>
  `).join('')}
  <rect x="110" y="590" width="220" height="36" rx="10" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="220" y="613" text-anchor="middle" fill="${GRAY}" font-size="13" font-weight="600">Plan actuel</text>

  <!-- PLAN PRO -->
  <rect x="440" y="85" width="340" height="570" rx="20" fill="url(#proGrad)" filter="url(#shPro)"/>
  <!-- Badge RECOMMANDÉ -->
  <rect x="530" y="72" width="160" height="30" rx="15" fill="#fbbf24"/>
  <text x="610" y="91" text-anchor="middle" fill="#92400e" font-size="13" font-weight="700">⭐ RECOMMANDÉ</text>
  <text x="610" y="140" text-anchor="middle" fill="white" font-size="18" font-weight="700">🚀 Plan Pro</text>
  <text x="610" y="200" text-anchor="middle" fill="white" font-size="48" font-weight="800">5000<tspan font-size="20" baseline-shift="super">FCFA</tspan></text>
  <text x="610" y="228" text-anchor="middle" fill="#a5f3fc" font-size="13">/mois · Tout inclus</text>
  <line x1="470" y1="248" x2="750" y2="248" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  ${[
    ['✅', 'Parcelles illimitées'],
    ['✅', 'Toutes fonctionnalités Free'],
    ['✅', 'Irrigation avancée'],
    ['✅', 'Carte interactive (Leaflet)'],
    ['✅', 'Matériels IoT complets'],
    ['✅', 'IA Advisor illimité'],
    ['✅', 'Rapports & exports'],
    ['✅', 'Notifications temps réel'],
    ['✅', 'Support prioritaire 24h'],
    ['✅', 'Accès fournisseurs'],
    ['✅', 'Historique 12 mois'],
  ].map(([icon, label], i) => `
    <text x="475" y="${278 + i * 36}" fill="white" font-size="13">${icon} ${label}</text>
  `).join('')}
  <rect x="475" y="588" width="270" height="40" rx="12" fill="white"/>
  <text x="610" y="613" text-anchor="middle" fill="${C2}" font-size="14" font-weight="700">Passer au Pro →</text>

  <!-- PLAN ENTREPRISE -->
  <rect x="820" y="100" width="300" height="540" rx="20" fill="white" stroke="#a855f7" stroke-width="2" filter="url(#sh)"/>
  <text x="970" y="155" text-anchor="middle" fill="#7c3aed" font-size="16" font-weight="600">🏢 Entreprise</text>
  <text x="970" y="200" text-anchor="middle" fill="${DARK}" font-size="36" font-weight="800">Sur devis</text>
  <text x="970" y="228" text-anchor="middle" fill="${GRAY}" font-size="13">/mois · Multi-exploitation</text>
  <line x1="850" y1="248" x2="1090" y2="248" stroke="#f1f5f9" stroke-width="1.5"/>
  ${[
    ['✅', 'Tout du Plan Pro'],
    ['✅', 'Multi-utilisateurs'],
    ['✅', 'API dédiée'],
    ['✅', 'Intégration ERP'],
    ['✅', 'Tableau de bord custom'],
    ['✅', 'Formation sur site'],
    ['✅', 'SLA 99.9%'],
    ['✅', 'Data export avancé'],
    ['✅', 'Compte gestionnaire'],
    ['✅', 'Support dédié 24/7'],
    ['✅', 'Onboarding personnalisé'],
  ].map(([icon, label], i) => `
    <text x="855" y="${278 + i * 36}" fill="${DARK}" font-size="13">${icon} ${label}</text>
  `).join('')}
  <rect x="855" y="590" width="230" height="36" rx="10" fill="#fdf4ff" stroke="#a855f7" stroke-width="1.5"/>
  <text x="970" y="613" text-anchor="middle" fill="#7c3aed" font-size="13" font-weight="600">Nous contacter →</text>
</svg>`;

toPng(plans, '06_plans_abonnement.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 7. MAQUETTE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const dashboard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="sidebar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c4a6e"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="hdrMain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="card1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C1}"/>
      <stop offset="100%" stop-color="${C2}"/>
    </linearGradient>
    <linearGradient id="card2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="card3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="card4" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.08"/></filter>
  </defs>

  <!-- Background -->
  <rect width="1400" height="860" fill="url(#bg)"/>

  <!-- TOP BAR -->
  <rect width="1400" height="56" fill="white" filter="url(#sh)"/>
  <rect x="16" y="14" width="28" height="28" rx="8" fill="url(#hdrMain)"/>
  <text x="21" y="33" fill="white" font-size="16">🌾</text>
  <text x="52" y="34" fill="${DARK}" font-size="16" font-weight="700">CalisteAgriTech</text>
  <text x="250" y="34" fill="${C1}" font-size="12" font-weight="600">· Plateforme Smart Farming</text>
  <!-- Search bar -->
  <rect x="500" y="14" width="400" height="28" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
  <text x="516" y="33" fill="${GRAY}" font-size="13">🔍  Rechercher parcelles, capteurs...</text>
  <!-- Right icons -->
  <circle cx="1280" cy="28" r="18" fill="#f1f5f9"/>
  <text x="1272" y="34" font-size="16">🔔</text>
  <circle cx="1340" cy="28" r="20" fill="url(#hdrMain)"/>
  <text x="1332" y="34" font-size="16">👨‍🌾</text>

  <!-- LEFT SIDEBAR -->
  <rect x="0" y="56" width="220" height="804" fill="url(#sidebar)"/>
  <text x="110" y="105" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">NAVIGATION</text>
  ${[
    ['📈', 'Vue globale', true],
    ['🌿', 'Parcelles', false],
    ['💧', 'Irrigation', false],
    ['📡', 'Matériels IoT', false],
    ['🗺️', 'Carte', false],
    ['⛅', 'Météo', false],
    ['🤖', 'IA Advisor', false],
    ['🏪', 'Fournisseur', false],
  ].map(([icon, label, active], i) => `
    <rect x="8" y="${115 + i * 56}" width="204" height="44" rx="10" fill="${active ? 'rgba(8,145,178,0.25)' : 'transparent'}"/>
    ${active ? `<rect x="0" y="${115 + i * 56}" width="4" height="44" rx="2" fill="${C3}"/>` : ''}
    <text x="32" y="${142 + i * 56}" font-size="18">${icon}</text>
    <text x="58" y="${143 + i * 56}" fill="${active ? 'white' : '#94a3b8'}" font-size="13" font-weight="${active ? '600' : '400'}">${label}</text>
  `).join('')}

  <!-- Sidebar bottom -->
  <line x1="8" y1="700" x2="212" y2="700" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ${[
    ['⚙️', 'Paramètres'],
    ['💳', 'Abonnement'],
    ['🆘', 'Support'],
    ['👤', 'Mon compte'],
  ].map(([icon, label], i) => `
    <text x="32" y="${725 + i * 32}" font-size="16">${icon}</text>
    <text x="56" y="${726 + i * 32}" fill="#64748b" font-size="12">${label}</text>
  `).join('')}

  <!-- MAIN CONTENT -->
  <!-- Page title -->
  <text x="245" y="100" fill="${DARK}" font-size="22" font-weight="700">Tableau de bord</text>
  <text x="245" y="122" fill="${GRAY}" font-size="13">Mardi 24 juin 2025 · Bonjour, Agriculteur 👋</text>

  <!-- KPI CARDS -->
  ${[
    ['💧 Humidité moy.', '68%', '↑ +3% aujourd\'hui', 'card1', 245],
    ['🌡️ Température', '29°C', '→ Normale', 'card2', 555],
    ['📡 Capteurs actifs', '12 / 15', '⚠️ 3 hors ligne', 'card3', 865],
    ['🌿 Parcelles', '7', '✅ Toutes surveillées', 'card4', 1175],
  ].map(([title, value, sub, grad, x]) => `
    <rect x="${x}" y="140" width="290" height="110" rx="16" fill="url(#${grad})" filter="url(#sh)"/>
    <text x="${x + 20}" y="173" fill="rgba(255,255,255,0.8)" font-size="13">${title}</text>
    <text x="${x + 20}" y="218" fill="white" font-size="34" font-weight="800">${value}</text>
    <text x="${x + 20}" y="238" fill="rgba(255,255,255,0.7)" font-size="12">${sub}</text>
  `).join('')}

  <!-- CHART AREA: Humidité 7j -->
  <rect x="245" y="275" width="580" height="240" rx="16" fill="white" filter="url(#sh)"/>
  <text x="265" y="305" fill="${DARK}" font-size="15" font-weight="700">💧 Humidité sol — 7 derniers jours</text>
  <text x="265" y="322" fill="${GRAY}" font-size="12">Parcelle Nord · Capteur S-001</text>
  <!-- Chart bars -->
  ${[65, 72, 68, 80, 75, 60, 70].map((h, i) => {
    const barH = h * 1.4; const x = 265 + i * 75; const y = 490 - barH;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return `
      <rect x="${x}" y="${y}" width="50" height="${barH}" rx="6" fill="${h >= 70 ? C1 : h >= 60 ? C3 : '#fbbf24'}"/>
      <text x="${x + 25}" y="${y - 8}" text-anchor="middle" fill="${DARK}" font-size="11" font-weight="600">${h}%</text>
      <text x="${x + 25}" y="508" text-anchor="middle" fill="${GRAY}" font-size="11">${days[i]}</text>
    `;
  }).join('')}
  <!-- Threshold line -->
  <line x1="260" y1="420" x2="790" y2="420" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="795" y="424" fill="#ef4444" font-size="11">Seuil min</text>

  <!-- PARCELLES LIST -->
  <rect x="850" y="275" width="515" height="240" rx="16" fill="white" filter="url(#sh)"/>
  <text x="870" y="305" fill="${DARK}" font-size="15" font-weight="700">🌿 Mes Parcelles</text>
  ${[
    ['Parcelle Nord', 'Tomates', '2.5 ha', '72%', '28°C', C1],
    ['Parcelle Sud', 'Maïs', '1.8 ha', '58%', '30°C', '#16a34a'],
    ['Parcelle Est', 'Manioc', '3.2 ha', '85%', '26°C', '#7c3aed'],
    ['Parcelle Ouest', 'Plantains', '1.1 ha', '45%', '32°C', '#d97706'],
  ].map(([name, crop, size, hum, temp, color], i) => `
    <rect x="860" y="${325 + i * 48}" width="495" height="40" rx="10" fill="${i % 2 === 0 ? '#f8fafc' : 'white'}" stroke="#f1f5f9" stroke-width="1"/>
    <circle cx="880" cy="${345 + i * 48}" r="8" fill="${color}"/>
    <text x="898" y="${350 + i * 48}" fill="${DARK}" font-size="13" font-weight="600">${name}</text>
    <text x="1020" y="${350 + i * 48}" fill="${GRAY}" font-size="12">${crop}</text>
    <text x="1130" y="${350 + i * 48}" fill="${GRAY}" font-size="12">${size}</text>
    <text x="1230" y="${350 + i * 48}" fill="${C1}" font-size="12" font-weight="600">${hum}</text>
    <text x="1300" y="${350 + i * 48}" fill="${GRAY}" font-size="12">${temp}</text>
  `).join('')}

  <!-- METEO WIDGET -->
  <rect x="245" y="540" width="280" height="180" rx="16" fill="url(#hdrMain)" filter="url(#sh)"/>
  <text x="265" y="570" fill="white" font-size="15" font-weight="700">⛅ Météo Aujourd'hui</text>
  <text x="385" y="620" text-anchor="middle" fill="white" font-size="48">☀️</text>
  <text x="385" y="660" text-anchor="middle" fill="white" font-size="32" font-weight="800">32°C</text>
  <text x="385" y="685" text-anchor="middle" fill="#a5f3fc" font-size="13">Ensoleillé · Yaoundé</text>
  <text x="385" y="705" text-anchor="middle" fill="#a5f3fc" font-size="12">Humidité: 65% · Vent: 12km/h</text>

  <!-- AI ADVISOR WIDGET -->
  <rect x="550" y="540" width="275" height="180" rx="16" fill="white" stroke="#a855f7" stroke-width="2" filter="url(#sh)"/>
  <text x="570" y="570" fill="#7c3aed" font-size="15" font-weight="700">🤖 IA Advisor</text>
  <rect x="562" y="583" width="250" height="60" rx="10" fill="#fdf4ff"/>
  <text x="572" y="601" fill="#7c3aed" font-size="12" font-weight="600">💡 Recommandation du jour</text>
  <text x="572" y="619" fill="${DARK}" font-size="11">Arroser la Parcelle Ouest ce soir —</text>
  <text x="572" y="633" fill="${DARK}" font-size="11">humidité sous le seuil critique (45%)</text>
  <rect x="562" y="655" width="250" height="30" rx="8" fill="#7c3aed"/>
  <text x="687" y="675" text-anchor="middle" fill="white" font-size="12" font-weight="600">Ouvrir le diagnostic complet →</text>

  <!-- ALERTS WIDGET -->
  <rect x="850" y="540" width="515" height="180" rx="16" fill="white" filter="url(#sh)"/>
  <text x="870" y="570" fill="${DARK}" font-size="15" font-weight="700">🔔 Alertes récentes</text>
  ${[
    ['⚠️', 'Humidité critique — Parcelle Ouest (45%)', '14:32', '#fef3c7', '#d97706'],
    ['🔴', 'Capteur S-012 hors ligne depuis 2h', '12:15', '#fef2f2', '#dc2626'],
    ['✅', 'Irrigation Parcelle Nord complétée', '09:00', '#f0fdf4', '#16a34a'],
    ['🌡️', 'Température élevée — Parcelle Est (35°C)', '07:45', '#fff7ed', '#f97316'],
  ].map(([icon, msg, time, bg, color], i) => `
    <rect x="860" y="${583 + i * 36}" width="495" height="30" rx="8" fill="${bg}"/>
    <text x="875" y="${603 + i * 36}" font-size="14">${icon}</text>
    <text x="900" y="${603 + i * 36}" fill="${DARK}" font-size="12">${msg}</text>
    <text x="1340" y="${603 + i * 36}" fill="${color}" font-size="11" font-weight="600">${time}</text>
  `).join('')}

  <!-- Caption -->
  <text x="700" y="848" text-anchor="middle" fill="${GRAY}" font-size="12">Maquette — CalisteAgriTech Dashboard · Vue Globale (Overview Tab) · React + Supabase</text>
</svg>`;

toPng(dashboard, '07_maquette_dashboard.png');

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MAQUETTE LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const landing = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="40%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C1}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/>
      <stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="white"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="${C1}" flood-opacity="0.15"/></filter>
  </defs>

  <rect width="1400" height="860" fill="url(#heroBg)"/>

  <!-- NAVBAR -->
  <rect width="1400" height="64" fill="rgba(255,255,255,0.9)"/>
  <rect x="20" y="18" width="30" height="30" rx="8" fill="url(#btn)"/>
  <text x="25" y="38" fill="white" font-size="18">🌾</text>
  <text x="60" y="38" fill="${DARK}" font-size="18" font-weight="800">CalisteAgriTech</text>
  <text x="310" y="38" fill="${GRAY}" font-size="13">· by CherilleTech</text>
  ${[['Accueil', 520], ['Fonctionnalités', 640], ['Tarifs', 790], ['À propos', 910]].map(([label, x]) => `
    <text x="${x}" y="38" fill="${GRAY}" font-size="14">${label}</text>
  `).join('')}
  <rect x="1050" y="16" width="130" height="34" rx="10" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
  <text x="1115" y="38" text-anchor="middle" fill="${DARK}" font-size="13" font-weight="600">Se connecter</text>
  <rect x="1200" y="16" width="180" height="34" rx="10" fill="url(#btn)"/>
  <text x="1290" y="38" text-anchor="middle" fill="white" font-size="13" font-weight="700">Commencer gratuit →</text>

  <!-- HERO SECTION -->
  <!-- Badge -->
  <rect x="90" y="100" width="320" height="34" rx="17" fill="#ecfeff" stroke="${C1}" stroke-width="1.5"/>
  <text x="105" y="122" fill="${C1}" font-size="12">🌊</text>
  <text x="125" y="122" fill="${C2}" font-size="13" font-weight="600">Plateforme Smart Farm · CherilleTech</text>

  <!-- Headline -->
  <text x="90" y="180" fill="${DARK}" font-size="54" font-weight="900">Agriculture</text>
  <text x="90" y="250" fill="${C1}" font-size="54" font-weight="900">Intelligente,</text>
  <text x="90" y="320" fill="${DARK}" font-size="54" font-weight="900">Smart Farming</text>

  <!-- Subtitle -->
  <text x="90" y="370" fill="${GRAY}" font-size="17">Gérez vos parcelles, capteurs IoT et irrigation</text>
  <text x="90" y="395" fill="${GRAY}" font-size="17">avec l'intelligence artificielle · Conçu pour le Cameroun</text>

  <!-- Mini badges -->
  ${[
    ['🌡️', '28°C', 'Temp. sol', 90],
    ['💧', '72%', 'Humidité', 230],
    ['📡', '12', 'Capteurs', 370],
    ['🤖', 'IA', 'En ligne', 510],
  ].map(([icon, val, sub, x]) => `
    <rect x="${x}" y="425" width="125" height="50" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1.5" filter="url(#sh)"/>
    <text x="${x + 16}" y="455" font-size="20">${icon}</text>
    <text x="${x + 44}" y="447" fill="${C1}" font-size="13" font-weight="700">${val}</text>
    <text x="${x + 44}" y="464" fill="${GRAY}" font-size="11">${sub}</text>
  `).join('')}

  <!-- CTA Buttons -->
  <rect x="90" y="500" width="230" height="52" rx="14" fill="url(#btn)" filter="url(#sh)"/>
  <text x="205" y="531" text-anchor="middle" fill="white" font-size="15" font-weight="700">Commencer gratuitement →</text>
  <rect x="340" y="500" width="190" height="52" rx="14" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="400" y="529" fill="${DARK}" font-size="15">▶️</text>
  <text x="435" y="531" fill="${DARK}" font-size="15" font-weight="600">Voir la démo</text>

  <!-- Stars/social proof -->
  <text x="90" y="590" fill="#fbbf24" font-size="16">★★★★★</text>
  <text x="180" y="590" fill="${GRAY}" font-size="13">120+ agriculteurs au Cameroun</text>

  <!-- DASHBOARD MOCKUP (right side) -->
  <rect x="740" y="88" width="610" height="440" rx="20" fill="url(#cardGrad)" stroke="#e2e8f0" stroke-width="2" filter="url(#sh)"/>
  <!-- Mini header of mockup -->
  <rect x="740" y="88" width="610" height="48" rx="20" fill="url(#hdr)"/>
  <rect x="740" y="116" width="610" height="20" fill="url(#hdr)"/>
  <circle cx="764" cy="112" r="8" fill="rgba(255,255,255,0.3)"/>
  <circle cx="790" cy="112" r="8" fill="rgba(255,255,255,0.3)"/>
  <circle cx="816" cy="112" r="8" fill="rgba(255,255,255,0.3)"/>
  <text x="900" y="116" text-anchor="middle" fill="white" font-size="13" font-weight="600">CalisteAgriTech · Dashboard</text>
  <!-- Mini KPIs in mockup -->
  ${[['💧 72%', 760], ['🌡️ 28°C', 890], ['📡 12', 1020], ['🤖 3', 1130]].map(([label, x]) => `
    <rect x="${x}" y="148" width="115" height="50" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <text x="${x + 57}" y="178" text-anchor="middle" fill="${C1}" font-size="16" font-weight="700">${label}</text>
  `).join('')}
  <!-- Mini chart in mockup -->
  <rect x="756" y="215" width="340" height="130" rx="12" fill="white" stroke="#f1f5f9" stroke-width="1"/>
  <text x="776" y="240" fill="${DARK}" font-size="12" font-weight="600">Humidité — 7 jours</text>
  ${[65, 72, 68, 80, 75, 60, 70].map((h, i) => {
    const bh = h * 0.7; const x = 766 + i * 44;
    return `<rect x="${x}" y="${330 - bh}" width="32" height="${bh}" rx="4" fill="${h >= 70 ? C1 : C3}" opacity="0.8"/>`;
  }).join('')}
  <!-- Mini list in mockup -->
  <rect x="1110" y="215" width="220" height="130" rx="12" fill="white" stroke="#f1f5f9" stroke-width="1"/>
  <text x="1128" y="240" fill="${DARK}" font-size="12" font-weight="600">Parcelles actives</text>
  ${[['Parcelle Nord', '72%', C1], ['Parcelle Sud', '58%', '#16a34a'], ['Parcelle Est', '85%', '#7c3aed']].map(([name, pct, color], i) => `
    <circle cx="1125" cy="${263 + i * 30}" r="6" fill="${color}"/>
    <text x="1140" y="${268 + i * 30}" fill="${DARK}" font-size="11">${name}</text>
    <text x="1315" y="${268 + i * 30}" text-anchor="end" fill="${color}" font-size="11" font-weight="700">${pct}</text>
  `).join('')}
  <!-- Floating badges on mockup -->
  <rect x="830" y="365" width="160" height="36" rx="10" fill="white" stroke="${C1}" stroke-width="1.5" filter="url(#sh)"/>
  <text x="845" y="386" font-size="14">💧</text>
  <text x="868" y="388" fill="${DARK}" font-size="12" font-weight="600">Irrigation active</text>
  <rect x="1080" y="365" width="150" height="36" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" filter="url(#sh)"/>
  <text x="1095" y="386" font-size="14">🤖</text>
  <text x="1118" y="388" fill="#16a34a" font-size="12" font-weight="600">IA prête</text>

  <!-- FEATURES SECTION -->
  <text x="700" y="580" text-anchor="middle" fill="${DARK}" font-size="26" font-weight="800">Tout ce dont votre ferme a besoin</text>
  <text x="700" y="608" text-anchor="middle" fill="${GRAY}" font-size="15">Des outils professionnels conçus pour l'agriculture africaine</text>
  ${[
    ['🌡️', 'Capteurs IoT', 'Surveillance temps réel humidité, température, luminosité', '#fee2e2', '#dc2626', 100],
    ['💧', 'Irrigation Smart', 'Automatisez l\'arrosage selon les données de vos capteurs', '#dbeafe', B1, 430],
    ['🤖', 'IA Advisor', 'Diagnostics et recommandations personnalisées Gemini AI', '#ede9fe', '#7c3aed', 760],
    ['📅', 'Calendrier', 'Planifiez vos cycles de culture et activités agricoles', '#fef3c7', '#d97706', 1090],
  ].map(([icon, title, desc, bg, color, x]) => `
    <rect x="${x}" y="628" width="290" height="190" rx="16" fill="${bg}" stroke="${color}22" stroke-width="1.5" filter="url(#sh)"/>
    <circle cx="${x + 35}" cy="${628 + 40}" r="22" fill="${color}22"/>
    <text x="${x + 35}" y="${628 + 48}" text-anchor="middle" font-size="22">${icon}</text>
    <text x="${x + 20}" y="${628 + 90}" fill="${DARK}" font-size="15" font-weight="700">${title}</text>
    <text x="${x + 20}" y="${628 + 116}" fill="${GRAY}" font-size="12">${desc.substring(0, 36)}</text>
    <text x="${x + 20}" y="${628 + 132}" fill="${GRAY}" font-size="12">${desc.substring(36)}</text>
  `).join('')}

  <!-- Footer bar -->
  <rect y="830" width="1400" height="30" fill="url(#hdr)"/>
  <text x="700" y="849" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="12">© 2025 CalisteAgriTech · CherilleTech · Yaoundé, Cameroun · contact@calisteagritech.cm</text>
</svg>`;

toPng(landing, '08_maquette_landing_page.png');

console.log('\n🎉 Tous les diagrammes générés dans ./diagrammes/');
console.log('📁 Fichiers :');
console.log('   01_architecture_technique.png');
console.log('   02_cas_utilisation.png');
console.log('   03_schema_base_donnees.png');
console.log('   04_flux_navigation.png');
console.log('   05_carte_fonctionnalites.png');
console.log('   06_plans_abonnement.png');
console.log('   07_maquette_dashboard.png');
console.log('   08_maquette_landing_page.png');
