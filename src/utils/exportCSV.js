// src/utils/exportCSV.js
import Papa from "papaparse";
import { LEGO_PART_NAMES, LEGO_COLOR_NAMES } from './constants';

export function exportCSV(groupedData, filename = "lego-analysis.csv") {
  const rows = [["Layer #", "Base Y (mm)", "Part Name", "Color Name", "Part ID", "Color Code", "Count"]];
  const totals = {};

  Object.entries(groupedData).forEach(([idx, layer]) => {
    Object.entries(layer.items).forEach(([key, item]) => {
      rows.push([
        parseInt(idx) + 1,
        (layer.layerBaseY * 3.2).toFixed(2),
        LEGO_PART_NAMES[item.partId] || `Part ${item.partId}`,
        LEGO_COLOR_NAMES[item.colorCode] || `Color ${item.colorCode}`,
        item.partId,
        item.colorCode,
        item.count
      ]);
      totals[key] = (totals[key] || 0) + item.count;
    });
  });

  rows.push([], ["TOTAL SUMMARY"], ["Part Name (Color)", "Total Count"]);
  Object.entries(totals).forEach(([key, count]) => rows.push([key, count]));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.click();
}