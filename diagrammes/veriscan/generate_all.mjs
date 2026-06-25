import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = 'C:/Users/WhiteDuck/Desktop/projets/calisteAgriTech/diagrammes/veriscan';
mkdirSync(OUT, { recursive: true });

function savePng(name, svgStr) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: 2400 } });
  const png = resvg.render().asPng();
  writeFileSync(join(OUT, name + '.png'), png);
  console.log(`✓ ${name}.png (${(png.length/1024).toFixed(0)} KB)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ARCHITECTURE GÉNÉRALE
// ─────────────────────────────────────────────────────────────────────────────
const arch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f4ff"/>
      <stop offset="100%" stop-color="#e8eeff"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#00000025"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#bg)"/>

  <!-- Title bar -->
  <rect width="1200" height="70" fill="url(#hdr)"/>
  <text x="600" y="43" text-anchor="middle" fill="white" font-size="26" font-weight="bold">Architecture Générale — VeriScan</text>
  <text x="600" y="63" text-anchor="middle" fill="#90caf9" font-size="14">Laravel 11 · PHP 8.3 · Blade · Tailwind CSS · MySQL</text>

  <!-- Layer labels -->
  <text x="30" y="130" fill="#1a237e" font-size="13" font-weight="bold">COUCHE PRÉSENTATION</text>
  <line x1="30" y1="135" x2="1170" y2="135" stroke="#3949ab" stroke-width="1.5" stroke-dasharray="6,3"/>

  <text x="30" y="290" fill="#1a237e" font-size="13" font-weight="bold">COUCHE APPLICATION (Laravel)</text>
  <line x1="30" y1="295" x2="1170" y2="295" stroke="#3949ab" stroke-width="1.5" stroke-dasharray="6,3"/>

  <text x="30" y="500" fill="#1a237e" font-size="13" font-weight="bold">COUCHE DONNÉES</text>
  <line x1="30" y1="505" x2="1170" y2="505" stroke="#3949ab" stroke-width="1.5" stroke-dasharray="6,3"/>

  <text x="30" y="620" fill="#1a237e" font-size="13" font-weight="bold">SERVICES EXTERNES</text>
  <line x1="30" y1="625" x2="1170" y2="625" stroke="#3949ab" stroke-width="1.5" stroke-dasharray="6,3"/>

  <!-- Presentation layer boxes -->
  ${[
    ['150','Visiteur / Public','Interface vérification produit','#e3f2fd','#1565c0'],
    ['400','Fabricant','Dashboard produits &amp; QR codes','#e8f5e9','#2e7d32'],
    ['650','Administrateur','Gestion plateforme','#fff3e0','#e65100'],
    ['900','API Mobile','Scan QR via mobile','#f3e5f5','#6a1b9a'],
  ].map(([x,t,s,bg,c]) => `
  <rect x="${x}" y="150" width="200" height="115" rx="10" fill="${bg}" stroke="${c}" stroke-width="2" filter="url(#shadow)"/>
  <rect x="${x}" y="150" width="200" height="35" rx="10" fill="${c}"/>
  <rect x="${x}" y="172" width="200" height="13" fill="${c}"/>
  <text x="${+x+100}" y="173" text-anchor="middle" fill="white" font-size="13" font-weight="bold">${t}</text>
  <text x="${+x+100}" y="210" text-anchor="middle" fill="${c}" font-size="11" font-weight="bold">Blade Templates</text>
  <text x="${+x+100}" y="228" text-anchor="middle" fill="#555" font-size="11">${s}</text>
  <text x="${+x+100}" y="248" text-anchor="middle" fill="${c}" font-size="10">Tailwind CSS · Alpine.js</text>
  `).join('')}

  <!-- Application layer -->
  <!-- Routes -->
  <rect x="60" y="310" width="160" height="160" rx="8" fill="#e8eaf6" stroke="#3f51b5" stroke-width="2" filter="url(#shadow)"/>
  <rect x="60" y="310" width="160" height="30" rx="8" fill="#3f51b5"/>
  <rect x="60" y="328" width="160" height="12" fill="#3f51b5"/>
  <text x="140" y="330" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Routes</text>
  <text x="140" y="360" text-anchor="middle" fill="#3f51b5" font-size="10" font-weight="bold">web.php</text>
  <text x="140" y="378" text-anchor="middle" fill="#555" font-size="10">/public</text>
  <text x="140" y="394" text-anchor="middle" fill="#555" font-size="10">/fabricant</text>
  <text x="140" y="410" text-anchor="middle" fill="#555" font-size="10">/admin</text>
  <text x="140" y="426" text-anchor="middle" fill="#555" font-size="10">/paiement</text>
  <text x="140" y="452" text-anchor="middle" fill="#3f51b5" font-size="9">Middleware Auth</text>

  <!-- Controllers -->
  <rect x="260" y="310" width="200" height="160" rx="8" fill="#e8f5e9" stroke="#388e3c" stroke-width="2" filter="url(#shadow)"/>
  <rect x="260" y="310" width="200" height="30" rx="8" fill="#388e3c"/>
  <rect x="260" y="328" width="200" height="12" fill="#388e3c"/>
  <text x="360" y="330" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Controllers</text>
  ${['FabricantProduitsController','FabricantLotsController','FabricantQRCodesController','VerificationController','AdminDashboardController','PaiementController'].map((c,i) => `<text x="360" y="${358+i*18}" text-anchor="middle" fill="#333" font-size="10">${c}</text>`).join('')}

  <!-- Models -->
  <rect x="500" y="310" width="200" height="160" rx="8" fill="#fff8e1" stroke="#f9a825" stroke-width="2" filter="url(#shadow)"/>
  <rect x="500" y="310" width="200" height="30" rx="8" fill="#f9a825"/>
  <rect x="500" y="328" width="200" height="12" fill="#f9a825"/>
  <text x="600" y="330" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Models (Eloquent)</text>
  ${['Fabricant','Produit','Lot','QrCode','Verification','Signalement','Souscription','Admin'].map((m,i) => `<text x="600" y="${358+i*18}" text-anchor="middle" fill="#333" font-size="10">${m}</text>`).join('')}

  <!-- Services -->
  <rect x="740" y="310" width="180" height="160" rx="8" fill="#fce4ec" stroke="#c62828" stroke-width="2" filter="url(#shadow)"/>
  <rect x="740" y="310" width="180" height="30" rx="8" fill="#c62828"/>
  <rect x="740" y="328" width="180" height="12" fill="#c62828"/>
  <text x="830" y="330" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Services</text>
  ${['QrCodeService','PaiementService','VerificationService','RiskScoreService','NotificationService'].map((s,i) => `<text x="830" y="${358+i*18}" text-anchor="middle" fill="#333" font-size="10">${s}</text>`).join('')}

  <!-- Middleware -->
  <rect x="960" y="310" width="180" height="160" rx="8" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="2" filter="url(#shadow)"/>
  <rect x="960" y="310" width="180" height="30" rx="8" fill="#7b1fa2"/>
  <rect x="960" y="328" width="180" height="12" fill="#7b1fa2"/>
  <text x="1050" y="330" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Middleware &amp; Auth</text>
  ${['FabricantAuth','AdminAuth','CheckSubscription','SetLocale','VerifyCsrfToken'].map((m,i) => `<text x="1050" y="${358+i*18}" text-anchor="middle" fill="#333" font-size="10">${m}</text>`).join('')}

  <!-- Data layer -->
  <rect x="120" y="520" width="240" height="80" rx="10" fill="#e3f2fd" stroke="#1565c0" stroke-width="2" filter="url(#shadow)"/>
  <rect x="120" y="520" width="240" height="30" rx="10" fill="#1565c0"/>
  <rect x="120" y="538" width="240" height="12" fill="#1565c0"/>
  <text x="240" y="540" text-anchor="middle" fill="white" font-size="13" font-weight="bold">MySQL Database</text>
  <text x="240" y="568" text-anchor="middle" fill="#1565c0" font-size="11">fabricants · produits · lots · qr_codes</text>
  <text x="240" y="585" text-anchor="middle" fill="#555" font-size="10">verifications · signalements · souscriptions</text>

  <rect x="420" y="520" width="200" height="80" rx="10" fill="#e8f5e9" stroke="#2e7d32" stroke-width="2" filter="url(#shadow)"/>
  <rect x="420" y="520" width="200" height="30" rx="10" fill="#2e7d32"/>
  <rect x="420" y="538" width="200" height="12" fill="#2e7d32"/>
  <text x="520" y="540" text-anchor="middle" fill="white" font-size="13" font-weight="bold">Cache (Redis/File)</text>
  <text x="520" y="570" text-anchor="middle" fill="#555" font-size="11">Sessions · API cache</text>
  <text x="520" y="587" text-anchor="middle" fill="#555" font-size="10">Queue jobs</text>

  <rect x="680" y="520" width="200" height="80" rx="10" fill="#fff3e0" stroke="#e65100" stroke-width="2" filter="url(#shadow)"/>
  <rect x="680" y="520" width="200" height="30" rx="10" fill="#e65100"/>
  <rect x="680" y="538" width="200" height="12" fill="#e65100"/>
  <text x="780" y="540" text-anchor="middle" fill="white" font-size="13" font-weight="bold">Storage</text>
  <text x="780" y="570" text-anchor="middle" fill="#555" font-size="11">Logos · Documents PDF</text>
  <text x="780" y="587" text-anchor="middle" fill="#555" font-size="10">QR Codes images</text>

  <!-- External services -->
  ${[
    [80,'CinetPay\n/ Stripe','Paiement en ligne','#e8eaf6','#3f51b5'],
    [280,'OpenAI API','IA génération\ndescriptions','#fce4ec','#c62828'],
    [480,'SMTP Mail','Emails\ntransactionnels','#e8f5e9','#2e7d32'],
    [680,'Google/\nFacebook OAuth','Authentification\nsociale','#fff8e1','#f57f17'],
    [880,'QR Code\nGenerator','Génération &amp;\nimpression PDF','#f3e5f5','#7b1fa2'],
  ].map(([x,t,s,bg,c]) => `
  <rect x="${x}" y="640" width="170" height="90" rx="8" fill="${bg}" stroke="${c}" stroke-width="2" filter="url(#shadow)"/>
  <rect x="${x}" y="640" width="170" height="28" rx="8" fill="${c}"/>
  <rect x="${x}" y="655" width="170" height="13" fill="${c}"/>
  <text x="${+x+85}" y="658" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${t.split('\n')[0]}</text>
  ${t.includes('\n') ? `<text x="${+x+85}" y="672" text-anchor="middle" fill="white" font-size="10">${t.split('\n')[1]}</text>` : ''}
  <text x="${+x+85}" y="700" text-anchor="middle" fill="${c}" font-size="10" font-weight="bold">${s.split('\n')[0]}</text>
  ${s.includes('\n') ? `<text x="${+x+85}" y="716" text-anchor="middle" fill="#555" font-size="10">${s.split('\n')[1]}</text>` : ''}
  `).join('')}
</svg>`;

savePng('01_architecture_generale', arch);

// ─────────────────────────────────────────────────────────────────────────────
// 2. DIAGRAMME DE CAS D'UTILISATION
// ─────────────────────────────────────────────────────────────────────────────
const usecase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#00000020"/></filter>
  </defs>
  <rect width="1400" height="900" fill="#f8f9ff"/>
  <rect width="1400" height="65" fill="url(#hdr2)"/>
  <text x="700" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">Diagramme de Cas d'Utilisation — VeriScan</text>
  <text x="700" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Acteurs et fonctionnalités principales du système</text>

  <!-- System boundary -->
  <rect x="250" y="80" width="900" height="800" rx="15" fill="none" stroke="#3949ab" stroke-width="2.5" stroke-dasharray="8,4"/>
  <text x="700" y="104" text-anchor="middle" fill="#3949ab" font-size="14" font-weight="bold">«système» VeriScan</text>

  <!-- Actors -->
  <!-- Visiteur -->
  <ellipse cx="90" cy="260" rx="30" ry="38" fill="none" stroke="#1565c0" stroke-width="2"/>
  <line x1="90" y1="298" x2="90" y2="360" stroke="#1565c0" stroke-width="2"/>
  <line x1="55" y1="325" x2="125" y2="325" stroke="#1565c0" stroke-width="2"/>
  <line x1="90" y1="360" x2="60" y2="400" stroke="#1565c0" stroke-width="2"/>
  <line x1="90" y1="360" x2="120" y2="400" stroke="#1565c0" stroke-width="2"/>
  <text x="90" y="420" text-anchor="middle" fill="#1565c0" font-size="13" font-weight="bold">Visiteur</text>

  <!-- Fabricant -->
  <ellipse cx="90" cy="560" rx="30" ry="38" fill="none" stroke="#2e7d32" stroke-width="2"/>
  <line x1="90" y1="598" x2="90" y2="660" stroke="#2e7d32" stroke-width="2"/>
  <line x1="55" y1="625" x2="125" y2="625" stroke="#2e7d32" stroke-width="2"/>
  <line x1="90" y1="660" x2="60" y2="700" stroke="#2e7d32" stroke-width="2"/>
  <line x1="90" y1="660" x2="120" y2="700" stroke="#2e7d32" stroke-width="2"/>
  <text x="90" y="720" text-anchor="middle" fill="#2e7d32" font-size="13" font-weight="bold">Fabricant</text>

  <!-- Admin -->
  <ellipse cx="1310" cy="420" rx="30" ry="38" fill="none" stroke="#e65100" stroke-width="2"/>
  <line x1="1310" y1="458" x2="1310" y2="520" stroke="#e65100" stroke-width="2"/>
  <line x1="1275" y1="485" x2="1345" y2="485" stroke="#e65100" stroke-width="2"/>
  <line x1="1310" y1="520" x2="1280" y2="560" stroke="#e65100" stroke-width="2"/>
  <line x1="1310" y1="520" x2="1340" y2="560" stroke="#e65100" stroke-width="2"/>
  <text x="1310" y="580" text-anchor="middle" fill="#e65100" font-size="13" font-weight="bold">Administrateur</text>

  <!-- Use case ellipses: Visiteur -->
  ${[
    [700, 150, 'Scanner un QR code', '#e3f2fd', '#1565c0'],
    [700, 210, 'Vérifier authenticité produit', '#e3f2fd', '#1565c0'],
    [700, 270, 'Signaler un produit suspect', '#e3f2fd', '#1565c0'],
    [700, 330, 'Voir tarifs', '#e3f2fd', '#1565c0'],
  ].map(([cx,cy,t,bg,c]) => `
    <ellipse cx="${cx}" cy="${cy}" rx="185" ry="22" fill="${bg}" stroke="${c}" stroke-width="1.8"/>
    <text x="${cx}" y="${+cy+5}" text-anchor="middle" fill="${c}" font-size="12" font-weight="bold">${t}</text>
    <line x1="${+cx-185}" y1="${cy}" x2="155" y2="${cy}" stroke="${c}" stroke-width="1" stroke-dasharray="4,3"/>
  `).join('')}

  <!-- Use case ellipses: Fabricant -->
  ${[
    [700, 430, "S&apos;inscrire / Se connecter", '#e8f5e9', '#2e7d32'],
    [700, 490, 'Gérer ses produits (CRUD)', '#e8f5e9', '#2e7d32'],
    [700, 550, 'Gérer ses lots de production', '#e8f5e9', '#2e7d32'],
    [700, 610, 'Générer des QR codes', '#e8f5e9', '#2e7d32'],
    [700, 670, 'Télécharger PDF QR codes', '#e8f5e9', '#2e7d32'],
    [700, 730, 'Consulter signalements', '#e8f5e9', '#2e7d32'],
    [700, 790, 'Souscrire un abonnement', '#e8f5e9', '#2e7d32'],
    [700, 850, 'Voir statistiques &amp; rapports', '#e8f5e9', '#2e7d32'],
  ].map(([cx,cy,t,bg,c]) => `
    <ellipse cx="${cx}" cy="${cy}" rx="185" ry="22" fill="${bg}" stroke="${c}" stroke-width="1.8"/>
    <text x="${cx}" y="${+cy+5}" text-anchor="middle" fill="${c}" font-size="12" font-weight="bold">${t}</text>
    <line x1="${+cx-185}" y1="${cy}" x2="155" y2="${cy}" stroke="${c}" stroke-width="1" stroke-dasharray="4,3"/>
  `).join('')}

  <!-- Use case ellipses: Admin -->
  ${[
    [1150, 390, 'Gérer les fabricants', '#fff3e0', '#e65100'],
    [1150, 450, 'Suspendre un fabricant', '#fff3e0', '#e65100'],
    [1150, 510, 'Traiter les signalements', '#fff3e0', '#e65100'],
    [1150, 570, 'Consulter carte mondiale', '#fff3e0', '#e65100'],
  ].map(([cx,cy,t,bg,c]) => `
    <ellipse cx="${cx}" cy="${cy}" rx="160" ry="22" fill="${bg}" stroke="${c}" stroke-width="1.8"/>
    <text x="${cx}" y="${+cy+5}" text-anchor="middle" fill="${c}" font-size="12" font-weight="bold">${t}</text>
    <line x1="${+cx+160}" y1="${cy}" x2="1280" y2="${cy}" stroke="${c}" stroke-width="1" stroke-dasharray="4,3"/>
  `).join('')}
</svg>`;

savePng('02_cas_utilisation', usecase);

// ─────────────────────────────────────────────────────────────────────────────
// 3. MODÈLE DE DONNÉES (ERD)
// ─────────────────────────────────────────────────────────────────────────────
function table(x, y, name, color, fields) {
  const W = 230, H = 30 + fields.length * 22;
  const rows = fields.map((f, i) => `
    <rect x="${x}" y="${y+30+i*22}" width="${W}" height="22" fill="${i%2===0?'#f9f9f9':'#ffffff'}" stroke="#ddd" stroke-width="0.5"/>
    <text x="${x+8}" y="${y+45+i*22}" fill="${f.pk?'#c62828':f.fk?'#1565c0':'#333'}" font-size="11" font-style="${f.fk?'italic':'normal'}" font-weight="${f.pk?'bold':'normal'}">${f.pk?'🔑 ':f.fk?'🔗 ':'   '}${f.name}</text>
    <text x="${x+W-8}" y="${y+45+i*22}" text-anchor="end" fill="#888" font-size="10">${f.type}</text>
  `).join('');
  return `
    <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="6" fill="white" stroke="${color}" stroke-width="2" filter="url(#sh3)"/>
    <rect x="${x}" y="${y}" width="${W}" height="30" rx="6" fill="${color}"/>
    <rect x="${x}" y="${y+18}" width="${W}" height="12" fill="${color}"/>
    <text x="${x+W/2}" y="${y+20}" text-anchor="middle" fill="white" font-size="13" font-weight="bold">${name}</text>
    ${rows}
  `;
}

const erd = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1050" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <filter id="sh3"><feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#00000020"/></filter>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#999"/>
    </marker>
  </defs>
  <rect width="1600" height="1050" fill="#f5f6fa"/>
  <rect width="1600" height="65" fill="url(#hdr3)"/>
  <text x="800" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">Modèle de Données (ERD) — VeriScan</text>
  <text x="800" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Relations entre les entités principales</text>

  <!-- fabricants -->
  ${table(30,90,'fabricants','#1565c0',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'nom_entreprise',type:'varchar'},
    {name:'email',type:'varchar'},
    {name:'telephone',type:'varchar'},
    {name:'logo',type:'varchar'},
    {name:'statut',type:'enum'},
    {name:'email_verified_at',type:'timestamp'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- abonnements -->
  ${table(30,420,'abonnements','#7b1fa2',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'nom',type:'varchar'},
    {name:'prix',type:'decimal'},
    {name:'nb_produits',type:'int'},
    {name:'nb_qrcodes',type:'int'},
    {name:'duree_jours',type:'int'},
  ])}

  <!-- souscriptions -->
  ${table(30,660,'souscriptions','#7b1fa2',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'fabricant_id',type:'bigint FK',fk:true},
    {name:'abonnement_id',type:'bigint FK',fk:true},
    {name:'date_debut',type:'date'},
    {name:'date_fin',type:'date'},
    {name:'statut',type:'enum'},
    {name:'transaction_id',type:'varchar'},
  ])}

  <!-- produits -->
  ${table(360,90,'produits','#2e7d32',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'fabricant_id',type:'bigint FK',fk:true},
    {name:'nom',type:'varchar'},
    {name:'description',type:'text'},
    {name:'categorie',type:'varchar'},
    {name:'image',type:'varchar'},
    {name:'statut',type:'enum'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- lots -->
  ${table(360,400,'lots','#f57f17',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'produit_id',type:'bigint FK',fk:true},
    {name:'numero_lot',type:'varchar'},
    {name:'date_fabrication',type:'date'},
    {name:'date_expiration',type:'date'},
    {name:'quantite',type:'int'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- qr_codes -->
  ${table(700,90,'qr_codes','#e65100',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'lot_id',type:'bigint FK',fk:true},
    {name:'produit_id',type:'bigint FK',fk:true},
    {name:'token',type:'varchar UNIQUE'},
    {name:'image_path',type:'varchar'},
    {name:'nb_scans',type:'int'},
    {name:'statut',type:'enum'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- verifications -->
  ${table(700,400,'verifications','#1565c0',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'qr_code_id',type:'bigint FK',fk:true},
    {name:'ip_address',type:'varchar'},
    {name:'latitude',type:'decimal'},
    {name:'longitude',type:'decimal'},
    {name:'resultat',type:'enum'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- signalements -->
  ${table(700,680,'signalements','#c62828',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'qr_code_id',type:'bigint FK',fk:true},
    {name:'fabricant_id',type:'bigint FK',fk:true},
    {name:'description',type:'text'},
    {name:'statut',type:'enum'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- risk_scores -->
  ${table(1040,90,'risk_scores','#880e4f',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'qr_code_id',type:'bigint FK',fk:true},
    {name:'score',type:'decimal'},
    {name:'facteurs',type:'json'},
    {name:'updated_at',type:'timestamp'},
  ])}

  <!-- admins -->
  ${table(1040,380,'admins','#37474f',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'nom',type:'varchar'},
    {name:'email',type:'varchar'},
    {name:'role',type:'enum'},
    {name:'created_at',type:'timestamp'},
  ])}

  <!-- notifications -->
  ${table(1040,590,'notifications','#00695c',[
    {name:'id',type:'bigint PK',pk:true},
    {name:'fabricant_id',type:'bigint FK',fk:true},
    {name:'type',type:'varchar'},
    {name:'data',type:'json'},
    {name:'read_at',type:'timestamp'},
  ])}

  <!-- Relation lines -->
  <!-- fabricant → produits -->
  <line x1="260" y1="175" x2="360" y2="175" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <text x="305" y="168" text-anchor="middle" fill="#666" font-size="10">1..N</text>
  <!-- fabricant → souscriptions -->
  <line x1="145" y1="714" x2="145" y2="660" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <!-- abonnements → souscriptions -->
  <line x1="145" y1="614" x2="145" y2="660" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <!-- produit → lots -->
  <line x1="475" y1="310" x2="475" y2="400" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <text x="488" y="360" fill="#666" font-size="10">1..N</text>
  <!-- lots → qr_codes -->
  <line x1="590" y1="450" x2="700" y2="180" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <!-- qr_codes → verifications -->
  <line x1="815" y1="310" x2="815" y2="400" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <text x="828" y="360" fill="#666" font-size="10">1..N</text>
  <!-- qr_codes → signalements -->
  <line x1="850" y1="310" x2="850" y2="680" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <!-- qr_codes → risk_scores -->
  <line x1="930" y1="180" x2="1040" y2="165" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <!-- fabricant → notifications -->
  <line x1="260" y1="200" x2="1040" y2="630" stroke="#999" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>

  <!-- Legend -->
  <rect x="1320" y="90" width="240" height="140" rx="8" fill="white" stroke="#ddd" stroke-width="1.5"/>
  <text x="1440" y="112" text-anchor="middle" fill="#333" font-size="12" font-weight="bold">Légende</text>
  <text x="1340" y="135" fill="#c62828" font-size="12" font-weight="bold">🔑</text>
  <text x="1360" y="135" fill="#555" font-size="11">Clé primaire</text>
  <text x="1340" y="158" fill="#1565c0" font-size="12">🔗</text>
  <text x="1360" y="158" fill="#555" font-size="11">Clé étrangère (FK)</text>
  <line x1="1335" y1="175" x2="1395" y2="175" stroke="#999" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="1410" y="179" fill="#555" font-size="11">Relation</text>
  <text x="1335" y="200" fill="#555" font-size="11">1..N = Un à plusieurs</text>
</svg>`;

savePng('03_modele_donnees_erd', erd);

// ─────────────────────────────────────────────────────────────────────────────
// 4. FLUX DE VÉRIFICATION D'UN PRODUIT
// ─────────────────────────────────────────────────────────────────────────────
function box(x,y,w,h,text,bg,border,textColor='white',sub='') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${bg}" stroke="${border}" stroke-width="2"/>
  <text x="${x+w/2}" y="${y+h/2-(sub?6:0)}" text-anchor="middle" fill="${textColor}" font-size="13" font-weight="bold">${text}</text>
  ${sub?`<text x="${x+w/2}" y="${y+h/2+12}" text-anchor="middle" fill="${textColor==='white'?'#ffffffaa':'#555'}" font-size="10">${sub}</text>`:''}`;
}
function diamond(x,y,w,h,text,bg,border) {
  const cx=x+w/2, cy=y+h/2;
  return `<polygon points="${cx},${y} ${x+w},${cy} ${cx},${y+h} ${x},${cy}" fill="${bg}" stroke="${border}" stroke-width="2"/>
  <text x="${cx}" y="${cy+5}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${text}</text>`;
}
function arrow(x1,y1,x2,y2,label='',color='#555') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" marker-end="url(#arr4)"/>
  ${label?`<text x="${(+x1+ +x2)/2+5}" y="${(+y1+ +y2)/2-5}" fill="${color}" font-size="11">${label}</text>`:''}`;
}

const verif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr4" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <marker id="arr4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#555"/>
    </marker>
  </defs>
  <rect width="900" height="1100" fill="#f8f9ff"/>
  <rect width="900" height="65" fill="url(#hdr4)"/>
  <text x="450" y="40" text-anchor="middle" fill="white" font-size="22" font-weight="bold">Flux de Vérification d'un Produit</text>
  <text x="450" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Séquence d'actions lors du scan d'un QR code VeriScan</text>

  <!-- Steps -->
  ${box(300,90,300,50,'1. Scan QR Code','#1565c0','#0d47a1','white','Visiteur scanne avec smartphone')}
  ${arrow(450,140,450,180)}
  ${box(300,180,300,50,'2. Requête HTTP GET','#37474f','#263238','white','/verify/{token}')}
  ${arrow(450,230,450,270)}
  ${diamond(300,270,300,60,'QR code\nexiste ?','#f57f17','#e65100')}
  ${arrow(450,330,450,370)}
  <!-- No path -->
  ${arrow(600,300,720,300,'Non','#c62828')}
  ${box(720,270,150,60,'Erreur 404','#c62828','#b71c1c','white','QR introuvable')}

  ${box(300,370,300,50,'3. Récupérer QR + Lot\n+ Produit + Fabricant','#2e7d32','#1b5e20','white','Eager loading Eloquent')}
  ${arrow(450,420,450,460)}
  ${diamond(300,460,300,60,'Fabricant\nsuspendu ?','#f57f17','#e65100')}
  ${arrow(450,520,450,560)}
  ${arrow(600,490,720,490,'Oui','#c62828')}
  ${box(720,460,150,60,'Accès bloqué','#c62828','#b71c1c','white','Compte suspendu')}

  ${box(300,560,300,50,'4. Enregistrer vérification','#1565c0','#0d47a1','white','IP, GPS, timestamp → DB')}
  ${arrow(450,610,450,650)}
  ${box(300,650,300,50,'5. Calculer Risk Score','#880e4f','#6a1b9a','white','Algorithme antifraude')}
  ${arrow(450,700,450,740)}
  ${diamond(300,740,300,60,'Score\nélevé ?','#f57f17','#e65100')}
  ${arrow(450,800,450,840)}
  ${arrow(600,770,720,770,'Oui','#e65100')}
  ${box(720,740,150,60,'Alerte ⚠','#ff6f00','#e65100','white','Notif fabricant')}

  ${box(300,840,300,50,'6. Afficher résultat','#2e7d32','#1b5e20','white','Page de vérification')}
  ${arrow(450,890,450,930)}
  <!-- Result branches -->
  ${box(140,930,180,60,'✓ AUTHENTIQUE','#2e7d32','#1b5e20','white','Produit valide')}
  ${box(360,930,180,60,'⚠ SUSPECT','#f57f17','#e65100','white','Risque détecté')}
  ${box(580,930,180,60,'✗ CONTREFAIT','#c62828','#b71c1c','white','Fraude détectée')}
  ${arrow(450,930,230,930)}
  ${arrow(450,930,450,930)}
  ${arrow(450,930,670,930)}

  <!-- Option: signaler -->
  ${box(300,1020,300,50,'Option: Signaler','#7b1fa2','#6a1b9a','white','Formulaire signalement')}
  ${arrow(670,990,450,1020)}
</svg>`;

savePng('04_flux_verification', verif);

// ─────────────────────────────────────────────────────────────────────────────
// 5. FLUX DE SOUSCRIPTION / PAIEMENT
// ─────────────────────────────────────────────────────────────────────────────
const payment = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 900" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr5" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <marker id="arr5" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#555"/>
    </marker>
  </defs>
  <rect width="1000" height="900" fill="#f8f9ff"/>
  <rect width="1000" height="65" fill="url(#hdr5)"/>
  <text x="500" y="40" text-anchor="middle" fill="white" font-size="22" font-weight="bold">Flux de Souscription &amp; Paiement — VeriScan</text>
  <text x="500" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Processus d'abonnement via CinetPay</text>

  <!-- Swim lanes -->
  <rect x="20" y="75" width="195" height="810" rx="0" fill="#e3f2fd" opacity="0.5"/>
  <rect x="215" y="75" width="195" height="810" rx="0" fill="#e8f5e9" opacity="0.5"/>
  <rect x="410" y="75" width="195" height="810" rx="0" fill="#fff8e1" opacity="0.5"/>
  <rect x="605" y="75" width="195" height="810" rx="0" fill="#fce4ec" opacity="0.5"/>
  <rect x="800" y="75" width="180" height="810" rx="0" fill="#f3e5f5" opacity="0.5"/>

  <text x="117" y="95" text-anchor="middle" fill="#1565c0" font-size="12" font-weight="bold">Fabricant</text>
  <text x="312" y="95" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">VeriScan Backend</text>
  <text x="507" y="95" text-anchor="middle" fill="#f57f17" font-size="12" font-weight="bold">CinetPay API</text>
  <text x="702" y="95" text-anchor="middle" fill="#c62828" font-size="12" font-weight="bold">Webhook</text>
  <text x="890" y="95" text-anchor="middle" fill="#7b1fa2" font-size="12" font-weight="bold">Base de données</text>

  <!-- Steps with horizontal swim lane connections -->
  ${[
    [120, 140, 'Choisir un plan', '#1565c0', '#0d47a1'],
  ].map(([x,y,t,bg,b]) => `<rect x="${x-90}" y="${y}" width="180" height="40" rx="6" fill="${bg}" stroke="${b}" stroke-width="1.5"/><text x="${x}" y="${y+24}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${t}</text>`).join('')}
  <line x1="207" y1="160" x2="310" y2="160" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <text x="255" y="155" text-anchor="middle" fill="#555" font-size="10">GET /paiement/checkout/{plan}</text>

  <rect x="220" y="200" width="180" height="40" rx="6" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5"/>
  <text x="310" y="224" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Afficher formulaire</text>
  <line x1="310" y1="200" x2="310" y2="160" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <line x1="310" y1="240" x2="117" y2="280" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="30" y="280" width="180" height="40" rx="6" fill="#1565c0" stroke="#0d47a1" stroke-width="1.5"/>
  <text x="120" y="304" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Valider paiement</text>
  <line x1="207" y1="300" x2="310" y2="300" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <text x="255" y="295" text-anchor="middle" fill="#555" font-size="10">POST /paiement/initier</text>

  <rect x="220" y="340" width="180" height="40" rx="6" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5"/>
  <text x="310" y="364" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Créer transaction</text>
  <line x1="310" y1="340" x2="310" y2="320" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <line x1="400" y1="360" x2="500" y2="360" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <text x="450" y="354" text-anchor="middle" fill="#555" font-size="10">initiate_payment()</text>

  <rect x="415" y="395" width="180" height="40" rx="6" fill="#f57f17" stroke="#e65100" stroke-width="1.5"/>
  <text x="505" y="419" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Rediriger vers\npage paiement</text>
  <line x1="505" y1="395" x2="505" y2="380" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <line x1="505" y1="435" x2="120" y2="460" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="30" y="460" width="180" height="40" rx="6" fill="#1565c0" stroke="#0d47a1" stroke-width="1.5"/>
  <text x="120" y="484" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Entrer carte /\nMobile Money</text>

  <line x1="505" y1="435" x2="505" y2="500" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <rect x="415" y="500" width="180" height="40" rx="6" fill="#f57f17" stroke="#e65100" stroke-width="1.5"/>
  <text x="505" y="524" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Traiter paiement</text>
  <line x1="600" y1="520" x2="700" y2="520" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="610" y="540" width="180" height="40" rx="6" fill="#c62828" stroke="#b71c1c" stroke-width="1.5"/>
  <text x="700" y="564" text-anchor="middle" fill="white" font-size="11" font-weight="bold">POST /paiement/webhook</text>
  <line x1="700" y1="540" x2="700" y2="520" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>
  <line x1="700" y1="580" x2="310" y2="600" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="220" y="600" width="180" height="50" rx="6" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5"/>
  <text x="310" y="622" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Vérifier signature</text>
  <text x="310" y="638" text-anchor="middle" fill="#a5d6a7" font-size="10">Valider statut paiement</text>
  <line x1="400" y1="625" x2="810" y2="625" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="810" y="605" width="160" height="40" rx="6" fill="#7b1fa2" stroke="#6a1b9a" stroke-width="1.5"/>
  <text x="890" y="629" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Créer souscription</text>
  <line x1="890" y1="645" x2="890" y2="670" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="810" y="670" width="160" height="40" rx="6" fill="#7b1fa2" stroke="#6a1b9a" stroke-width="1.5"/>
  <text x="890" y="694" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Activer compte</text>
  <line x1="890" y1="710" x2="310" y2="730" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="220" y="730" width="180" height="40" rx="6" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.5"/>
  <text x="310" y="754" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Envoyer email confirmé</text>
  <line x1="310" y1="770" x2="120" y2="790" stroke="#555" stroke-width="1.5" marker-end="url(#arr5)"/>

  <rect x="30" y="790" width="180" height="40" rx="6" fill="#1565c0" stroke="#0d47a1" stroke-width="1.5"/>
  <text x="120" y="814" text-anchor="middle" fill="white" font-size="11" font-weight="bold">✓ Accès Dashboard</text>
</svg>`;

savePng('05_flux_paiement', payment);

// ─────────────────────────────────────────────────────────────────────────────
// 6. DIAGRAMME DE SÉQUENCE — GÉNÉRATION QR CODE
// ─────────────────────────────────────────────────────────────────────────────
const seqQR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 820" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr6" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <marker id="arr6" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#555"/>
    </marker>
    <marker id="arr6r" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
      <path d="M8,0 L8,6 L0,3 z" fill="#1565c0"/>
    </marker>
  </defs>
  <rect width="1100" height="820" fill="#f8f9ff"/>
  <rect width="1100" height="65" fill="url(#hdr6)"/>
  <text x="550" y="40" text-anchor="middle" fill="white" font-size="22" font-weight="bold">Séquence — Génération de QR Code</text>
  <text x="550" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Interactions entre Fabricant, Système et Services</text>

  <!-- Actors header boxes -->
  ${[
    [120, 'Fabricant', '#1565c0'],
    [320, 'Browser', '#37474f'],
    [520, 'Laravel\nController', '#2e7d32'],
    [720, 'QrCodeService', '#e65100'],
    [920, 'Database', '#7b1fa2'],
  ].map(([x,t,c]) => `
    <rect x="${+x-80}" y="80" width="160" height="50" rx="8" fill="${c}" stroke="${c}" stroke-width="1.5"/>
    <text x="${x}" y="${t.includes('\n')?105:110}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${t.split('\n')[0]}</text>
    ${t.includes('\n')?`<text x="${x}" y="120" text-anchor="middle" fill="white" font-size="11">${t.split('\n')[1]}</text>`:''}
    <line x1="${x}" y1="130" x2="${x}" y2="780" stroke="${c}" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
  `).join('')}

  <!-- Sequence messages -->
  ${[
    [120,320,160,'1. Cliquer "Générer QR"','#333',false],
    [320,520,200,'2. GET /fabricant/qrcodes/create','#333',false],
    [520,320,200,'3. Formulaire création','#1565c0',true],
    [320,120,160,'4. Afficher formulaire','#1565c0',true],
    [120,320,160,'5. POST données lot/produit','#333',false],
    [320,520,200,'6. Valider requête','#333',false],
    [520,720,200,'7. generateQrCode(lot, produit)','#e65100',false],
    [720,720,0,'8. Générer token unique','#e65100',false],
    [720,720,0,'9. Créer image QR SVG','#e65100',false],
    [720,920,200,'10. Sauvegarder en DB','#7b1fa2',false],
    [920,720,200,'11. ID inséré','#7b1fa2',true],
    [720,520,200,'12. QrCode object','#2e7d32',true],
    [520,920,200,'13. Stocker image','#7b1fa2',false],
    [920,520,200,'14. Chemin fichier','#7b1fa2',true],
    [520,320,200,'15. Redirect + succès','#1565c0',true],
    [320,120,160,'16. Afficher QR code ✓','#1565c0',true],
  ].map(([x1,x2,w,label,color,ret],i) => {
    const y = 170 + i*35;
    const self = x1===x2;
    if (self) {
      return `<path d="M${x1},${y} L${x1+60},${y} L${x1+60},${y+25} L${x1},${y+25}" fill="none" stroke="${color}" stroke-width="1.5" marker-end="url(#arr6)"/>
      <text x="${x1+65}" y="${y+17}" fill="${color}" font-size="10">${label}</text>`;
    }
    const x = Math.min(x1,x2), xe = Math.max(x1,x2);
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="1.5" ${ret?'stroke-dasharray="6,3"':''} marker-end="${ret?'url(#arr6r)':'url(#arr6)'}"/>
    <text x="${(x1+x2)/2}" y="${y-5}" text-anchor="middle" fill="${color}" font-size="10">${label}</text>`;
  }).join('')}
</svg>`;

savePng('06_sequence_qrcode', seqQR);

// ─────────────────────────────────────────────────────────────────────────────
// 7. DIAGRAMME DE DÉPLOIEMENT
// ─────────────────────────────────────────────────────────────────────────────
const deploy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr7" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <filter id="sh7"><feDropShadow dx="2" dy="3" stdDeviation="5" flood-color="#00000025"/></filter>
    <marker id="arr7" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#555"/>
    </marker>
  </defs>
  <rect width="1200" height="750" fill="#f0f4ff"/>
  <rect width="1200" height="65" fill="url(#hdr7)"/>
  <text x="600" y="40" text-anchor="middle" fill="white" font-size="22" font-weight="bold">Diagramme de Déploiement — VeriScan</text>
  <text x="600" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Infrastructure de production recommandée</text>

  <!-- Client Node -->
  <rect x="30" y="110" width="220" height="200" rx="12" fill="white" stroke="#1565c0" stroke-width="2.5" filter="url(#sh7)"/>
  <rect x="30" y="110" width="220" height="35" rx="12" fill="#1565c0"/>
  <rect x="30" y="130" width="220" height="15" fill="#1565c0"/>
  <text x="140" y="133" text-anchor="middle" fill="white" font-size="13" font-weight="bold">«device» Client</text>
  <rect x="50" y="160" width="180" height="35" rx="6" fill="#e3f2fd" stroke="#1565c0" stroke-width="1"/>
  <text x="140" y="182" text-anchor="middle" fill="#1565c0" font-size="11" font-weight="bold">Browser Web</text>
  <rect x="50" y="205" width="180" height="35" rx="6" fill="#e3f2fd" stroke="#1565c0" stroke-width="1"/>
  <text x="140" y="227" text-anchor="middle" fill="#1565c0" font-size="11" font-weight="bold">App Mobile (scan)</text>
  <text x="140" y="287" text-anchor="middle" fill="#888" font-size="10">HTTPS:443</text>
  <line x1="250" y1="255" x2="350" y2="255" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr7)"/>

  <!-- Web Server Node -->
  <rect x="350" y="110" width="260" height="310" rx="12" fill="white" stroke="#2e7d32" stroke-width="2.5" filter="url(#sh7)"/>
  <rect x="350" y="110" width="260" height="35" rx="12" fill="#2e7d32"/>
  <rect x="350" y="130" width="260" height="15" fill="#2e7d32"/>
  <text x="480" y="133" text-anchor="middle" fill="white" font-size="13" font-weight="bold">«server» Web Server</text>
  <text x="480" y="158" text-anchor="middle" fill="#2e7d32" font-size="11">Nginx / Apache</text>
  <rect x="370" y="170" width="220" height="50" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1"/>
  <text x="480" y="192" text-anchor="middle" fill="#2e7d32" font-size="11" font-weight="bold">PHP-FPM 8.3</text>
  <text x="480" y="210" text-anchor="middle" fill="#555" font-size="10">Laravel 11 Application</text>
  <rect x="370" y="230" width="220" height="40" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1"/>
  <text x="480" y="255" text-anchor="middle" fill="#2e7d32" font-size="11" font-weight="bold">Queue Worker</text>
  <rect x="370" y="280" width="220" height="40" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1"/>
  <text x="480" y="305" text-anchor="middle" fill="#2e7d32" font-size="11" font-weight="bold">Scheduler (Cron)</text>
  <rect x="370" y="330" width="220" height="40" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1"/>
  <text x="480" y="355" text-anchor="middle" fill="#2e7d32" font-size="11" font-weight="bold">Storage (Disque)</text>
  <text x="480" y="368" text-anchor="middle" fill="#555" font-size="9">logos, qrcodes, pdf</text>
  <line x1="610" y1="255" x2="690" y2="255" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr7)"/>

  <!-- Database Node -->
  <rect x="690" y="110" width="220" height="180" rx="12" fill="white" stroke="#7b1fa2" stroke-width="2.5" filter="url(#sh7)"/>
  <rect x="690" y="110" width="220" height="35" rx="12" fill="#7b1fa2"/>
  <rect x="690" y="130" width="220" height="15" fill="#7b1fa2"/>
  <text x="800" y="133" text-anchor="middle" fill="white" font-size="13" font-weight="bold">«database» DB Server</text>
  <rect x="710" y="160" width="180" height="40" rx="6" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
  <text x="800" y="185" text-anchor="middle" fill="#7b1fa2" font-size="11" font-weight="bold">MySQL 8.0</text>
  <rect x="710" y="210" width="180" height="40" rx="6" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
  <text x="800" y="235" text-anchor="middle" fill="#7b1fa2" font-size="11" font-weight="bold">Redis (Cache/Queue)</text>
  <line x1="800" y1="290" x2="800" y2="330" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr7)"/>

  <!-- External APIs -->
  <rect x="690" y="360" width="220" height="200" rx="12" fill="white" stroke="#e65100" stroke-width="2.5" filter="url(#sh7)"/>
  <rect x="690" y="360" width="220" height="35" rx="12" fill="#e65100"/>
  <rect x="690" y="380" width="220" height="15" fill="#e65100"/>
  <text x="800" y="383" text-anchor="middle" fill="white" font-size="13" font-weight="bold">«external» APIs</text>
  ${['CinetPay (Paiement)','OpenAI (IA)','SMTP (Emails)','Google OAuth'].map((s,i)=>`
  <rect x="710" y="${410+i*45}" width="180" height="35" rx="6" fill="#fff3e0" stroke="#e65100" stroke-width="1"/>
  <text x="800" y="${432+i*45}" text-anchor="middle" fill="#e65100" font-size="11" font-weight="bold">${s}</text>
  `).join('')}
  <line x1="610" y1="320" x2="690" y2="360" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr7)"/>

  <!-- CDN/Static -->
  <rect x="980" y="110" width="195" height="160" rx="12" fill="white" stroke="#37474f" stroke-width="2.5" filter="url(#sh7)"/>
  <rect x="980" y="110" width="195" height="35" rx="12" fill="#37474f"/>
  <rect x="980" y="130" width="195" height="15" fill="#37474f"/>
  <text x="1077" y="133" text-anchor="middle" fill="white" font-size="13" font-weight="bold">«cdn» Static Assets</text>
  <rect x="1000" y="160" width="155" height="35" rx="6" fill="#eceff1" stroke="#37474f" stroke-width="1"/>
  <text x="1077" y="182" text-anchor="middle" fill="#37474f" font-size="11" font-weight="bold">Tailwind CSS</text>
  <rect x="1000" y="205" width="155" height="35" rx="6" fill="#eceff1" stroke="#37474f" stroke-width="1"/>
  <text x="1077" y="227" text-anchor="middle" fill="#37474f" font-size="11" font-weight="bold">Alpine.js / Vite</text>
  <line x1="910" y1="200" x2="980" y2="200" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr7)"/>

  <!-- Legend protocols -->
  <rect x="30" y="560" width="350" height="120" rx="8" fill="white" stroke="#ddd" stroke-width="1.5"/>
  <text x="205" y="582" text-anchor="middle" fill="#333" font-size="12" font-weight="bold">Protocoles de communication</text>
  <text x="50" y="605" fill="#555" font-size="11">HTTPS (TLS 1.3) → Toutes communications publiques</text>
  <text x="50" y="625" fill="#555" font-size="11">TCP/IP → Connexions base de données interne</text>
  <text x="50" y="645" fill="#555" font-size="11">WebSocket → Notifications temps réel</text>
  <text x="50" y="665" fill="#555" font-size="11">Webhook → Callbacks paiement CinetPay</text>
</svg>`;

savePng('07_deploiement', deploy);

// ─────────────────────────────────────────────────────────────────────────────
// 8. DIAGRAMME DE CLASSES SIMPLIFIÉ
// ─────────────────────────────────────────────────────────────────────────────
function classBox(x, y, name, attrs, methods, color, border) {
  const W = 240;
  const AH = attrs.length * 18 + 10;
  const MH = methods.length * 18 + 10;
  const H = 35 + AH + MH + 5;
  return `
    <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="6" fill="white" stroke="${border}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${W}" height="35" rx="6" fill="${color}"/>
    <rect x="${x}" y="${y+23}" width="${W}" height="12" fill="${color}"/>
    <text x="${x+W/2}" y="${y+22}" text-anchor="middle" fill="white" font-size="13" font-weight="bold">«model» ${name}</text>
    <line x1="${x}" y1="${y+35+AH}" x2="${x+W}" y2="${y+35+AH}" stroke="${border}" stroke-width="1"/>
    ${attrs.map((a,i)=>`<text x="${x+8}" y="${y+50+i*18}" fill="#333" font-size="10">+ ${a}</text>`).join('')}
    ${methods.map((m,i)=>`<text x="${x+8}" y="${y+35+AH+18+i*18}" fill="#555" font-size="10" font-style="italic">+ ${m}()</text>`).join('')}
  `;
}

const cls = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000" font-family="Segoe UI,Arial,sans-serif">
  <defs>
    <linearGradient id="hdr8" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a237e"/>
      <stop offset="100%" stop-color="#283593"/>
    </linearGradient>
    <filter id="sh8"><feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#00000020"/></filter>
    <marker id="arr8" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#999"/>
    </marker>
    <marker id="diam8" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
      <polygon points="6,0 12,6 6,12 0,6" fill="#555"/>
    </marker>
  </defs>
  <rect width="1500" height="1000" fill="#f8f9ff"/>
  <rect width="1500" height="65" fill="url(#hdr8)"/>
  <text x="750" y="40" text-anchor="middle" fill="white" font-size="22" font-weight="bold">Diagramme de Classes — VeriScan</text>
  <text x="750" y="58" text-anchor="middle" fill="#90caf9" font-size="13">Modèles Eloquent et leurs relations principales</text>

  ${classBox(30,90,'Fabricant',['id: bigint','nom_entreprise: string','email: string','telephone: string','statut: enum','logo: string'],['produits()','souscriptions()','signalements()','notifications()'],'#1565c0','#0d47a1')}

  ${classBox(30,460,'Abonnement',['id: bigint','nom: string','prix: decimal','nb_produits: int','nb_qrcodes: int','duree_jours: int'],['souscriptions()','isActive()'],'#7b1fa2','#6a1b9a')}

  ${classBox(30,700,'Souscription',['id: bigint','fabricant_id: FK','abonnement_id: FK','date_debut: date','date_fin: date','statut: enum'],['fabricant()','abonnement()','isExpired()'],'#880e4f','#6a1b9a')}

  ${classBox(360,90,'Produit',['id: bigint','fabricant_id: FK','nom: string','description: text','categorie: string','statut: enum'],['fabricant()','lots()','qrCodes()'],'#2e7d32','#1b5e20')}

  ${classBox(360,400,'Lot',['id: bigint','produit_id: FK','numero_lot: string','date_fabrication: date','date_expiration: date','quantite: int'],['produit()','qrCodes()'],'#f57f17','#e65100')}

  ${classBox(700,90,'QrCode',['id: bigint','lot_id: FK','produit_id: FK','token: string UNIQUE','image_path: string','nb_scans: int','statut: enum'],['lot()','produit()','verifications()','riskScore()','generatePdf()'],'#e65100','#bf360c')}

  ${classBox(700,450,'Verification',['id: bigint','qr_code_id: FK','ip_address: string','latitude: decimal','longitude: decimal','resultat: enum'],['qrCode()'],'#1565c0','#0d47a1')}

  ${classBox(700,700,'Signalement',['id: bigint','qr_code_id: FK','fabricant_id: FK','description: text','statut: enum'],['qrCode()','fabricant()'],'#c62828','#b71c1c')}

  ${classBox(1060,90,'RiskScore',['id: bigint','qr_code_id: FK','score: decimal','facteurs: json'],['qrCode()','calculate()'],'#880e4f','#6a1b9a')}

  ${classBox(1060,360,'Admin',['id: bigint','nom: string','email: string','role: enum'],['fabricants()','signalements()'],'#37474f','#263238')}

  ${classBox(1060,600,'Notification',['id: bigint','fabricant_id: FK','type: string','data: json','read_at: timestamp'],['fabricant()','markRead()'],'#00695c','#004d40')}

  <!-- Relations -->
  <!-- Fabricant 1→N Produit -->
  <line x1="270" y1="190" x2="360" y2="190" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <text x="310" y="183" text-anchor="middle" fill="#666" font-size="10">1..*</text>
  <!-- Fabricant 1→N Souscription -->
  <line x1="145" y1="380" x2="145" y2="700" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <text x="158" y="550" fill="#666" font-size="10">1..*</text>
  <!-- Abonnement 1→N Souscription -->
  <line x1="160" y1="630" x2="160" y2="700" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <!-- Produit 1→N Lot -->
  <line x1="475" y1="290" x2="475" y2="400" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <text x="488" y="350" fill="#666" font-size="10">1..*</text>
  <!-- Lot 1→N QrCode -->
  <line x1="600" y1="490" x2="700" y2="200" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <!-- QrCode 1→N Verification -->
  <line x1="820" y1="360" x2="820" y2="450" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <text x="833" y="410" fill="#666" font-size="10">1..*</text>
  <!-- QrCode 1→N Signalement -->
  <line x1="770" y1="360" x2="770" y2="700" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <!-- QrCode 1→1 RiskScore -->
  <line x1="940" y1="180" x2="1060" y2="165" stroke="#999" stroke-width="1.5" marker-end="url(#arr8)"/>
  <text x="1000" y="168" text-anchor="middle" fill="#666" font-size="10">1..1</text>
  <!-- Fabricant → Notification -->
  <line x1="270" y1="250" x2="1060" y2="660" stroke="#999" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr8)"/>
</svg>`;

savePng('08_diagramme_classes', cls);

console.log('\n✅ Tous les diagrammes générés dans:', OUT);
