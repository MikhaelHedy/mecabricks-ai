// src/engine/groupingEngine.js
import { LEGO_PART_NAMES, LEGO_COLOR_NAMES, LAYER_GROUPING_TOLERANCE } from '../utils/constants';

export function groupBricks(bricks) {
  const groupedLayers = [];
  const validBricks = bricks.filter(brick => brick !== null);

  for (const brick of validBricks) {
    const currentLayerHeight = brick.layerHeightUnit;
    let foundLayer = false;

    for (const layer of groupedLayers) {
      if (Math.abs(layer.layerBaseY - currentLayerHeight) < LAYER_GROUPING_TOLERANCE) {
        const partName = LEGO_PART_NAMES[brick.rawBrickId] || `Part ${brick.rawBrickId}`;
        const colorName = LEGO_COLOR_NAMES[brick.rawColorCode] || `Color ${brick.rawColorCode}`;
        const key = `${partName} (${colorName})`;

        if (!layer.items[key]) {
          layer.items[key] = {
            count: 0,
            partId: brick.rawBrickId,
            colorCode: brick.rawColorCode,
            positions: [], 
          };
        }
        layer.items[key].count++;
        layer.items[key].positions.push({ x: brick.x, y: brick.y, z: brick.z });
        foundLayer = true;
        break;
      }
    }

    if (!foundLayer) {
      const partName = LEGO_PART_NAMES[brick.rawBrickId] || `Part ${brick.rawBrickId}`;
      const colorName = LEGO_COLOR_NAMES[brick.rawColorCode] || `Color ${brick.rawColorCode}`;
      const key = `${partName} (${colorName})`;

      const newLayer = {
        layerBaseY: parseFloat(currentLayerHeight.toFixed(3)),
        items: {
          [key]: {
            count: 1,
            partId: brick.rawBrickId,
            colorCode: brick.rawColorCode,
            positions: [{ x: brick.x, y: brick.y, z: brick.z }],
          },
        },
      };
      groupedLayers.push(newLayer);
    }
  }

  groupedLayers.sort((a, b) => a.layerBaseY - b.layerBaseY);

  const finalGroupedOutput = {};
  groupedLayers.forEach((layer, index) => {
    finalGroupedOutput[index] = layer;
  });

  return finalGroupedOutput;
}