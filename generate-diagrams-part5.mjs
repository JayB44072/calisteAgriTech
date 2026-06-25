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
// 14. DIAGRAMME D'ACTIVITÉ — IRRIGATION
// ═══════════════════════════════════════════════════
const actIrrig = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/><stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C2}"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="${C1}" flood-opacity="0.15"/></filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${DARK}"/>
    </marker>
  </defs>
  <rect width="900" height="1100" fill="url(#bg)"/>
  <rect width="900" height="70" fill="url(#hdr)"/>
  <text x="450" y="28" text-anchor="middle" fill="white" font-size="20" font-weight="700">Diagramme d'Activité — Processus d'Irrigation</text>
  <text x="450" y="54" text-anchor="middle" fill="#a5f3fc" font-size="13">Déclenchement automatique via capteur IoT → exécution</text>

  <!-- SWIM LANES -->
  <rect x="20" y="80" width="260" height="990" rx="8" fill="rgba(8,145,178,0.05)" stroke="${C1}" stroke-width="1.5"/>
  <text x="150" y="105" text-anchor="middle" fill="${C1}" font-size="13" font-weight="700">Système Capteur</text>
  <rect x="300" y="80" width="280" height="990" rx="8" fill="rgba(22,163,74,0.05)" stroke="#16a34a" stroke-width="1.5"/>
  <text x="440" y="105" text-anchor="middle" fill="#16a34a" font-size="13" font-weight="700">Application (Logic)</text>
  <rect x="600" y="80" width="280" height="990" rx="8" fill="rgba(29,78,216,0.05)" stroke="${B1}" stroke-width="1.5"/>
  <text x="740" y="105" text-anchor="middle" fill="${B1}" font-size="13" font-weight="700">Supabase / Base de données</text>

  <!-- START -->
  <circle cx="150" cy="150" r="18" fill="${DARK}"/>
  <line x1="150" y1="168" x2="150" y2="210" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- 1: Lire capteur -->
  <rect x="50" y="210" width="200" height="44" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="150" y="237" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Lire données capteur</text>
  <text x="150" y="250" text-anchor="middle" fill="${GRAY}" font-size="10">(humidité, temp, heure)</text>
  <line x1="150" y1="254" x2="150" y2="294" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- 2: Decision humidité -->
  <polygon points="150,294 230,334 150,374 70,334" fill="#fff7ed" stroke="#f97316" stroke-width="2" filter="url(#sh)"/>
  <text x="150" y="330" text-anchor="middle" fill="#ea580c" font-size="11" font-weight="600">Humidité sol</text>
  <text x="150" y="346" text-anchor="middle" fill="#ea580c" font-size="11" font-weight="600">&lt; seuil ?</text>
  <!-- Yes → right -->
  <line x1="230" y1="334" x2="350" y2="334" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="285" y="326" fill="#16a34a" font-size="11" font-weight="600">Oui</text>
  <!-- No → down -->
  <line x1="150" y1="374" x2="150" y2="414" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="162" y="396" fill="#dc2626" font-size="11" font-weight="600">Non</text>

  <!-- 3: Attendre prochain cycle (No path) -->
  <rect x="50" y="414" width="200" height="40" rx="10" fill="white" stroke="${GRAY}" stroke-width="1.5" filter="url(#sh)"/>
  <text x="150" y="439" text-anchor="middle" fill="${GRAY}" font-size="12">Attendre 30 min</text>
  <line x1="150" y1="454" x2="150" y2="150" stroke="${GRAY}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="30" y="310" fill="${GRAY}" font-size="10" transform="rotate(-90,30,310)">boucle</text>

  <!-- Yes path: Vérifier plan irrigation -->
  <rect x="350" y="310" width="220" height="44" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="335" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Vérifier plan irrigation</text>
  <text x="460" y="350" text-anchor="middle" fill="${GRAY}" font-size="10">actif pour cette parcelle</text>
  <line x1="460" y1="354" x2="460" y2="394" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Decision: Plan actif? -->
  <polygon points="460,394 540,430 460,466 380,430" fill="#fef2f2" stroke="#dc2626" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="428" text-anchor="middle" fill="#dc2626" font-size="11" font-weight="600">Plan actif ?</text>
  <!-- Oui -->
  <line x1="460" y1="466" x2="460" y2="510" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="472" y="490" fill="#16a34a" font-size="11">Oui</text>
  <!-- Non -->
  <line x1="380" y1="430" x2="310" y2="430" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="330" y="420" fill="#dc2626" font-size="11">Non</text>
  <rect x="310" y="410" width="0" height="0"/>

  <!-- Créer session irrigation -->
  <rect x="350" y="510" width="220" height="44" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="535" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Créer session irrigation</text>
  <text x="460" y="550" text-anchor="middle" fill="${GRAY}" font-size="10">statut = 'en_cours'</text>
  <line x1="460" y1="554" x2="460" y2="594" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <!-- Also send to DB -->
  <line x1="570" y1="532" x2="620" y2="532" stroke="${B1}" stroke-width="1.8" marker-end="url(#arr)"/>
  <text x="591" y="523" fill="${B1}" font-size="9">INSERT</text>

  <!-- INSERT irrigation_history -->
  <rect x="620" y="510" width="240" height="44" rx="10" fill="white" stroke="${B1}" stroke-width="2" filter="url(#sh)"/>
  <text x="740" y="533" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">INSERT irrigation_history</text>
  <text x="740" y="548" text-anchor="middle" fill="${GRAY}" font-size="10">debut_at = now()</text>

  <!-- Activer pompe -->
  <rect x="350" y="594" width="220" height="44" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="619" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Activer pompe irrigation</text>
  <text x="460" y="634" text-anchor="middle" fill="${GRAY}" font-size="10">(signal IoT)</text>
  <line x1="460" y1="638" x2="460" y2="678" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Surveiller durée -->
  <rect x="350" y="678" width="220" height="44" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="703" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Surveiller durée + vol.</text>
  <text x="460" y="718" text-anchor="middle" fill="${GRAY}" font-size="10">timer actif</text>
  <line x1="460" y1="722" x2="460" y2="762" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Decision: Terminé? -->
  <polygon points="460,762 540,798 460,834 380,798" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="796" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="600">Durée atteinte</text>
  <text x="460" y="812" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="600">ou seuil OK ?</text>
  <!-- Oui -->
  <line x1="460" y1="834" x2="460" y2="874" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="472" y="856" fill="#16a34a" font-size="11">Oui</text>
  <!-- Non: boucle -->
  <line x1="380" y1="798" x2="330" y2="798" stroke="${DARK}" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="330" y1="798" x2="330" y2="700" stroke="${DARK}" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>
  <text x="315" y="755" fill="${DARK}" font-size="10" transform="rotate(-90,315,755)">Non</text>

  <!-- Arrêter pompe -->
  <rect x="350" y="874" width="220" height="44" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="899" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Arrêter pompe</text>
  <text x="460" y="914" text-anchor="middle" fill="${GRAY}" font-size="10">Mettre à jour statut</text>
  <line x1="570" y1="896" x2="620" y2="896" stroke="${B1}" stroke-width="1.8" marker-end="url(#arr)"/>
  <line x1="460" y1="918" x2="460" y2="958" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- UPDATE DB -->
  <rect x="620" y="874" width="240" height="44" rx="10" fill="white" stroke="${B1}" stroke-width="2" filter="url(#sh)"/>
  <text x="740" y="897" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">UPDATE irrigation_history</text>
  <text x="740" y="912" text-anchor="middle" fill="${GRAY}" font-size="10">fin_at, volume_m3, statut</text>

  <!-- Envoyer notification -->
  <rect x="350" y="958" width="220" height="44" rx="10" fill="white" stroke="#f97316" stroke-width="2" filter="url(#sh)"/>
  <text x="460" y="983" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Envoyer notification</text>
  <text x="460" y="998" text-anchor="middle" fill="${GRAY}" font-size="10">«Irrigation terminée»</text>
  <line x1="460" y1="1002" x2="460" y2="1050" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- END -->
  <circle cx="460" cy="1067" r="14" fill="${DARK}"/>
  <circle cx="460" cy="1067" r="20" fill="none" stroke="${DARK}" stroke-width="3"/>

  <text x="450" y="1090" text-anchor="middle" fill="${GRAY}" font-size="11">CalisteAgriTech · Processus d'Irrigation Automatique · 2025</text>
</svg>`;

toPng(actIrrig, '14_diagramme_activite_irrigation.png');

// ═══════════════════════════════════════════════════
// 15. DIAGRAMME D'ACTIVITÉ — CRÉATION PARCELLE
// ═══════════════════════════════════════════════════
const actParc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 980" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0fdf4"/><stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#15803d"/><stop offset="100%" stop-color="${B1}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#16a34a" flood-opacity="0.15"/></filter>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="${DARK}"/>
    </marker>
  </defs>
  <rect width="860" height="980" fill="url(#bg)"/>
  <rect width="860" height="68" fill="url(#hdr)"/>
  <text x="430" y="26" text-anchor="middle" fill="white" font-size="19" font-weight="700">Diagramme d'Activité — Création de Parcelle</text>
  <text x="430" y="52" text-anchor="middle" fill="#bbf7d0" font-size="13">Parcours agriculteur : formulaire → sauvegarde → activation capteurs</text>

  <!-- Swim lanes -->
  <rect x="20" y="78" width="250" height="880" rx="8" fill="rgba(22,163,74,0.05)" stroke="#16a34a" stroke-width="1.5"/>
  <text x="145" y="100" text-anchor="middle" fill="#16a34a" font-size="13" font-weight="700">Agriculteur</text>
  <rect x="290" y="78" width="260" height="880" rx="8" fill="rgba(8,145,178,0.05)" stroke="${C1}" stroke-width="1.5"/>
  <text x="420" y="100" text-anchor="middle" fill="${C1}" font-size="13" font-weight="700">Application React</text>
  <rect x="570" y="78" width="270" height="880" rx="8" fill="rgba(29,78,216,0.05)" stroke="${B1}" stroke-width="1.5"/>
  <text x="705" y="100" text-anchor="middle" fill="${B1}" font-size="13" font-weight="700">Supabase</text>

  <!-- START -->
  <circle cx="145" cy="135" r="16" fill="${DARK}"/>
  <line x1="145" y1="151" x2="145" y2="185" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Cliquer "Nouvelle parcelle" -->
  <rect x="35" y="185" width="220" height="40" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="145" y="209" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Cliquer «Nouvelle parcelle»</text>
  <line x1="255" y1="205" x2="290" y2="205" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Afficher formulaire -->
  <rect x="300" y="185" width="230" height="40" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="209" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Afficher ParcelleForm</text>
  <line x1="415" y1="225" x2="415" y2="260" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <!-- Return to user -->
  <line x1="300" y1="205" x2="255" y2="248" stroke="${DARK}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>

  <!-- Remplir champs -->
  <rect x="35" y="260" width="220" height="40" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="145" y="278" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Remplir les champs</text>
  <text x="145" y="293" text-anchor="middle" fill="${GRAY}" font-size="10">(nom, culture, surface, GPS…)</text>
  <line x1="255" y1="280" x2="300" y2="310" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Validation côté React -->
  <rect x="300" y="310" width="230" height="40" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="334" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Valider le formulaire</text>
  <line x1="415" y1="350" x2="415" y2="390" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Decision: Valide? -->
  <polygon points="415,390 495,428 415,466 335,428" fill="#fff7ed" stroke="#f97316" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="426" text-anchor="middle" fill="#ea580c" font-size="11" font-weight="600">Données</text>
  <text x="415" y="442" text-anchor="middle" fill="#ea580c" font-size="11" font-weight="600">valides ?</text>
  <!-- Non -->
  <line x1="335" y1="428" x2="270" y2="428" stroke="${DARK}" stroke-width="2"/>
  <line x1="270" y1="428" x2="270" y2="280" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="240" y="360" fill="#dc2626" font-size="11" transform="rotate(-90,240,360)">Non (erreurs)</text>
  <!-- Oui -->
  <line x1="415" y1="466" x2="415" y2="506" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="427" y="488" fill="#16a34a" font-size="11">Oui</text>

  <!-- Soumettre à Supabase -->
  <rect x="300" y="506" width="230" height="40" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="530" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">INSERT INTO parcelles</text>
  <line x1="530" y1="526" x2="570" y2="526" stroke="${B1}" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="415" y1="546" x2="415" y2="586" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Supabase: INSERT + RLS -->
  <rect x="580" y="506" width="250" height="40" rx="10" fill="white" stroke="${B1}" stroke-width="2" filter="url(#sh)"/>
  <text x="705" y="530" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Vérifier RLS + INSERT</text>

  <!-- Decision: Succès? -->
  <polygon points="415,586 495,618 415,650 335,618" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="616" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="600">Succès</text>
  <text x="415" y="632" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="600">BD ?</text>

  <!-- Oui -->
  <line x1="415" y1="650" x2="415" y2="690" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>
  <text x="427" y="672" fill="#16a34a" font-size="11">Oui</text>
  <!-- Non: Afficher erreur -->
  <line x1="495" y1="618" x2="530" y2="618" stroke="#dc2626" stroke-width="2"/>
  <rect x="530" y="598" width="60" height="40" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="560" y="621" text-anchor="middle" fill="#dc2626" font-size="10">Erreur</text>

  <!-- Naviguer vers détail -->
  <rect x="300" y="690" width="230" height="40" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="712" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Rediriger vers ParcelleDetail</text>
  <line x1="300" y1="710" x2="255" y2="740" stroke="${DARK}" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="415" y1="730" x2="415" y2="770" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Afficher succès -->
  <rect x="35" y="740" width="220" height="40" rx="10" fill="white" stroke="#16a34a" stroke-width="2" filter="url(#sh)"/>
  <text x="145" y="764" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Voir parcelle créée 🎉</text>

  <!-- Config capteurs optionnelle -->
  <rect x="300" y="770" width="230" height="40" rx="10" fill="white" stroke="#7c3aed" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="792" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Associer capteurs IoT ?</text>
  <line x1="530" y1="790" x2="570" y2="790" stroke="${B1}" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arr)"/>
  <line x1="415" y1="810" x2="415" y2="850" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Supabase: lier capteurs -->
  <rect x="580" y="770" width="250" height="40" rx="10" fill="white" stroke="${B1}" stroke-width="1.5" filter="url(#sh)"/>
  <text x="705" y="794" text-anchor="middle" fill="${DARK}" font-size="12">UPDATE sensor_devices</text>

  <!-- Fin -->
  <rect x="300" y="850" width="230" height="40" rx="10" fill="white" stroke="${C1}" stroke-width="2" filter="url(#sh)"/>
  <text x="415" y="874" text-anchor="middle" fill="${DARK}" font-size="12" font-weight="600">Notification «Parcelle créée»</text>
  <line x1="415" y1="890" x2="415" y2="930" stroke="${DARK}" stroke-width="2" marker-end="url(#arr)"/>

  <!-- END -->
  <circle cx="415" cy="945" r="13" fill="${DARK}"/>
  <circle cx="415" cy="945" r="19" fill="none" stroke="${DARK}" stroke-width="3"/>

  <text x="430" y="972" text-anchor="middle" fill="${GRAY}" font-size="11">CalisteAgriTech · Processus de Création de Parcelle · 2025</text>
</svg>`;

toPng(actParc, '15_diagramme_activite_parcelle.png');
console.log('done part5');
