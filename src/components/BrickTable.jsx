// src/components/BrickTable.jsx
import React from 'react';
import { PLATE_HEIGHT_UNIT_MM } from '../utils/constants';

export default function BrickTable({ grouped }) {
  if (Object.keys(grouped).length === 0) {
    return <p className="text-gray-500 text-center py-4">Tidak ada brick yang terdeteksi atau file kosong.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ringkasan LEGO per Layer</h2>
      {Object.entries(grouped).map(
        ([layerIndex, items]) => (
          <div key={layerIndex} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Layer {parseInt(layerIndex) + 1}</h3>
            <p className="text-sm text-gray-500 mb-3">
              Tinggi kisaran (Y): {parseFloat(layerIndex * PLATE_HEIGHT_UNIT_MM).toFixed(2)}mm - {parseFloat(((parseInt(layerIndex) + 1) * PLATE_HEIGHT_UNIT_MM) - 0.01).toFixed(2)}mm
            </p>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(items).map(
                ([key, data]) => (
                  <li key={key} className="text-gray-700">
                    {key}: <strong className="font-medium text-blue-600">{data.count}</strong> pieces
                  </li>
                )
              )}
            </ul>
          </div>
        )
      )}
    </div>
  );
}