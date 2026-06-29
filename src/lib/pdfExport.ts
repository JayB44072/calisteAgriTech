import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Parcelle } from '../types/database';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const BRAND = {
  green: [22, 163, 74] as [number, number, number],
  teal: [8, 145, 178] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const SITE_NAME = 'AgriTech';
const SITE_TAGLINE = 'Plateforme Smart Farm SaaS';

function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  const W = doc.internal.pageSize.getWidth();

  // Gradient-like header via two rectangles
  doc.setFillColor(...BRAND.green);
  doc.rect(0, 0, W, 32, 'F');
  doc.setFillColor(...BRAND.teal);
  doc.rect(W * 0.6, 0, W * 0.4, 32, 'F');

  // Site name
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(SITE_NAME, 14, 13);

  // Tagline
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(SITE_TAGLINE, 14, 19);

  // Date in top-right
  doc.setFontSize(8);
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(dateStr, W - 14, 13, { align: 'right' });

  // Report title below header
  doc.setTextColor(...BRAND.dark);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 44);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND.gray);
    doc.text(subtitle, 14, 51);
  }

  // Decorative line
  doc.setDrawColor(...BRAND.green);
  doc.setLineWidth(0.8);
  doc.line(14, 55, W - 14, 55);
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...BRAND.lightGray);
  doc.setLineWidth(0.3);
  doc.line(14, H - 14, W - 14, H - 14);

  doc.setFontSize(7);
  doc.setTextColor(...BRAND.gray);
  doc.setFont('helvetica', 'normal');
  doc.text(`© ${new Date().getFullYear()} ${SITE_NAME} — Document confidentiel`, 14, H - 8);
  doc.text(`Page ${pageNum} / ${totalPages}`, W - 14, H - 8, { align: 'right' });
}

function addFootersToAllPages(doc: jsPDF) {
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(doc, i, total);
  }
}

// ─── KPI card (small colored box) ─────────────────────────────────────────────
function kpiBox(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  doc.setFillColor(255, 255, 255, 0.15);

  doc.setTextColor(...BRAND.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + w / 2, y + h / 2 + 1, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + w / 2, y + h - 4, { align: 'center' });
}

// ─── Report: Parcelles ────────────────────────────────────────────────────────
export function exportParcellesPDF(parcelles: Parcelle[], userName?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  const totalSuperficie = parcelles.reduce((s, p) => s + (p.superficie || 0), 0);
  const activeCount = parcelles.filter(p => p.statut === 'active').length;
  const irrigatedCount = parcelles.filter(p => p.irrigation_active).length;

  drawHeader(doc, 'Rapport des Parcelles', userName ? `Exploitation de ${userName}` : undefined);

  // KPI boxes
  const kpiY = 60;
  const kpiW = (W - 28 - 9) / 4;
  kpiBox(doc, 14, kpiY, kpiW, 22, 'Parcelles', String(parcelles.length), BRAND.green);
  kpiBox(doc, 14 + kpiW + 3, kpiY, kpiW, 22, 'Superficie totale', `${totalSuperficie.toFixed(1)} ha`, BRAND.teal);
  kpiBox(doc, 14 + (kpiW + 3) * 2, kpiY, kpiW, 22, 'Actives', String(activeCount), [34, 197, 94]);
  kpiBox(doc, 14 + (kpiW + 3) * 3, kpiY, kpiW, 22, 'Irriguées', String(irrigatedCount), [6, 182, 212]);

  // Table
  const rows = parcelles.map(p => [
    p.nom,
    p.culture || '—',
    p.variete || '—',
    `${p.superficie} ${p.unite}`,
    p.zone || '—',
    p.statut === 'active' ? 'Active' :
    p.statut === 'en_preparation' ? 'Préparation' :
    p.statut === 'archivee' ? 'Archivée' : 'Inactive',
    p.irrigation_active ? 'Oui' : 'Non',
    p.type_sol || '—',
  ]);

  autoTable(doc, {
    startY: kpiY + 28,
    head: [['Parcelle', 'Culture', 'Variété', 'Superficie', 'Zone', 'Statut', 'Irrigation', 'Sol']],
    body: rows,
    headStyles: { fillColor: BRAND.green, textColor: BRAND.white, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: BRAND.dark },
    alternateRowStyles: { fillColor: BRAND.lightGray },
    columnStyles: {
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      // Color statut cell
      if (data.section === 'body' && data.column.index === 5) {
        const statut = data.cell.raw as string;
        const color = statut === 'Active' ? [220, 252, 231] :
                      statut === 'Préparation' ? [219, 234, 254] :
                      statut === 'Archivée' ? [254, 243, 199] : [241, 245, 249];
        doc.setFillColor(...(color as [number, number, number]));
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(...BRAND.dark);
        doc.setFontSize(8);
        doc.text(statut, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
      }
    },
  });

  // Détail par parcelle
  let yPos = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.dark);
  doc.text('Détail des parcelles', 14, yPos);
  yPos += 6;

  for (const p of parcelles) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // Card-like box
    const cardH = 28;
    doc.setFillColor(...BRAND.lightGray);
    doc.roundedRect(14, yPos, W - 28, cardH, 2, 2, 'F');

    // Accent bar
    doc.setFillColor(...BRAND.green);
    doc.roundedRect(14, yPos, 3, cardH, 1, 1, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.dark);
    doc.text(p.nom, 21, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray);

    const col1X = 21;
    const col2X = W / 2;

    doc.text(`Culture : ${p.culture || '—'}  |  Variété : ${p.variete || '—'}  |  ${p.superficie} ${p.unite}`, col1X, yPos + 13);
    doc.text(`Sol : ${p.type_sol || '—'}  |  pH : ${p.ph_sol ?? '—'}  |  Drainage : ${p.drainage || '—'}`, col1X, yPos + 19);
    doc.text(`Irrigation : ${p.type_irrigation || '—'}  |  Source : ${p.source_eau || '—'}`, col2X, yPos + 13);
    if (p.date_semis) doc.text(`Semis : ${new Date(p.date_semis).toLocaleDateString('fr-FR')}`, col2X, yPos + 19);
    if (p.adresse) doc.text(`📍 ${p.adresse}`, col1X, yPos + 24.5);

    yPos += cardH + 4;
  }

  addFootersToAllPages(doc);
  doc.save(`caliste-parcelles-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Report: Tableau de bord (synthèse) ───────────────────────────────────────
export function exportDashboardPDF(data: {
  parcelles: Parcelle[];
  userName?: string;
  sensorSummary?: { temperature?: number; humidite_sol?: number; humidite_air?: number };
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  drawHeader(doc, 'Rapport de Tableau de Bord', data.userName ? `Exploitation de ${data.userName}` : undefined);

  const totalSup = data.parcelles.reduce((s, p) => s + (p.superficie || 0), 0);
  const actives = data.parcelles.filter(p => p.statut === 'active').length;

  const kpiY = 60;
  const kpiW = (W - 28 - 6) / 3;

  kpiBox(doc, 14, kpiY, kpiW, 22, 'Parcelles actives', String(actives), BRAND.green);
  kpiBox(doc, 14 + kpiW + 3, kpiY, kpiW, 22, 'Superficie', `${totalSup.toFixed(1)} ha`, BRAND.teal);
  kpiBox(doc, 14 + (kpiW + 3) * 2, kpiY, kpiW, 22, 'Cultures', String(new Set(data.parcelles.map(p => p.culture)).size), [139, 92, 246]);

  let y = kpiY + 30;

  // Sensor summary
  if (data.sensorSummary) {
    const s = data.sensorSummary;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.dark);
    doc.text('Données capteurs (dernière lecture)', 14, y);
    y += 6;

    const sensorW = (W - 28 - 6) / 3;
    if (s.temperature != null)
      kpiBox(doc, 14, y, sensorW, 18, 'Température', `${s.temperature.toFixed(1)} °C`, [239, 68, 68]);
    if (s.humidite_sol != null)
      kpiBox(doc, 14 + sensorW + 3, y, sensorW, 18, 'Humidité sol', `${s.humidite_sol.toFixed(1)} %`, BRAND.teal);
    if (s.humidite_air != null)
      kpiBox(doc, 14 + (sensorW + 3) * 2, y, sensorW, 18, 'Humidité air', `${s.humidite_air.toFixed(1)} %`, [99, 102, 241]);
    y += 24;
  }

  // Répartition cultures
  const cultures: Record<string, number> = {};
  for (const p of data.parcelles) {
    cultures[p.culture || 'Non défini'] = (cultures[p.culture || 'Non défini'] || 0) + p.superficie;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.dark);
  doc.text('Répartition par culture', 14, y + 4);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Culture', 'Superficie (ha)', 'Part (%)']],
    body: Object.entries(cultures).map(([c, sup]) => [
      c,
      sup.toFixed(2),
      `${((sup / totalSup) * 100).toFixed(1)} %`,
    ]),
    headStyles: { fillColor: BRAND.teal, textColor: BRAND.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: BRAND.lightGray },
    margin: { left: 14, right: 14 },
  });

  // Parcelles list
  y = (doc as any).lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: y,
    head: [['Parcelle', 'Culture', 'Superficie', 'Statut', 'Irrigation']],
    body: data.parcelles.map(p => [
      p.nom, p.culture || '—', `${p.superficie} ${p.unite}`,
      p.statut === 'active' ? 'Active' : p.statut === 'en_preparation' ? 'Préparation' : p.statut === 'archivee' ? 'Archivée' : 'Inactive',
      p.irrigation_active ? '✓' : '✗',
    ]),
    headStyles: { fillColor: BRAND.green, textColor: BRAND.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: BRAND.lightGray },
    columnStyles: { 3: { halign: 'center' }, 4: { halign: 'center' } },
    margin: { left: 14, right: 14 },
  });

  addFootersToAllPages(doc);
  doc.save(`caliste-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Report: Parcelle individuelle ────────────────────────────────────────────
export function exportParcellePDF(parcelle: Parcelle, sensorData?: { temperature?: number; humidite_sol?: number; humidite_air?: number }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  drawHeader(doc, parcelle.nom, `Rapport de parcelle — ${parcelle.culture || 'Culture non définie'}`);

  let y = 62;

  // Statut badge
  const statutColor = parcelle.statut === 'active' ? BRAND.green : parcelle.statut === 'en_preparation' ? [59, 130, 246] as [number,number,number] : BRAND.gray;
  doc.setFillColor(...statutColor);
  doc.roundedRect(14, y, 30, 7, 2, 2, 'F');
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const statutLabel = parcelle.statut === 'active' ? 'ACTIVE' : parcelle.statut === 'en_preparation' ? 'PRÉPARATION' : parcelle.statut === 'archivee' ? 'ARCHIVÉE' : 'INACTIVE';
  doc.text(statutLabel, 29, y + 4.5, { align: 'center' });
  y += 12;

  // Info grid
  const sectionBox = (title: string, items: [string, string][], startY: number, x = 14, w = (W - 28)) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.green);
    doc.text(title.toUpperCase(), x, startY);
    startY += 3;
    doc.setDrawColor(...BRAND.green);
    doc.setLineWidth(0.3);
    doc.line(x, startY, x + w, startY);
    startY += 4;

    for (const [label, val] of items) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.gray);
      doc.text(label + ' :', x, startY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND.dark);
      doc.text(val, x + 40, startY);
      startY += 6;
    }
    return startY + 2;
  };

  const half = (W - 31) / 2;
  const col1 = 14;
  const col2 = 14 + half + 3;

  const endY1 = sectionBox('Informations générales', [
    ['Superficie', `${parcelle.superficie} ${parcelle.unite}`],
    ['Zone', parcelle.zone || '—'],
    ['Adresse', parcelle.adresse || '—'],
  ], y, col1, half);

  const endY2 = sectionBox('Culture', [
    ['Plante', parcelle.culture || '—'],
    ['Variété', parcelle.variete || '—'],
    ['Date semis', parcelle.date_semis ? new Date(parcelle.date_semis).toLocaleDateString('fr-FR') : '—'],
    ['Récolte prévue', parcelle.date_recolte_estimee ? new Date(parcelle.date_recolte_estimee).toLocaleDateString('fr-FR') : '—'],
  ], y, col2, half);

  y = Math.max(endY1, endY2) + 2;

  const endY3 = sectionBox('Sol', [
    ['Type de sol', parcelle.type_sol || '—'],
    ['pH', parcelle.ph_sol != null ? String(parcelle.ph_sol) : '—'],
    ['Drainage', parcelle.drainage || '—'],
    ['Fertilité', parcelle.fertilite || '—'],
  ], y, col1, half);

  const endY4 = sectionBox('Irrigation', [
    ['Type', parcelle.type_irrigation || '—'],
    ['Source eau', parcelle.source_eau || '—'],
    ['Statut', parcelle.irrigation_active ? 'Active' : 'Inactif'],
  ], y, col2, half);

  y = Math.max(endY3, endY4) + 4;

  // Sensor data if available
  if (sensorData) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.green);
    doc.text('DONNÉES CAPTEURS (DERNIÈRE LECTURE)', 14, y);
    y += 3;
    doc.setDrawColor(...BRAND.green);
    doc.setLineWidth(0.3);
    doc.line(14, y, W - 14, y);
    y += 6;

    const kpiW = (W - 28 - 6) / 3;
    if (sensorData.temperature != null)
      kpiBox(doc, 14, y, kpiW, 18, 'Température', `${sensorData.temperature.toFixed(1)} °C`, [239, 68, 68]);
    if (sensorData.humidite_sol != null)
      kpiBox(doc, 14 + kpiW + 3, y, kpiW, 18, 'Humidité sol', `${sensorData.humidite_sol.toFixed(1)} %`, BRAND.teal);
    if (sensorData.humidite_air != null)
      kpiBox(doc, 14 + (kpiW + 3) * 2, y, kpiW, 18, 'Humidité air', `${sensorData.humidite_air.toFixed(1)} %`, [99, 102, 241]);
  }

  addFootersToAllPages(doc);
  doc.save(`caliste-parcelle-${parcelle.nom.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
