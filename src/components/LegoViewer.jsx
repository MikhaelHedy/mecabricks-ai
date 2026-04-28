// src/components/LegoViewer.jsx
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Grid } from '@react-three/drei';
import { PLATE_HEIGHT_UNIT_MM, getBrickDimensions, LEGO_COLOR_NAMES, STUD_WIDTH_MM } from '../utils/constants';
import * as THREE from 'three'; // Import Three.js namespace

// Helper untuk mendapatkan warna Three.js dari kode warna LEGO
function getThreeColor(rawColorCode) {
  const colorName = LEGO_COLOR_NAMES[rawColorCode];
  // Ini adalah daftar CONTOH pemetaan nama warna ke hex codes
  // Anda bisa perluas atau gunakan daftar warna resmi LEGO
  switch(colorName) {
    case "Bright Green": return "#4B8B00";
    case "Bright Red": return "#FF2222";
    case "Dark Stone Grey (Dark Bluish Gray)": return "#6C6E68";
    case "Black": return "#1D2024";
    case "Light Stone Grey (Light Bluish Gray)": return "#9C9C9C";
    case "Dark Azure": return "#008F9B";
    case "Medium Azure": return "#36AECE";
    case "Flame Yellowish Orange (Bright Light Orange)": return "#FF8A00";
    case "Dark Brown": return "#3E2517";
    case "White": return "#F4F4F4";
    case "Dark Purple": return "#3C2758";
    case "Dark Tan": return "#937C63";
    case "Dark Red": return "#990000";
    case "Brick Yellow (Tan)": return "#DAAC61";
    default: return "#CCCCCC"; // Default warna abu-abu terang
  }
}

// Komponen individual brick di 3D scene
function LegoBrick({ position, brickId, colorCode }) {
  // Koordinat x,y,z dari DAE dalam milimeter.
  // Untuk visualisasi, kita skala agar lebih mudah dilihat.
  // Misal, bagi 10 untuk skala 1:10 atau sesuaikan.
  const scaleFactor = 5; // Skala agar model tidak terlalu besar/kecil di scene

  // Dapatkan dimensi brick berdasarkan ID
  const [width, height, depth] = getBrickDimensions(brickId);

  // Box di Three.js berpusat pada posisinya.
  // Koordinat Y dari DAE adalah dasar brick.
  // Jadi, kita perlu menaikkan posisi Y sebesar setengah tinggi brick agar dasarnya pas di koordinat Y dari DAE.
  const adjustedPosition = [
    position.x / scaleFactor,
    (position.y + height / 2) / scaleFactor, // Pindahkan ke atas setengah tinggi
    position.z / scaleFactor
  ];

  return (
    <Box args={[width / scaleFactor, height / scaleFactor, depth / scaleFactor]} position={adjustedPosition}>
      <meshStandardMaterial color={getThreeColor(colorCode)} />
    </Box>
  );
}

// Main 3D Viewer component
export default function LegoViewer({ allBricks }) {
  if (!allBricks || allBricks.length === 0) {
    return <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded-lg shadow-inner text-gray-500">Upload a DAE file to see the 3D model.</div>;
  }

  // Hitung bounding box untuk mengatur kamera secara otomatis (opsional)
  const boundingBox = new THREE.Box3();
  for (const brick of allBricks) {
    const [width, height, depth] = getBrickDimensions(brick.rawBrickId);
    // Asumsi posisi adalah titik tengah bawah. Three.js Box is centered.
    // Sesuaikan min/max sesuai dengan cara Anda menginterpretasikan posisi brick
    const min = new THREE.Vector3(
      (brick.x - width/2) / 5, 
      (brick.y) / 5, 
      (brick.z - depth/2) / 5
    );
    const max = new THREE.Vector3(
      (brick.x + width/2) / 5, 
      (brick.y + height) / 5, 
      (brick.z + depth/2) / 5
    ); 
    boundingBox.expandByPoint(min);
    boundingBox.expandByPoint(max);
  }
  
  // Set posisi kamera awal agar melihat keseluruhan model
  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = 60;
  const aspect = window.innerWidth / window.innerHeight; // Perlu mendapatkan aspect ratio aktual
  const distance = maxDim / (2 * Math.tan(fov * (Math.PI / 360)));
  
  const cameraPosition = new THREE.Vector3(
    center.x + distance * 1.5, // Perlu jarak pandang yang cukup
    center.y + distance * 1,
    center.z + distance * 1.5
  );

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg shadow-inner mt-6">
      <Canvas 
        camera={{ 
          position: cameraPosition, 
          fov: fov,
          near: 0.1,
          far: 2000 // Sesuaikan far plane jika model sangat besar
        }}
        // Adjust Canvas aspect ratio if necessary, e.g., if it's not full screen
        // dpr={[1, 2]} // Optional: pixel ratio for sharper image on high-res screens
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[maxDim * 2, maxDim * 2, maxDim * 2]} angle={0.3} penumbra={1} castShadow />
        <pointLight position={[-maxDim * 2, maxDim * 2, -maxDim * 2]} intensity={0.8} />

        {/* OrbitControls agar user bisa memutar model */}
        <OrbitControls target={[center.x, center.y, center.z]} />
        
        {/* Render setiap brick */}
        {allBricks.map((brick, index) => (
          <LegoBrick
            key={index}
            position={{ x: brick.x, y: brick.y, z: brick.z }}
            brickId={brick.rawBrickId}
            colorCode={brick.rawColorCode}
          />
        ))}

        {/* Grid Helper sebagai referensi lantai */}
        <Grid
          args={[200 / 5, 200 / 5]} // Ukuran grid disesuaikan skala
          cellSize={STUD_WIDTH_MM / 5} // Ukuran sel grid (1 stud disesuaikan skala)
          sectionSize={STUD_WIDTH_MM * 10 / 5} // Ukuran seksi (10 studs disesuaikan skala)
          sectionColor={"gray"}
          fadeDistance={100 / 5} // Fade distance disesuaikan skala
          position={[0, (boundingBox.min.y) - (PLATE_HEIGHT_UNIT_MM / 2), 0]} // Posisikan di bawah model, juga disesuaikan skala
          rotation={[Math.PI / 2, 0, 0]} // Rotate for horizontal grid
          infiniteGrid
        />
        {/* Tambahkan lantai padat di bawah model */}
        <Plane args={[200 / 5, 200 / 5]} rotation={[-Math.PI / 2, 0, 0]} position={[0, (boundingBox.min.y / 5) - (PLATE_HEIGHT_UNIT_MM / 5), 0]}>
          <meshStandardMaterial color="lightgray" />
        </Plane>

      </Canvas>
    </div>
  );
}