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
// 18. CAPTURE — PANNEAU ADMIN
// ═══════════════════════════════════════════════════
const admin = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef2f2"/><stop offset="100%" stop-color="#fee2e2"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#991b1b"/><stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#dc2626"/><stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#dc2626" flood-opacity="0.1"/></filter>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>

  <!-- TOP BAR -->
  <rect width="1400" height="64" fill="url(#hdr)"/>
  <text x="30" y="34" fill="white" font-size="20">🛡️</text>
  <text x="60" y="36" fill="white" font-size="18" font-weight="800">CalisteAgriTech · Panneau Administrateur</text>
  <rect x="1150" y="16" width="120" height="34" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <text x="1210" y="37" text-anchor="middle" fill="white" font-size="13">← Retour app</text>
  <circle cx="1360" cy="32" r="20" fill="rgba(255,255,255,0.2)"/>
  <text x="1351" y="38" fill="white" font-size="16">🛡️</text>

  <!-- ADMIN KPI CARDS -->
  ${[
    ['👥 Utilisateurs','124 total','↑ +5 ce mois','#fef2f2','#dc2626'],
    ['✅ Actifs','112','89.9%','#f0fdf4','#16a34a'],
    ['⏸️ Suspendus','8','6.4%','#fff7ed','#f97316'],
    ['🚫 Supprimés','4','3.2%','#fdf4ff','#7c3aed'],
    ['🎫 Tickets ouverts','17','↑ urgent: 3','#fffbeb','#d97706'],
  ].map(([title,val,sub,bg,color],i)=>`
    <rect x="${30+i*268}" y="82" width="248" height="95" rx="14" fill="${bg}" stroke="${color}" stroke-width="1.5" filter="url(#sh)"/>
    <text x="${50+i*268}" y="114" fill="${color}" font-size="15" font-weight="700">${title}</text>
    <text x="${50+i*268}" y="148" fill="${DARK}" font-size="28" font-weight="800">${val}</text>
    <text x="${50+i*268}" y="168" fill="${GRAY}" font-size="12">${sub}</text>
  `).join('')}

  <!-- USERS TABLE -->
  <text x="30" y="212" fill="${DARK}" font-size="17" font-weight="700">👥 Gestion des Utilisateurs</text>

  <!-- Search + Filter bar -->
  <rect x="30" y="225" width="400" height="38" rx="10" fill="white" stroke="#fecaca" stroke-width="1.5"/>
  <text x="50" y="248" fill="${GRAY}" font-size="13">🔍  Rechercher un utilisateur...</text>
  <rect x="450" y="225" width="140" height="38" rx="10" fill="white" stroke="#fecaca" stroke-width="1.5"/>
  <text x="520" y="248" text-anchor="middle" fill="${GRAY}" font-size="13">Tous les rôles ▾</text>
  <rect x="610" y="225" width="140" height="38" rx="10" fill="white" stroke="#fecaca" stroke-width="1.5"/>
  <text x="680" y="248" text-anchor="middle" fill="${GRAY}" font-size="13">Statut ▾</text>
  <rect x="1200" y="225" width="170" height="38" rx="10" fill="url(#btn)"/>
  <text x="1285" y="249" text-anchor="middle" fill="white" font-size="13" font-weight="600">+ Inviter admin</text>

  <!-- Table header -->
  <rect x="30" y="275" width="1340" height="42" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
  ${[['Utilisateur',80],['Email',300],['Rôle',560],['Statut',700],['Inscrit le',860],['Actions',1120]].map(([h,x])=>`
    <text x="${x}" y="301" fill="${DARK}" font-size="13" font-weight="700">${h}</text>
  `).join('')}

  <!-- Table rows -->
  ${[
    {name:'Nguyen Caliste',email:'caliste@ferme.cm',role:'agriculteur',statut:'active',date:'12 Jan 2025',color:'#16a34a'},
    {name:'Mballa Sophie',email:'sophie.m@gmail.com',role:'agriculteur',statut:'active',date:'20 Jan 2025',color:'#16a34a'},
    {name:'Tanko Ibrahim',email:'tanko.i@yahoo.fr',role:'gestionnaire',statut:'active',date:'5 Fév 2025',color:C1},
    {name:'Fomo Gaëlle',email:'fomo.g@ferme.cm',role:'agriculteur',statut:'suspended',date:'14 Fév 2025',color:'#f97316'},
    {name:'Bello Pierre',email:'bello.p@agri.cm',role:'fournisseur',statut:'active',date:'1 Mar 2025',color:'#7c3aed'},
    {name:'Nkolo Marie',email:'nkolo.m@cm.com',role:'agriculteur',statut:'deleted',date:'20 Mar 2025',color:'#dc2626'},
    {name:'Ateba Cyrille',email:'ateba.c@ferme.cm',role:'agriculteur',statut:'active',date:'5 Avr 2025',color:'#16a34a'},
  ].map(({name,email,role,statut,date,color},i)=>`
    <rect x="30" y="${317+i*56}" width="1340" height="50" rx="6" fill="${i%2===0?'white':'#fafafa'}" stroke="#f1f5f9" stroke-width="0.5"/>
    <!-- Avatar -->
    <circle cx="58" cy="${342+i*56}" r="18" fill="${color}22" stroke="${color}" stroke-width="1.5"/>
    <text x="58" y="${348+i*56}" text-anchor="middle" fill="${color}" font-size="14" font-weight="700">${name[0]}</text>
    <text x="86" y="${346+i*56}" fill="${DARK}" font-size="13" font-weight="600">${name}</text>
    <text x="300" y="${346+i*56}" fill="${GRAY}" font-size="13">${email}</text>
    <rect x="555" y="${328+i*56}" width="100" height="24" rx="12" fill="${color}15" stroke="${color}" stroke-width="0.8"/>
    <text x="605" y="${344+i*56}" text-anchor="middle" fill="${color}" font-size="11" font-weight="600">${role}</text>
    <rect x="695" y="${328+i*56}" width="105" height="24" rx="12" fill="${statut==='active'?'#f0fdf4':statut==='suspended'?'#fff7ed':'#fef2f2'}"/>
    <text x="747" y="${344+i*56}" text-anchor="middle" fill="${statut==='active'?'#16a34a':statut==='suspended'?'#f97316':'#dc2626'}" font-size="11" font-weight="600">${statut}</text>
    <text x="860" y="${346+i*56}" fill="${GRAY}" font-size="12">${date}</text>
    <!-- Action buttons -->
    <rect x="1050" y="${328+i*56}" width="70" height="26" rx="6" fill="white" stroke="${C1}" stroke-width="1"/>
    <text x="1085" y="${345+i*56}" text-anchor="middle" fill="${C1}" font-size="11" font-weight="600">Détails</text>
    <rect x="1132" y="${328+i*56}" width="90" height="26" rx="6" fill="${statut==='suspended'?'#f0fdf4':'#fff7ed'}" stroke="${statut==='suspended'?'#16a34a':'#f97316'}" stroke-width="1"/>
    <text x="1177" y="${345+i*56}" text-anchor="middle" fill="${statut==='suspended'?'#16a34a':'#f97316'}" font-size="11" font-weight="600">${statut==='suspended'?'Réactiver':'Suspendre'}</text>
    <rect x="1234" y="${328+i*56}" width="80" height="26" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1"/>
    <text x="1274" y="${345+i*56}" text-anchor="middle" fill="#dc2626" font-size="11" font-weight="600">Supprimer</text>
    <rect x="1326" y="${328+i*56}" width="36" height="26" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="1344" y="${345+i*56}" text-anchor="middle" fill="${GRAY}" font-size="14">⋯</text>
  `).join('')}

  <!-- Pagination -->
  <text x="30" y="730" fill="${GRAY}" font-size="13">Affichage 1-7 sur 124 utilisateurs</text>
  ${[1,2,3,'...',12,13].map((p,i)=>`
    <rect x="${900+i*52}" y="718" width="44" height="30" rx="8" fill="${p===1?'url(#btn)':'white'}" stroke="${p===1?'':'#fecaca'}" stroke-width="${p===1?0:1}"/>
    <text x="${922+i*52}" y="${737}" text-anchor="middle" fill="${p===1?'white':DARK}" font-size="13">${p}</text>
  `).join('')}

  <text x="700" y="848" text-anchor="middle" fill="#dc2626" font-size="11">Figure : Panneau Administrateur — Gestion utilisateurs · Suspension, suppression, suivi des tickets · CalisteAgriTech</text>
</svg>`;

toPng(admin, '18_capture_admin.png');

// ═══════════════════════════════════════════════════
// 19. CAPTURE — IA ADVISOR
// ═══════════════════════════════════════════════════
const ia = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf4ff"/><stop offset="100%" stop-color="#f5f3ff"/>
    </linearGradient>
    <linearGradient id="sidebar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c4a6e"/><stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="hdrMain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#7c3aed" flood-opacity="0.15"/></filter>
  </defs>
  <rect width="1400" height="860" fill="url(#bg)"/>

  <!-- TOP BAR -->
  <rect width="1400" height="56" fill="white" filter="url(#sh)"/>
  <rect x="16" y="14" width="28" height="28" rx="8" fill="url(#hdrMain)"/>
  <text x="21" y="33" fill="white" font-size="16">🌾</text>
  <text x="52" y="34" fill="${DARK}" font-size="16" font-weight="700">CalisteAgriTech</text>
  <rect x="500" y="14" width="400" height="28" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
  <text x="516" y="33" fill="${GRAY}" font-size="13">🔍  Rechercher...</text>

  <!-- SIDEBAR -->
  <rect x="0" y="56" width="220" height="804" fill="url(#sidebar)"/>
  ${[
    ['📈','Vue globale',false],['🌿','Parcelles',false],['💧','Irrigation',false],
    ['📡','Matériels IoT',false],['🗺️','Carte',false],['⛅','Météo',false],
    ['🤖','IA Advisor',true],['🏪','Fournisseur',false],
  ].map(([icon,label,active],i)=>`
    <rect x="8" y="${75+i*56}" width="204" height="44" rx="10" fill="${active?'rgba(124,58,237,0.3)':'transparent'}"/>
    ${active?`<rect x="0" y="${75+i*56}" width="4" height="44" rx="2" fill="#c4b5fd"/>`:''}
    <text x="32" y="${102+i*56}" font-size="18">${icon}</text>
    <text x="58" y="${103+i*56}" fill="${active?'white':'#94a3b8'}" font-size="13" font-weight="${active?'600':'400'}">${label}</text>
  `).join('')}

  <!-- MAIN CONTENT -->
  <text x="245" y="94" fill="${DARK}" font-size="20" font-weight="700">🤖 IA Advisor</text>
  <text x="245" y="114" fill="${GRAY}" font-size="13">Diagnostics personnalisés · Gemini AI · Basé sur vos données réelles</text>

  <!-- LEFT PANEL: Chat -->
  <rect x="245" y="130" width="660" height="690" rx="16" fill="white" filter="url(#sh)"/>

  <!-- Chat header -->
  <rect x="245" y="130" width="660" height="56" rx="16" fill="url(#aiGrad)"/>
  <rect x="245" y="162" width="660" height="24" fill="url(#aiGrad)"/>
  <text x="275" y="158" fill="white" font-size="20">🤖</text>
  <text x="305" y="158" fill="white" font-size="15" font-weight="700">Gemini AI Advisor</text>
  <text x="305" y="178" fill="#c4b5fd" font-size="12">Connecté · Modèle: gemini-1.5-pro · Température: 0.7</text>
  <rect x="820" y="148" width="70" height="24" rx="12" fill="rgba(255,255,255,0.2)"/>
  <text x="855" y="164" text-anchor="middle" fill="white" font-size="11">🟢 En ligne</text>

  <!-- Chat messages -->
  <!-- User message 1 -->
  <rect x="490" y="200" width="400" height="70" rx="12" fill="#ede9fe" filter="url(#sh)"/>
  <text x="510" y="222" fill="${DARK}" font-size="13" font-weight="600">👨‍🌾 Agriculteur</text>
  <text x="510" y="242" fill="${DARK}" font-size="12">Analyse ma Parcelle Nord s'il te plaît —</text>
  <text x="510" y="258" fill="${DARK}" font-size="12">humidité à 45%, température 34°C</text>

  <!-- AI Response 1 -->
  <rect x="255" y="290" width="480" height="130" rx="12" fill="#f5f3ff" stroke="#ede9fe" stroke-width="1.5" filter="url(#sh)"/>
  <text x="280" y="312" fill="#7c3aed" font-size="13" font-weight="700">🤖 Gemini AI</text>
  <text x="280" y="332" fill="${DARK}" font-size="12">⚠️ Situation critique détectée sur Parcelle Nord :</text>
  <text x="280" y="352" fill="${DARK}" font-size="12">• Humidité 45% → sous le seuil minimal (60%)</text>
  <text x="280" y="372" fill="${DARK}" font-size="12">• Température 34°C → risque de stress thermique</text>
  <text x="280" y="392" fill="#7c3aed" font-size="12" font-weight="600">→ Recommande : irrigation immédiate (20L/m²)</text>

  <!-- User message 2 -->
  <rect x="490" y="440" width="400" height="55" rx="12" fill="#ede9fe" filter="url(#sh)"/>
  <text x="510" y="462" fill="${DARK}" font-size="13" font-weight="600">👨‍🌾 Agriculteur</text>
  <text x="510" y="482" fill="${DARK}" font-size="12">Quels engrais pour les tomates en juin ?</text>

  <!-- AI Response 2 -->
  <rect x="255" y="515" width="520" height="150" rx="12" fill="#f5f3ff" stroke="#ede9fe" stroke-width="1.5" filter="url(#sh)"/>
  <text x="280" y="537" fill="#7c3aed" font-size="13" font-weight="700">🤖 Gemini AI</text>
  <text x="280" y="557" fill="${DARK}" font-size="12">Pour vos tomates en période de fructification (juin) :</text>
  <text x="280" y="577" fill="${DARK}" font-size="12">🌿 NPK 10-10-30 : favorise la floraison et fruits</text>
  <text x="280" y="597" fill="${DARK}" font-size="12">🧪 Calcium folaire : prévient la nécrose apicale</text>
  <text x="280" y="617" fill="${DARK}" font-size="12">💧 Application : matin tôt, après irrigation</text>
  <text x="280" y="637" fill="#7c3aed" font-size="12" font-weight="600">Fournisseurs recommandés : AgriCam Pro, Semences+</text>
  <text x="280" y="654" fill="${GRAY}" font-size="10">Source: Données capteurs + calendrier cultural · Confiance: 87%</text>

  <!-- Chat input -->
  <rect x="255" y="688" width="640" height="50" rx="12" fill="#f8fafc" stroke="#ede9fe" stroke-width="2"/>
  <text x="275" y="718" fill="#94a3b8" font-size="13">Posez votre question agricole...</text>
  <rect x="828" y="696" width="48" height="34" rx="10" fill="url(#aiGrad)"/>
  <text x="852" y="717" text-anchor="middle" fill="white" font-size="16">➤</text>

  <!-- RIGHT PANEL: Recommendations -->
  <rect x="930" y="130" width="440" height="690" rx="16" fill="white" filter="url(#sh)"/>
  <text x="950" y="165" fill="${DARK}" font-size="15" font-weight="700">📋 Recommandations actives</text>
  <text x="950" y="183" fill="${GRAY}" font-size="12">Basées sur vos données IoT en temps réel</text>

  ${[
    {icon:'⚠️',titre:'Irrigation urgente',desc:'Parcelle Ouest — humidité 38%',prio:'urgente',color:'#dc2626',bg:'#fef2f2'},
    {icon:'💡',titre:'Traitement préventif',desc:'Risque de mildiou — hygrométrie 85%',prio:'haute',color:'#f97316',bg:'#fff7ed'},
    {icon:'📅',titre:'Semis à planifier',desc:'Fenêtre optimale : 25-30 juin',prio:'moyenne',color:'#d97706',bg:'#fffbeb'},
    {icon:'🌡️',titre:'Stress thermique',desc:'Parcelle Sud — T° > 33°C depuis 3j',prio:'haute',color:'#dc2626',bg:'#fef2f2'},
    {icon:'🌿',titre:'Sol acide détecté',desc:'pH 5.2 — chaulage recommandé',prio:'normale',color:C1,bg:'#ecfeff'},
    {icon:'✅',titre:'Irrigation terminée',desc:'Parcelle Nord — 25L/m² appliqués',prio:'info',color:'#16a34a',bg:'#f0fdf4'},
  ].map(({icon,titre,desc,prio,color,bg},i)=>`
    <rect x="940" y="${205+i*90}" width="420" height="78" rx="12" fill="${bg}" stroke="${color}30" stroke-width="1" filter="url(#sh)"/>
    <text x="965" y="${240+i*90}" font-size="22">${icon}</text>
    <text x="1000" y="${234+i*90}" fill="${DARK}" font-size="13" font-weight="700">${titre}</text>
    <text x="1000" y="${252+i*90}" fill="${GRAY}" font-size="12">${desc}</text>
    <rect x="1000" y="${260+i*90}" width="80" height="18" rx="9" fill="${color}20" stroke="${color}" stroke-width="0.8"/>
    <text x="1040" y="${272+i*90}" text-anchor="middle" fill="${color}" font-size="10" font-weight="600">${prio}</text>
    <text x="1330" y="${252+i*90}" text-anchor="end" fill="${color}" font-size="12" font-weight="600">→</text>
  `).join('')}

  <text x="700" y="848" text-anchor="middle" fill="#7c3aed" font-size="11">Figure : IA Advisor — Diagnostic et recommandations Gemini AI · Chat intégré · CalisteAgriTech 2025</text>
</svg>`;

toPng(ia, '19_capture_ia_advisor.png');
console.log('done part7');
