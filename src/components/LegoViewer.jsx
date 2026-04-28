// src/components/LegoViewer.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Grid } from '@react-three/drei';
import { 
  PLATE_HEIGHT_UNIT_MM, 
  getBrickDimensions, 
  LEGO_COLOR_NAMES, 
  STUD_WIDTH_MM,
  LEGO_UP_AXIS 
} from '../utils/constants';
import * as THREE from 'three'; // <--- FIX: Perbaikan typo import

function getThreeColor(rawColorCode) {
  const colorName = LEGO_COLOR_NAMES[rawColorCode];
  // Expanded color list with more accurate hex codes for LEGO colors.
  const colors = {
    "White": "#F4F4F4", 
    "Brick Yellow (Tan)": "#DAAC61", 
    "Black": "#1D2024",
    "Red": "#E44B27", 
    "Blue": "#0057A6", 
    "Green": "#008A27", 
    "Bright Orange": "#FF8A00", 
    "Bright Yellowish Green (Lime)": "#B6D606",
    "Bright Reddish Violet (Dark Purple)": "#3C2758", 
    "Earth Blue (Dark Blue)": "#003399", 
    "Earth Green (Dark Green)": "#004B00", 
    "Reddish Brown": "#937C63",
    "Dark Stone Grey (Dark Bluish Gray)": "#6C6E68", 
    "Medium Lilac (Dark Purple)": "#800080", 
    "Dark Brown": "#3E2517", 
    "Medium Azur": "#36AECE", 
    "Vibrant Coral (Bright Pink)": "#FF69B4", 
    "Reddish Orange (Dark Orange)": "#D95600", 
    "Bright Yellow": "#FBD441",
    "Medium Stone Grey (Light Bluish Gray)": "#9C9C9C"
  };
  return colors[colorName] || "#CCCCCC"; 
}

function LegoBrick({ position, brickId, colorCode, scaleFactor }) {
  const [width, height, depth] = getBrickDimensions(brickId);

  // Mecabricks DAE uses Z_UP (X=width, Y=depth, Z=height).
  // Three.js uses Y_UP (X=width, Y=height, Z=depth).
  // Therefore, DAE's Z becomes Three.js's Y (height).
  // And DAE's Y becomes Three.js's Z (depth).
  const vizX = position.x;
  const vizY = position.z; // DAE's Z is height, becomes Three.js Y
  const vizZ = position.y; // DAE's Y is depth, becomes Three.js Z

  // Three.js Box origin is at its center. Lego bricks' origin is at their bottom center.
  // To align, we shift the brick up by half its height along the new Y (height) axis.
  const threeJsPosition = [
    vizX / scaleFactor, 
    (vizY + height / 2) / scaleFactor, 
    vizZ / scaleFactor
  ];

  return (
    <Box 
      args={[width / scaleFactor, height / scaleFactor, depth / scaleFactor]} 
      position={threeJsPosition}
    >
      <meshStandardMaterial color={getThreeColor(colorCode)} />
    </Box>
  );
}

export default function LegoViewer({ allBricks }) {
  if (!allBricks || allBricks.length === 0) {
    return <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Upload DAE file untuk melihat visualisasi 3D.</div>;
  }

  const scaleFactor = 5; 
  const boundingBox = new THREE.Box3();
  const tempVector = new THREE.Vector3();

  // Calculate bounding box in Three.js coordinates (Y_UP)
  allBricks.forEach(brick => {
    const [width, height, depth] = getBrickDimensions(brick.rawBrickId);
    
    // Convert DAE (X, Y_depth, Z_height) to Three.js (X, Y_height, Z_depth) for bounding box calculation
    const threeJsX = brick.x;
    const threeJsY_height = brick.z; 
    const threeJsZ_depth = brick.y; 

    // Brick's base is at (threeJsX, threeJsY_height, threeJsZ_depth) in Three.js coordinates.
    // Expand bounding box for min/max corners of the brick.
    boundingBox.expandByPoint(tempVector.set(
      (threeJsX - width / 2) / scaleFactor, 
      threeJsY_height / scaleFactor, 
      (threeJsZ_depth - depth / 2) / scaleFactor
    ));
    boundingBox.expandByPoint(tempVector.set(
      (threeJsX + width / 2) / scaleFactor, 
      (threeJsY_height + height) / scaleFactor, 
      (threeJsZ_depth + depth / 2) / scaleFactor
    ));
  });
  
  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  
  // FIX: Tambahkan nilai minimum untuk cameraDistance agar tidak menjadi 0
  const cameraDistance = Math.max(maxDim * 2, 50 / scaleFactor); // Minimum 50mm, disesuaikan dengan scaleFactor

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg shadow-inner mt-6 overflow-hidden">
      <Canvas camera={{ 
        position: [center.x + cameraDistance, center.y + cameraDistance, center.z + cameraDistance], 
        fov: 50 
      }}>
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[center.x + cameraDistance, center.y + cameraDistance, center.z + cameraDistance]} 
          angle={0.3} 
          castShadow 
        />
        <OrbitControls target={[center.x, center.y, center.z]} />
        {allBricks.map((brick, index) => (
          <LegoBrick 
            key={index} 
            brickId={brick.rawBrickId} 
            colorCode={brick.rawColorCode} 
            position={{x: brick.x, y: brick.y, z: brick.z}} 
            scaleFactor={scaleFactor} 
          />
        ))}
        {/*
          // DEBUG NOTE: Grid dan Plane ini kadang bisa menyebabkan silent WebGL crash pada Drei versi tertentu.
          // Jika visualisasi 3D tetap blank, coba comment kedua komponen ini untuk diagnostik.
        */}
        <Grid 
          cellSize={STUD_WIDTH_MM / scaleFactor} 
          sectionSize={STUD_WIDTH_MM * 5 / scaleFactor} 
          fadeDistance={50} 
          infiniteGrid 
          position={[0, boundingBox.min.y, 0]} 
        />
        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, boundingBox.min.y - 0.1, 0]}>
          <meshStandardMaterial color="#e0e0e0" />
        </Plane>
      </Canvas>
    </div>
  );
}