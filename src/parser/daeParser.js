// src/parser/daeParser.js
import { XMLParser } from "fast-xml-parser";
import { PLATE_HEIGHT_UNIT_MM, LEGO_UP_AXIS } from '../utils/constants';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
  // Memastikan array untuk elemen-elemen yang bisa muncul berkali-kali
  arrayPropName: (name) => {
    if (name === "node" || name === "material" || name === "geometry") return name;
    return undefined; // Ini agar parser tidak secara otomatis membuat array untuk semua properti
  },
};

const parser = new XMLParser(parserOptions);

export function parseDAE(xmlText) {
  const data = parser.parse(xmlText);

  if (!data.COLLADA || !data.COLLADA.library_visual_scenes || !data.COLLADA.library_visual_scenes.visual_scene) {
    throw new Error("Invalid COLLADA DAE file structure. Missing core elements.");
  }

  const visualScene = data.COLLADA.library_visual_scenes.visual_scene;
  
  // Tangani kasus di mana hanya ada satu node visual_scene, jadi tidak otomatis menjadi array
  let nodes = visualScene.node;
  if (nodes && !Array.isArray(nodes)) {
    nodes = [nodes];
  } else if (!nodes) {
    nodes = []; // Jika tidak ada node sama sekali
  }
  
  // Parse materials and geometries for lookup
  const materials = parseMaterials(data.COLLADA.library_materials?.material);
  const geometries = parseGeometries(data.COLLADA.library_geometries?.geometry);

  const parsedBricks = [];
  for (const node of nodes) {
    // Memproses node yang mungkin bertingkat
    processNode(node, { materials, geometries }, parsedBricks);
  }

  return parsedBricks.filter(brick => brick !== null); // Filter out any nulls if node wasn't a brick
}

// Helper untuk memproses node dan sub-node secara rekursif
function processNode(node, context, results) {
  // Check if this node is an actual brick instance
  if (node.instance_geometry) {
    const brick = parseBrick(node, context);
    if (brick) {
      results.push(brick);
    }
  }

  // Handle nested nodes (groups, complex parts, etc.)
  // Pastikan node.node adalah array atau ubah menjadi array jika hanya satu
  if (node.node) {
    let subNodes = Array.isArray(node.node) ? node.node : [node.node];
    for (const subNode of subNodes) {
      processNode(subNode, context, results);
    }
  }
}

function parseMaterials(materialData) {
  const materials = {};
  if (!materialData) return materials;

  let materialArray = Array.isArray(materialData) ? materialData : [materialData];

  for (const mat of materialArray) {
    const id = mat['@_id'];
    const effectUrl = mat.instance_effect?.['@_url'];
    if (id && effectUrl) {
      // ID material di Mecabricks seringkali seperti "MB|141-material"
      // Kita hanya mengambil bagian numerik atau nama dari effect yang direferensikan
      // dan membuang #MB| dan -effect
      const effectId = effectUrl.replace('#', ''); // Hapus #
      materials[id] = effectId.replace('MB|', '').replace('-effect', ''); // Ambil ID warna
    }
  }
  return materials;
}

function parseGeometries(geometryData) {
  const geometries = {};
  if (!geometryData) return geometries;

  let geometryArray = Array.isArray(geometryData) ? geometryData : [geometryData];

  for (const geom of geometryArray) {
    const id = geom['@_id']; // e.g., "3001-mesh"
    const name = geom['@_name']; // e.g., "3001"
    if (id && name) {
      geometries[id] = name; // Map geometry ID (e.g., "3001-mesh") to its descriptive name (e.g., "3001")
    }
  }
  return geometries;
}

function parseBrick(node, context) {
  const { materials, geometries } = context;

  const instanceGeometry = node.instance_geometry;
  if (!instanceGeometry) {
    return null; // Node ini bukan instance geometri brick
  }

  const geometryUrl = instanceGeometry['@_url']; // e.g., "#3001-mesh"
  const materialUrl = instanceGeometry.bind_material?.technique_common?.instance_material?.['@_target']; // e.g., "#MB|141-material"

  const rawGeometryId = geometryUrl?.replace("#", ""); // e.g., "3001-mesh"
  const rawBrickId = geometries[rawGeometryId] || rawGeometryId.replace("-mesh", ""); // e.g., "3001"
  
  const rawMaterialId = materialUrl?.replace("#", ""); // e.g., "MB|141-material"
  const rawColorCode = materials[rawMaterialId] || rawMaterialId.replace("MB|", "").replace("-material", ""); // e.g., "141"

  // Extract transformation matrix
  
let matrixText = "";

if (typeof node.matrix === "string") {
  matrixText = node.matrix;
}
else if (typeof node.matrix === "object") {

  matrixText =
    node.matrix["#text"] ||
    node.matrix["__text"] ||
    "";
}

const matrixValues =
  matrixText
    .trim()
    .split(/\s+/)
    .map(Number);

if (
  !matrixText ||
  !matrixValues ||
  matrixValues.length !== 16
) {

  console.warn(
    "Skipping node due to invalid matrix:",
    node
  );

  return null;
}
  // COLLADA matrix is column-major. Translation is typically in elements m12, m13, m14 (indices 12, 13, 14).
  // However, your sample DAE and common Mecabricks exports often seem to use elements m3, m7, m11 (indices 3, 7, 11)
  // for the translation vector, assuming a row-major interpretation or a different internal mapping.
  // We'll stick to the observed pattern from your DAE sample:
  const x = matrixValues[3];
  const y = matrixValues[7]; // Ini adalah komponen Y untuk posisi (tinggi)
  const z = matrixValues[11];
  
  // Konversi dari milimeter (unit DAE) ke unit 'plate height'
  const layerHeightUnit = y / PLATE_HEIGHT_UNIT_MM;
  
  // Round to nearest whole number for integer layer index.
  // This effectively groups bricks that are slightly above or below the exact plate height
  // into the same conceptual layer.
  const layerIndex = Math.round(layerHeightUnit);
  console.log({
  rawBrickId,
  rawColorCode,
  x,
  y,
  z,
  layerIndex
});
  return {
    rawBrickId,       // ID geometri mentah (e.g., "3001")
    rawColorCode,     // Kode warna mentah dari material (e.g., "141")
    x,                // Koordinat X (mm)
    y,                // Koordinat Y (mm) - Ini adalah tinggi!
    z,                // Koordinat Z (mm)
    layerHeightUnit,  // Tinggi dalam unit plate (bisa float)
    layerIndex,       // Indeks layer (integer)
  };
}