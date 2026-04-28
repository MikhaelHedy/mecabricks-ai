// src/utils/constants.js

// Tinggi 1 Plate LEGO dalam milimeter (standard)
export const PLATE_HEIGHT_UNIT_MM = 3.2; 
// Tinggi 1 Brick LEGO dalam milimeter (standard) (3 plates = 1 brick)
export const BRICK_HEIGHT_UNIT_MM = 9.6; 

// Dimensi dasar 1 stud LEGO dalam milimeter (standard)
export const STUD_WIDTH_MM = 8;
export const STUD_DEPTH_MM = 8;

// Tolerance untuk membandingkan nilai floating point untuk tinggi layer
// 0.5mm is chosen to allow for minor floating point inaccuracies while still
// differentiating distinct layers (a plate is 3.2mm).
export const LAYER_GROUPING_TOLERANCE = 0.5; 

// --- Custom Mappings for the provided example DAE file ---
// These map the *descriptive* IDs in the example DAE to standard LEGO Part/Color IDs.
// In a real Mecabricks DAE, these would usually be numerical from the start.
export const MECABRICKS_GEOMETRY_ID_MAP = {
  "geom_plate_1x2_0": "3023", // Mapped to standard Plate 1x2 ID
  "geom_brick_2x2_0": "3003", // Mapped to standard Brick 2x2 ID
};

export const MECABRICKS_EFFECT_ID_MAP = {
  "eff_red": "21",      // Mapped to standard LEGO Red (color code 21)
  "eff_blue": "140",    // Mapped to Earth Blue (Dark Blue) - from existing list
  "eff_green": "141",   // Mapped to Earth Green (Dark Green) - from existing list
};
// --- End Custom Mappings ---

// Lookup table untuk ID part LEGO ke nama (Sinkron dengan CSV & DAE)
export const LEGO_PART_NAMES = {
  // Common Bricks (from CSV & general knowledge)
  "3001": "Brick 2x4",
  "3003": "Brick 2x2", 
  "3004": "Brick 1x2",
  "3010": "Brick 1x4",
  "43802": "Brick 8x8", 
  "44237": "Brick 2x6", 
  "3005": "Brick 1x1", 
  "3007": "Brick 2x8", 
  "3009": "Brick 2x6", 

  // Common Plates (from CSV & general knowledge)
  "3023": "Plate 1x2", 
  "3710": "Plate 1x4", 
  "3020": "Plate 2x4", 
  "3029": "Plate 4x12",
  "3031": "Plate 4x4",
  "3032": "Plate 4x6",
  "4282": "Plate 2x16",
  "3028": "Plate 6x12",

  // Other common elements
  "3065": "Tile 1x2",
  "60592": "Plate, Round 1x1", 
  "60608": "Window 1x2x2",
  "60593": "Window 1x4x6",
  "60594": "Door 1x4x6",
  "60596": "Door Frame 1x4x6",
  "60623": "Minifig Head",
};

// Lookup table untuk kode warna Mecabricks (ID numerik) ke nama (Sinkron dengan CSV & DAE)
export const LEGO_COLOR_NAMES = {
  "1": "White",
  "4": "Red", 
  "5": "Brick Yellow (Tan)",
  "21": "Red", 
  "23": "Blue", 
  "26": "Black",
  "28": "Green", 
  "106": "Bright Orange",
  "119": "Bright Yellowish Green (Lime)",
  "124": "Bright Reddish Violet (Dark Purple)", 
  "140": "Earth Blue (Dark Blue)", 
  "141": "Earth Green (Dark Green)", 
  "192": "Reddish Brown",
  "199": "Dark Stone Grey (Dark Bluish Gray)",
  "268": "Medium Lilac (Dark Purple)",
  "308": "Dark Brown",
  "322": "Medium Azur",
  "353": "Vibrant Coral (Bright Pink)",
  "402": "Reddish Orange (Dark Orange)",
  "194": "Medium Stone Grey (Light Bluish Gray)",
  "226": "Bright Yellow",
  "422": "Medium Stone Grey (Light Bluish Gray)", 
};

// Mecabricks DAE explicitly states Z_UP.
export const LEGO_UP_AXIS = 'Z_UP'; 

// Fungsi Helper untuk Dimensi Brick
export function getBrickDimensions(brickId) {
  switch (String(brickId)) { 
    // Bricks
    case "3001": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; 
    case "3003": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; 
    case "3004": return [STUD_WIDTH_MM, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; 
    case "3005": return [STUD_WIDTH_MM, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM]; 
    case "3010": return [STUD_WIDTH_MM, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; 
    case "3007": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 8]; 
    case "3009": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 6]; 
    case "43802": return [STUD_WIDTH_MM * 8, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 8]; 
    case "44237": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 6]; 

    // Plates
    case "3023": return [STUD_WIDTH_MM, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; 
    case "3710": return [STUD_WIDTH_MM, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; 
    case "3020": return [STUD_WIDTH_MM * 2, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; 
    case "3029": return [STUD_WIDTH_MM * 4, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 12]; 
    case "3031": return [STUD_WIDTH_MM * 4, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; 
    case "3032": return [STUD_WIDTH_MM * 4, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 6]; 
    case "4282": return [STUD_WIDTH_MM * 2, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 16]; 
    case "3028": return [STUD_WIDTH_MM * 6, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 12]; 

    // Other parts
    case "60592": return [STUD_WIDTH_MM, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM]; 
    case "60608": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM * 2, STUD_DEPTH_MM]; 
    case "60593": return [STUD_WIDTH_MM * 4, BRICK_HEIGHT_UNIT_MM * 6, STUD_DEPTH_MM]; 
    case "60594": return [STUD_WIDTH_MM * 4, BRICK_HEIGHT_UNIT_MM * 6, STUD_DEPTH_MM]; 
    case "60596": return [STUD_WIDTH_MM * 4, BRICK_HEIGHT_UNIT_MM * 6, STUD_DEPTH_MM]; 
    case "60623": return [STUD_WIDTH_MM * 1.5, BRICK_HEIGHT_UNIT_MM * 1.5, STUD_DEPTH_MM * 1.5]; 
    case "3065": return [STUD_WIDTH_MM, PLATE_HEIGHT_UNIT_MM / 2, STUD_DEPTH_MM * 2]; 
    
    default: 
      console.warn(`Unknown brick ID: ${brickId}. Using default dimensions (Brick 2x2).`);
      return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; 
  }
}

// Matrix Utility Functions
export function createIdentityMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function multiplyMatrices(a, b) {
  let c = createIdentityMatrix();
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
  let b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
  let b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
  let b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

  c[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
  c[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
  c[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
  c[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

  c[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
  c[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
  c[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
  c[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

  c[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
  c[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
  c[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
  c[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

  c[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
  c[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
  c[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
  c[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
  return c;
}

export function getRobustTranslationFromMatrix(matrix) {
  let x = matrix[12], y = matrix[13], z = matrix[14];

  if ((x === 0 && y === 0 && z === 0) && (matrix[3] !== 0 || matrix[7] !== 0 || matrix[11] !== 0)) {
    x = matrix[3]; 
    y = matrix[7]; 
    z = matrix[11]; 
  }
  return { x, y, z }; 
}

// Fungsi pembantu untuk mengkategorikan part LEGO berdasarkan namanya
export function getPartCategory(partName) {
  partName = String(partName).toLowerCase(); 
  if (partName.includes("door")) return "Door";
  if (partName.includes("window")) return "Window";
  if (partName.includes("plate")) return "Plate";
  if (partName.includes("brick")) return "Brick";
  if (partName.includes("tile")) return "Tile"; 
  if (partName.includes("minifig")) return "Minifigure Part"; 
  if (partName.includes("round")) return "Round Element"; 
  return "Other"; 
}