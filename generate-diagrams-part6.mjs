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
// 16. CAPTURE — ÉCRAN DE CONNEXION
// ═══════════════════════════════════════════════════
const login = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C1}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="sidebar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c4a6e"/><stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="${C1}" flood-opacity="0.2"/></filter>
    <filter id="sh2"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.1"/></filter>
  </defs>

  <!-- Background split -->
  <rect width="1200" height="800" fill="url(#heroBg)"/>
  <rect x="0" y="0" width="520" height="800" fill="url(#sidebar)"/>

  <!-- Left panel: branding -->
  <text x="260" y="200" text-anchor="middle" font-size="60">🌾</text>
  <text x="260" y="270" text-anchor="middle" fill="white" font-size="30" font-weight="900">CalisteAgriTech</text>
  <text x="260" y="305" text-anchor="middle" fill="${C3}" font-size="16">Plateforme Smart Farming</text>
  <text x="260" y="340" text-anchor="middle" fill="#94a3b8" font-size="14">by AgriTech · Cameroun</text>

  <!-- Features list -->
  ${['🌡️  Capteurs IoT temps réel','💧  Irrigation automatique','🤖  IA Advisor (Gemini)','🗺️  Carte interactive','📊  Tableaux de bord'].map((f,i)=>`
    <rect x="100" y="${390+i*52}" width="320" height="42" rx="10" fill="rgba(8,145,178,0.15)" stroke="${C3}" stroke-width="0.8"/>
    <text x="120" y="${417+i*52}" fill="white" font-size="14">${f}</text>
  `).join('')}

  <text x="260" y="690" text-anchor="middle" fill="#475569" font-size="12">© 2025 AgriTech · Yaoundé, Cameroun</text>

  <!-- Right panel: login form -->
  <rect x="580" y="120" width="540" height="540" rx="20" fill="white" filter="url(#sh)"/>

  <!-- Logo top of form -->
  <rect x="660" y="155" width="40" height="40" rx="10" fill="url(#btn)"/>
  <text x="680" y="183" text-anchor="middle" fill="white" font-size="22">🌾</text>
  <text x="1100" y="175" text-anchor="middle" fill="${DARK}" font-size="22" font-weight="800">Connexion</text>
  <text x="850" y="175" text-anchor="middle" fill="${DARK}" font-size="22" font-weight="800">Connexion</text>
  <text x="850" y="200" text-anchor="middle" fill="${GRAY}" font-size="14">Bienvenue sur CalisteAgriTech</text>

  <!-- Toggle Connexion / Inscription -->
  <rect x="610" y="220" width="480" height="42" rx="12" fill="#f1f5f9"/>
  <rect x="612" y="222" width="238" height="38" rx="10" fill="url(#btn)"/>
  <text x="731" y="247" text-anchor="middle" fill="white" font-size="14" font-weight="600">Se connecter</text>
  <text x="971" y="247" text-anchor="middle" fill="${GRAY}" font-size="14">S'inscrire</text>

  <!-- Email field -->
  <text x="620" y="295" fill="${DARK}" font-size="13" font-weight="600">Adresse email</text>
  <rect x="610" y="305" width="480" height="46" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <text x="630" y="333" fill="#94a3b8" font-size="14">✉️   agriculteur@exemple.cm</text>

  <!-- Password field -->
  <text x="620" y="375" fill="${DARK}" font-size="13" font-weight="600">Mot de passe</text>
  <rect x="610" y="385" width="480" height="46" rx="10" fill="#f8fafc" stroke="${C1}" stroke-width="2"/>
  <text x="630" y="413" fill="#94a3b8" font-size="14">🔒   ••••••••••••</text>
  <text x="1070" y="413" text-anchor="end" fill="${C1}" font-size="13">Voir</text>

  <!-- Forgot password -->
  <text x="1090" y="450" text-anchor="end" fill="${C1}" font-size="13">Mot de passe oublié ?</text>

  <!-- Submit button -->
  <rect x="610" y="462" width="480" height="50" rx="14" fill="url(#btn)" filter="url(#sh2)"/>
  <text x="850" y="493" text-anchor="middle" fill="white" font-size="16" font-weight="700">Se connecter →</text>

  <!-- Divider -->
  <line x1="610" y1="535" x2="820" y2="535" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="820" y="525" width="60" height="20" rx="5" fill="white"/>
  <text x="850" y="539" text-anchor="middle" fill="${GRAY}" font-size="12">ou</text>
  <line x1="880" y1="535" x2="1090" y2="535" stroke="#e2e8f0" stroke-width="1"/>

  <!-- Google OAuth -->
  <rect x="610" y="552" width="480" height="44" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="640" y="578" font-size="20">🔵</text>
  <text x="850" y="580" text-anchor="middle" fill="${DARK}" font-size="14" font-weight="500">Continuer avec Google</text>

  <!-- Caption -->
  <text x="600" y="760" fill="${GRAY}" font-size="11">Figure : Interface de connexion — CalisteAgriTech · Authentification sécurisée via Supabase Auth</text>
</svg>`;

toPng(login, '16_capture_connexion.png');

// ═══════════════════════════════════════════════════
// 17. CAPTURE — ONGLET PARCELLES
// ═══════════════════════════════════════════════════
const parcelles = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="sidebar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c4a6e"/><stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="hdrMain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C1}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.08"/></filter>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>

  <!-- TOP BAR -->
  <rect width="1400" height="56" fill="white" filter="url(#sh)"/>
  <rect x="16" y="14" width="28" height="28" rx="8" fill="url(#hdrMain)"/>
  <text x="21" y="33" fill="white" font-size="16">🌾</text>
  <text x="52" y="34" fill="${DARK}" font-size="16" font-weight="700">CalisteAgriTech</text>
  <rect x="500" y="14" width="400" height="28" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
  <text x="516" y="33" fill="${GRAY}" font-size="13">🔍  Rechercher une parcelle...</text>
  <circle cx="1280" cy="28" r="18" fill="#f1f5f9"/>
  <text x="1272" y="34" font-size="16">🔔</text>
  <circle cx="1340" cy="28" r="20" fill="url(#hdrMain)"/>
  <text x="1332" y="34" font-size="16">👨‍🌾</text>

  <!-- LEFT SIDEBAR -->
  <rect x="0" y="56" width="220" height="804" fill="url(#sidebar)"/>
  ${[
    ['📈','Vue globale',false],['🌿','Parcelles',true],['💧','Irrigation',false],
    ['📡','Matériels IoT',false],['🗺️','Carte',false],['⛅','Météo',false],
    ['🤖','IA Advisor',false],['🏪','Fournisseur',false],
  ].map(([icon,label,active],i)=>`
    <rect x="8" y="${75+i*56}" width="204" height="44" rx="10" fill="${active?'rgba(8,145,178,0.25)':'transparent'}"/>
    ${active?`<rect x="0" y="${75+i*56}" width="4" height="44" rx="2" fill="${C3}"/>`:''}
    <text x="32" y="${102+i*56}" font-size="18">${icon}</text>
    <text x="58" y="${103+i*56}" fill="${active?'white':'#94a3b8'}" font-size="13" font-weight="${active?'600':'400'}">${label}</text>
  `).join('')}

  <!-- MAIN CONTENT -->
  <text x="245" y="94" fill="${DARK}" font-size="20" font-weight="700">🌿 Mes Parcelles</text>
  <text x="245" y="114" fill="${GRAY}" font-size="13">7 parcelles · Région Centre · Yaoundé</text>

  <!-- Action buttons -->
  <rect x="1100" y="75" width="180" height="38" rx="10" fill="url(#btn)" filter="url(#sh)"/>
  <text x="1190" y="99" text-anchor="middle" fill="white" font-size="13" font-weight="700">+ Nouvelle parcelle</text>
  <rect x="920" y="75" width="160" height="38" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="1000" y="99" text-anchor="middle" fill="${DARK}" font-size="13">🗺️ Vue carte</text>

  <!-- Filter tabs -->
  <rect x="245" y="130" width="480" height="38" rx="10" fill="white" filter="url(#sh)"/>
  ${[['Toutes',0,'url(#btn)','white'],['Actives',1,'#f0fdf4','#16a34a'],['En repos',2,'white','#64748b'],['Récolte',3,'white','#64748b']].map(([label,i,bg,color])=>`
    <rect x="${253+i*110}" y="134" width="106" height="30" rx="8" fill="${bg}"/>
    <text x="${306+i*110}" y="154" text-anchor="middle" fill="${color}" font-size="13" font-weight="${i===0?'600':'400'}">${label}</text>
  `).join('')}

  <!-- PARCELLE CARDS GRID -->
  ${[
    {nom:'Parcelle Nord',culture:'Tomates',surface:'2.5 ha',statut:'active',hum:72,temp:28,color:'#16a34a',bg:'#f0fdf4',icon:'🍅',lat:'3.848°N',lng:'11.502°E'},
    {nom:'Parcelle Sud',culture:'Maïs',surface:'1.8 ha',statut:'active',hum:58,temp:30,color:C1,bg:'#ecfeff',icon:'🌽',lat:'3.833°N',lng:'11.488°E'},
    {nom:'Parcelle Est',culture:'Manioc',surface:'3.2 ha',statut:'active',hum:85,temp:26,color:'#7c3aed',bg:'#fdf4ff',icon:'🥬',lat:'3.862°N',lng:'11.521°E'},
    {nom:'Parcelle Ouest',culture:'Plantains',surface:'1.1 ha',statut:'active',hum:45,temp:32,color:'#d97706',bg:'#fffbeb',icon:'🍌',lat:'3.840°N',lng:'11.475°E'},
    {nom:'Parcelle Centre',culture:'Arachides',surface:'0.9 ha',statut:'repos',hum:30,temp:31,color:'#64748b',bg:'#f8fafc',icon:'🥜',lat:'3.855°N',lng:'11.495°E'},
    {nom:'Zone Expérim.',culture:'Soja',surface:'0.5 ha',statut:'active',hum:68,temp:29,color:'#0369a1',bg:'#eff6ff',icon:'🫛',lat:'3.870°N',lng:'11.510°E'},
  ].map(({nom,culture,surface,statut,hum,temp,color,bg,icon,lat,lng},i)=>{
    const col = i%3; const row = Math.floor(i/3);
    const x = 245+col*390; const y = 180+row*290;
    return `
      <rect x="${x}" y="${y}" width="365" height="265" rx="16" fill="white" filter="url(#sh)"/>
      <!-- Card header -->
      <rect x="${x}" y="${y}" width="365" height="80" rx="16" fill="${bg}" stroke="${color}" stroke-width="0"/>
      <rect x="${x}" y="${y+64}" width="365" height="16" fill="${bg}"/>
      <text x="${x+20}" y="${y+35}" font-size="28">${icon}</text>
      <text x="${x+60}" y="${y+30}" fill="${DARK}" font-size="15" font-weight="700">${nom}</text>
      <text x="${x+60}" y="${y+50}" fill="${color}" font-size="12" font-weight="600">${culture} · ${surface}</text>
      <rect x="${x+270}" y="${y+18}" width="75" height="24" rx="12" fill="${color}22" stroke="${color}" stroke-width="1"/>
      <text x="${x+307}" y="${y+34}" text-anchor="middle" fill="${color}" font-size="11" font-weight="600">${statut}</text>
      <!-- Metrics -->
      <rect x="${x+15}" y="${y+90}" width="160" height="50" rx="10" fill="#f8fafc"/>
      <text x="${x+95}" y="${y+112}" text-anchor="middle" fill="${GRAY}" font-size="11">Humidité sol</text>
      <text x="${x+95}" y="${y+132}" text-anchor="middle" fill="${hum<50?'#dc2626':hum>80?'#7c3aed':C1}" font-size="18" font-weight="700">${hum}%</text>
      <rect x="${x+190}" y="${y+90}" width="160" height="50" rx="10" fill="#f8fafc"/>
      <text x="${x+270}" y="${y+112}" text-anchor="middle" fill="${GRAY}" font-size="11">Température</text>
      <text x="${x+270}" y="${y+132}" text-anchor="middle" fill="${temp>31?'#dc2626':'#d97706'}" font-size="18" font-weight="700">${temp}°C</text>
      <!-- GPS -->
      <text x="${x+20}" y="${y+165}" fill="${GRAY}" font-size="12">📍 ${lat} · ${lng}</text>
      <!-- Mini sensor bar -->
      <text x="${x+20}" y="${y+190}" fill="${GRAY}" font-size="11">Capteurs IoT actifs :</text>
      <rect x="${x+20}" y="${y+198}" width="325" height="8" rx="4" fill="#e2e8f0"/>
      <rect x="${x+20}" y="${y+198}" width="${325*hum/100}" height="8" rx="4" fill="${color}"/>
      <!-- Action buttons -->
      <rect x="${x+15}" y="${y+220}" width="160" height="32" rx="8" fill="url(#btn)"/>
      <text x="${x+95}" y="${y+241}" text-anchor="middle" fill="white" font-size="12" font-weight="600">Voir détails →</text>
      <rect x="${x+190}" y="${y+220}" width="160" height="32" rx="8" fill="white" stroke="${color}" stroke-width="1.5"/>
      <text x="${x+270}" y="${y+241}" text-anchor="middle" fill="${color}" font-size="12" font-weight="600">📡 Capteurs</text>
    `;
  }).join('')}

  <text x="700" y="848" text-anchor="middle" fill="${GRAY}" font-size="11">Figure : Onglet Parcelles — CalisteAgriTech · Gestion des parcelles agricoles avec données IoT en temps réel</text>
</svg>`;

toPng(parcelles, '17_capture_parcelles.png');
console.log('done part6');
