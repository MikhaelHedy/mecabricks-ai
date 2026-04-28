// src/components/BrickTable.jsx
import React from 'react';
import { PLATE_HEIGHT_UNIT_MM, LEGO_PART_NAMES, LEGO_COLOR_NAMES, getPartCategory } from '../utils/constants';

export default function BrickTable({ grouped }) {
  if (Object.keys(grouped).length === 0) return <p className="text-gray-500 text-center py-4">Data kosong.</p>;

  const totalBrickCounts = {}; // Agregat "Part Name (Color)"
  const categoryTotals = { // Agregat berdasarkan jenis
    "Brick": 0,
    "Plate": 0,
    "Tile": 0,
    "Door": 0,
    "Window": 0,
    "Minifigure Part": 0,
    "Round Element": 0,
    "Other": 0,
    "Grand Total": 0,
  };

  // Iterasi melalui data yang dikelompokkan SEKALI untuk mengisi totalBrickCounts dan categoryTotals
  Object.entries(grouped).forEach(([layerIndex, layerData]) => {
    Object.entries(layerData.items).forEach(([key, item]) => {
      // Mengisi totalBrickCounts (logika yang sudah ada)
      totalBrickCounts[key] = (totalBrickCounts[key] || 0) + item.count;

      // Mengisi categoryTotals (logika baru)
      const partName = LEGO_PART_NAMES[item.partId] || `Part ${item.partId}`;
      const category = getPartCategory(partName); // Menggunakan fungsi pembantu

      // Pastikan kategori ada di categoryTotals sebelum menambahkan
      if (categoryTotals[category] !== undefined) {
        categoryTotals[category] += item.count;
      } else {
        // Jika ada kategori baru dari getPartCategory yang tidak diinisialisasi, tambahkan
        categoryTotals[category] = item.count;
      }
      
      categoryTotals["Grand Total"] += item.count;
    });
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ringkasan per Layer</h2>
      {Object.entries(grouped).map(([layerIndex, layerData]) => (
        <div key={layerIndex} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700">Layer {parseInt(layerIndex) + 1}</h3>
          <p className="text-sm text-gray-400 mb-3">Tinggi Dasar: {(layerData.layerBaseY * PLATE_HEIGHT_UNIT_MM).toFixed(2)}mm</p>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(layerData.items).map(([key, data]) => (
              <li key={key} className="text-gray-700">
                {key}: <strong className="text-blue-600">{data.count}</strong> pcs
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="mt-10 pt-6 border-t-2">
        <h2 className="text-2xl font-bold text-gray-800">Total Keseluruhan (per Jenis & Warna)</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
          {Object.entries(totalBrickCounts).map(([key, count]) => (
            <li key={key} className="bg-gray-50 p-2 rounded border text-sm">
              {key}: <strong className="text-purple-600">{count}</strong> pcs
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 pt-6 border-t-2">
        <h2 className="text-2xl font-bold text-gray-800">Ringkasan Kategori</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
          {Object.entries(categoryTotals).map(([category, count]) => (
            <li key={category} className="bg-gray-50 p-2 rounded border text-sm">
              {category}: <strong className="text-pink-600">{count}</strong> pcs
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}