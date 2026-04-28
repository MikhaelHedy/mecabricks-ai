// src/utils/exportCSV.js
import Papa from "papaparse";
import { LEGO_PART_NAMES, LEGO_COLOR_NAMES } from './constants';

export function exportCSV(groupedData, filename = "lego-summary.csv") {
  const rows = [];

  // Tambahkan header CSV
  rows.push(["Layer", "Part Name", "Color Name", "Part ID", "Color Code", "Count"]);

  // Iterasi data yang sudah digruping
  for (const layerIndex in groupedData) {
    const items = groupedData[layerIndex];
    for (const key in items) {
      const itemData = items[key];
      
      // Mengambil nama part dan warna dari lookup table
      const partName = LEGO_PART_NAMES[itemData.partId] || `Part ${itemData.partId}`;
      const colorName = LEGO_COLOR_NAMES[itemData.colorCode] || `Color ${itemData.colorCode}`;

      rows.push([
        parseInt(layerIndex) + 1, // Tampilkan layer sebagai 1-based index
        partName,
        colorName,
        itemData.partId,
        itemData.colorCode,
        itemData.count,
      ]);
    }
  }

  const csv = Papa.unparse(rows);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}