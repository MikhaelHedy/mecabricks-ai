// src/engine/groupingEngine.js
import { LEGO_PART_NAMES, LEGO_COLOR_NAMES } from '../utils/constants';

export function groupBricks(bricks) {
  const grouped = {};

  const validBricks = bricks.filter(brick => brick !== null);

  for (const brick of validBricks) {
    // Gunakan layerIndex untuk grouping utama
    const currentLayerIndex = brick.layerIndex;
    if (!grouped[currentLayerIndex]) {
      grouped[currentLayerIndex] = {};
    }

    // Dapatkan nama part dan nama warna yang lebih mudah dibaca
    const partName = LEGO_PART_NAMES[brick.rawBrickId] || `Part ${brick.rawBrickId}`;
    const colorName = LEGO_COLOR_NAMES[brick.rawColorCode] || `Color ${brick.rawColorCode}`;
    
    const key = `${partName} (${colorName})`;

    if (!grouped[currentLayerIndex][key]) {
      grouped[currentLayerIndex][key] = {
        count: 0,
        partId: brick.rawBrickId,
        colorCode: brick.rawColorCode,
        positions: [], // Simpan posisi individual untuk 3D rendering
      };
    }

    grouped[currentLayerIndex][key].count++;
    grouped[currentLayerIndex][key].positions.push({ x: brick.x, y: brick.y, z: brick.z });
  }

  // Urutkan layer secara ascending (dari bawah ke atas)
  const sortedLayerKeys = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b));
  const sortedGrouped = {};
  for (const layerKey of sortedLayerKeys) {
    sortedGrouped[layerKey] = grouped[layerKey];
  }

  return sortedGrouped;
}