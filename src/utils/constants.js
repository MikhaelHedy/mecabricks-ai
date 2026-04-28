// src/utils/constants.js

// Tinggi 1 Plate LEGO dalam milimeter (standard)
export const PLATE_HEIGHT_UNIT_MM = 3.2; 
// Tinggi 1 Brick LEGO dalam milimeter (standard)
export const BRICK_HEIGHT_UNIT_MM = 9.6; 

// Dimensi dasar 1 stud LEGO dalam milimeter
export const STUD_WIDTH_MM = 8;
export const STUD_DEPTH_MM = 8;

// Lookup table untuk ID part LEGO ke nama yang mudah dibaca
// LENGKAPI INI SESUAI DENGAN FILE DAE ANDA!
// Anda bisa mendapatkan 'ID' dari atribut 'name' di tag <geometry> yang di-referensikan.
// Misalnya, jika <geometry id="3001-mesh" name="3001">, maka ID-nya adalah "3001".
export const LEGO_PART_NAMES = {
  "3001": "Brick 2x4",
  "3003": "Brick 2x2",
  "3004": "Brick 1x2",
  "3005": "Brick 1x1",
  "3006": "Brick 2x10",
  "3008": "Brick 1x8",
  "3010": "Brick 1x4",
  "3020": "Plate 2x4",
  "3021": "Plate 2x3",
  "3022": "Plate 2x2",
  "3023": "Plate 1x2",
  "3024": "Plate 1x1",
  "3034": "Plate 2x8",
  "3039": "Slope 45 2x2",
  "3040": "Slope 45 2x1",
  // Tambahkan lebih banyak ID brick dan nama yang sesuai dari analisis file DAE Anda
};

// Lookup table untuk kode warna Mecabricks ke nama warna yang mudah dibaca
// Kode warna ini diambil dari atribut '@_target' di <instance_material>
// dan kemudian dari ID 'effect' yang direferensikan (contoh: "141" dari "#MB|141-material").
export const LEGO_COLOR_NAMES = {
  "119": "Bright Green",
  "353": "Bright Red",
  "140": "Dark Stone Grey (Dark Bluish Gray)",
  "141": "Black", 
  "199": "Light Stone Grey (Light Bluish Gray)",
  "268": "Dark Azure",
  "322": "Medium Azure",
  "106": "Flame Yellowish Orange (Bright Light Orange)",
  "308": "Dark Brown",
  "26": "Black", 
  "1": "White",
  "124": "Dark Purple",
  "192": "Dark Tan",
  "402": "Dark Red",
  "5": "Brick Yellow (Tan)",
  // Tambahkan lebih banyak ID warna dan nama yang sesuai dari analisis file DAE Anda
};

// Mecabricks DAE default to Y_UP axis
export const LEGO_UP_AXIS = 'Y_UP'; 

// Fungsi helper untuk mendapatkan dimensi brick berdasarkan ID
// Ini akan digunakan untuk visualisasi 3D. Sesuaikan 'args' di Three.js Box.
export function getBrickDimensions(brickId) {
  // Asumsi: 1 stud = 8mm
  switch (brickId) {
    case "3001": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; // Brick 2x4
    case "3003": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; // Brick 2x2
    case "3004": return [STUD_WIDTH_MM, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; // Brick 1x2
    case "3005": return [STUD_WIDTH_MM, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM]; // Brick 1x1

    case "3020": return [STUD_WIDTH_MM * 2, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 4]; // Plate 2x4
    case "3021": return [STUD_WIDTH_MM * 2, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 3]; // Plate 2x3
    case "3022": return [STUD_WIDTH_MM * 2, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; // Plate 2x2
    case "3023": return [STUD_WIDTH_MM, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; // Plate 1x2
    case "3024": return [STUD_WIDTH_MM, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM]; // Plate 1x1
    case "3034": return [STUD_WIDTH_MM * 2, PLATE_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 8]; // Plate 2x8
    
    case "3039": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM * 2, STUD_DEPTH_MM * 2]; // Slope 45 2x2 (perlu dicek tinggi sebenarnya)
    case "3040": return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM * 1, STUD_DEPTH_MM * 1]; // Slope 45 2x1 (perlu dicek tinggi sebenarnya)
    
    // Default dimensions for unknown bricks to avoid errors in 3D viewer
    default: return [STUD_WIDTH_MM * 2, BRICK_HEIGHT_UNIT_MM, STUD_DEPTH_MM * 2]; // Default ke ukuran Brick 2x2
  }
}