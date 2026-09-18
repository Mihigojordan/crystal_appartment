import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportPdf(filename, title, columns, rows) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [columns.map((col) => col.label)],
    body: rows.map((row) => columns.map((col) => String(col.value(row) ?? ''))),
    headStyles: { fillColor: [255, 106, 61] },
    styles: { fontSize: 9 },
  });

  doc.save(filename);
}
