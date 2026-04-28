// src/parser/daeParser.js
import { XMLParser } from "fast-xml-parser";
import { 
  PLATE_HEIGHT_UNIT_MM, 
  createIdentityMatrix, 
  multiplyMatrices, 
  getRobustTranslationFromMatrix,
  MECABRICKS_GEOMETRY_ID_MAP, 
  MECABRICKS_EFFECT_ID_MAP    
} from '../utils/constants';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: true, 
  parseAttributeValue: true,
  
  // FIX 1 & 2: Ganti `arrayPropName` dengan `isArray` dan HAPUS `stopNodes`
  isArray: (name, jpath) => {
    return (
      name === "node" || // Node sekarang akan selalu di-parse sebagai array (jika ada lebih dari satu atau pun satu)
      name === "material" ||
      name === "geometry" ||
      name === "instance_material" || // Material instances juga harus selalu array
      jpath.endsWith("library_visual_scenes.visual_scene.node") // Pastikan root nodes juga array
    );
  },
  // FIX 1: HAPUS `stopNodes: ["*.node"]` yang menyebabkan seluruh node di-parse sebagai teks mentah.
};

const parser = new XMLParser(parserOptions);

export function parseDAE(xmlText) {
  const data = parser.parse(xmlText);
  // --- DEBUG ---
  console.log("DAE XML parsed data (COLLADA object):", data.COLLADA);
  // --- END DEBUG ---

  if (!data.COLLADA || !data.COLLADA.library_visual_scenes || !data.COLLADA.library_visual_scenes.visual_scene) {
    throw new Error("Invalid COLLADA DAE file structure: Missing required sections (COLLADA, library_visual_scenes, visual_scene).");
  }

  const visualScene = data.COLLADA.library_visual_scenes.visual_scene;
  let nodes = visualScene.node;
  // `isArray` config seharusnya sudah memastikan `nodes` selalu array.
  if (!nodes) nodes = []; 

  const materialsLookup = parseMaterials(data.COLLADA.library_materials?.material, data.COLLADA.library_effects?.effect);
  const geometriesLookup = parseGeometries(data.COLLADA.library_geometries?.geometry);

  // --- DEBUG ---
  console.log("Geometries Lookup Map:", geometriesLookup);
  console.log("Materials Lookup Map:", materialsLookup);
  // --- END DEBUG ---

  const parsedBricks = [];
  const identityMatrix = createIdentityMatrix();

  for (const node of nodes) {
    processNode(node, { materialsLookup, geometriesLookup }, parsedBricks, identityMatrix);
  }

  // --- DEBUG ---
  console.log("Final parsed bricks array:", parsedBricks);
  // --- END DEBUG ---

  return parsedBricks;
}

function processNode(node, context, results, parentAccumulatedMatrix) {
  // --- DEBUG ---
  // console.log("Processing node:", node['@_id'] || node['@_name'] || "anonymous_node");
  // --- END DEBUG ---

  let localMatrix = createIdentityMatrix();
  let matrixValue = null;

  if (node.matrix) {
      if (typeof node.matrix === "string") {
          matrixValue = node.matrix;
      } else if (typeof node.matrix === "object" && node.matrix !== null) {
          matrixValue = node.matrix["#text"] || node.matrix["__text"] || "";
      }
  }

  const localMatrixValues = matrixValue?.trim().split(/\s+/).map(Number).filter(v => !isNaN(v));
  if (localMatrixValues && localMatrixValues.length === 16) {
    localMatrix = localMatrixValues;
  }

  const currentAccumulatedMatrix = multiplyMatrices(parentAccumulatedMatrix, localMatrix);

  if (node.instance_geometry) {
    // FIX 3: Pastikan instance_geometry selalu diperlakukan sebagai array
    const instanceGeometries = Array.isArray(node.instance_geometry)
      ? node.instance_geometry
      : [node.instance_geometry]; // Jika bukan array, buat menjadi array berisi satu elemen
      
    for (const instGeom of instanceGeometries) {
        const brick = parseBrick(node, instGeom, context, currentAccumulatedMatrix);
        if (brick) results.push(brick);
    }
  }

  if (node.node) {
    // `isArray` config seharusnya sudah memastikan `node.node` selalu array.
    for (const subNode of node.node) {
      processNode(subNode, context, results, currentAccumulatedMatrix);
    }
  }
}

function parseMaterials(materialData, effectData) {
  const materialsMap = {}; 
  const effectsMap = {}; 

  if (effectData) {
    let effectArray = Array.isArray(effectData) ? effectData : [effectData];
    for (const eff of effectArray) {
      const effectId = eff['@_id'];
      if (!effectId) continue;

      let resolvedColorCode = null;
      // Ensure effectId is string before using .match()
      const colorMatch = String(effectId).match(/MB\|(\d+)-effect/); 
      if (colorMatch) {
        resolvedColorCode = colorMatch[1];
      } 
      else if (MECABRICKS_EFFECT_ID_MAP[effectId]) { 
        resolvedColorCode = MECABRICKS_EFFECT_ID_MAP[effectId];
      }
      
      if (resolvedColorCode) {
        effectsMap[effectId] = resolvedColorCode;
      } else {
        // --- DEBUG ---
        console.warn(`[parseMaterials] Could not resolve color code for effect ID: ${effectId}.`);
        // --- END DEBUG ---
      }
    }
  }

  if (materialData) {
    let materialArray = Array.isArray(materialData) ? materialData : [materialData];
    for (const mat of materialArray) {
      const id = mat['@_id'];
      const instanceEffect = mat.instance_effect;
      const effectUrl = instanceEffect?.['@_url'];
      
      if (id && effectUrl) {
        const effectId = effectUrl.replace('#', '');
        if (effectsMap[effectId]) {
          materialsMap[id] = effectsMap[effectId]; 
        } else {
          // --- DEBUG ---
          console.warn(`[parseMaterials] No resolved effect found for material ID: ${id} (effect URL: ${effectUrl}). Skipping material mapping.`);
          // --- END DEBUG ---
        }
      } else {
        // --- DEBUG ---
        console.warn(`[parseMaterials] Missing ID or instance_effect for material data:`, mat);
        // --- END DEBUG ---
      }
    }
  }
  return materialsMap;
}

function parseGeometries(geometryData) {
  const geometriesMap = {}; 
  if (!geometryData) return geometriesMap;
  let geometryArray = Array.isArray(geometryData) ? geometryData : [geometryData];

  for (const geom of geometryArray) {
    const id = geom['@_id'];   
    const name = geom['@_name']; 

    if (!id) {
        // --- DEBUG ---
        console.warn(`[parseGeometries] Geometry element missing ID:`, geom);
        // --- END DEBUG ---
        continue;
    }

    let resolvedPartId = null;

    // 1. Try to extract from geometry 'name' attribute
    if (name !== undefined && name !== null) {
        const nameAsString = String(name);
        const nameMatch = nameAsString.match(/(\d+)(?:-\d+)?(?:\.json)?/); 
        if (nameMatch) {
            resolvedPartId = nameMatch[1];
        }
    }
    
    // 2. Fallback: Try to extract from geometry 'id' attribute
    if (!resolvedPartId && id !== undefined && id !== null) {
        const idAsString = String(id);
        const idMatch = idAsString.match(/geom_(\d+)(?:-\d+)?/); 
        if (idMatch) {
            resolvedPartId = idMatch[1];
        }
    }

    // 3. Fallback: Use custom map for known descriptive IDs
    if (!resolvedPartId && MECABRICKS_GEOMETRY_ID_MAP[id]) {
      resolvedPartId = MECABRICKS_GEOMETRY_ID_MAP[id];
    }
    
    if (resolvedPartId) {
      geometriesMap[id] = resolvedPartId;
    } else {
      // --- DEBUG ---
      console.warn(`[parseGeometries] Could not resolve part ID for geometry ID: ${id} (name: ${name}).`);
      // --- END DEBUG ---
    }
  }
  return geometriesMap;
}

function parseBrick(node, instanceGeometry, context, accumulatedMatrix) {
  const { materialsLookup, geometriesLookup } = context;
  
  const geometryUrl = instanceGeometry['@_url'];
  if (!geometryUrl) {
    // --- DEBUG ---
    console.warn(`[parseBrick] instance_geometry missing URL:`, instanceGeometry);
    // --- END DEBUG ---
    return null;
  }

  const rawGeometryId = geometryUrl.replace("#", ""); 
  const rawBrickId = geometriesLookup[rawGeometryId];

  // --- DEBUG ---
  // console.log(`[parseBrick] Processing geometry ID: ${rawGeometryId}, Resolved Part ID: ${rawBrickId}`);
  // --- END DEBUG ---

  if (!rawBrickId) {
    console.warn(`[parseBrick] Part ID not found in lookup for geometry ID: ${rawGeometryId}. Skipping brick.`);
    return null;
  }

  let instanceMaterial = instanceGeometry.bind_material?.technique_common?.instance_material;
  // `isArray` config seharusnya sudah memastikan `instance_material` selalu array, ambil elemen pertama
  if (Array.isArray(instanceMaterial)) instanceMaterial = instanceMaterial[0];
  const materialUrl = instanceMaterial?.['@_target'];

  const rawMaterialId = materialUrl?.replace("#", ""); 
  let rawColorCode = materialsLookup[rawMaterialId]; // Biarkan `let` karena akan diubah

  // --- DEBUG ---
  // console.log(`[parseBrick] Processing material ID: ${rawMaterialId}, Resolved Color Code: ${rawColorCode}`);
  // --- END DEBUG ---

  // FIX 7: Jangan discard brick jika warna tidak ditemukan, gunakan warna default
  if (!rawColorCode) {
    console.warn(`[parseBrick] Color code not found in lookup for material ID: ${rawMaterialId}. Using default color 'Medium Stone Grey (Light Bluish Gray)' (code 194).`);
    rawColorCode = "194"; // Default ke Medium Stone Grey (kode 194)
  }

  const { x, y, z } = getRobustTranslationFromMatrix(accumulatedMatrix);
  
  // FIX 4: Tambahkan rounding untuk presisi tinggi layer
  const layerHeightUnit = Math.round((z / PLATE_HEIGHT_UNIT_MM) * 1000) / 1000; // Round ke 3 desimal

  return { rawBrickId, rawColorCode, x, y, z, layerHeightUnit };
}