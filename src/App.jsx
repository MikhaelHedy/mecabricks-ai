// src/App.jsx
import React, { useState, useEffect } from 'react';
import useLegoStore from './store/useLegoStore';
import UploadBox from './components/UploadBox';
import BrickTable from './components/BrickTable';
import LegoViewer from './components/LegoViewer';
import { parseDAE } from './parser/daeParser';
import { groupBricks } from './engine/groupingEngine';
import { exportCSV } from './utils/exportCSV';

function App() {
  const { daeText, bricks, groupedBricks, isLoading, error, setDaeText, setBricks, setGroupedBricks, setLoading, setError, reset } = useLegoStore();

  useEffect(() => {
    const handleFileUploaded = (event) => {
      reset(); // Reset state sebelumnya
      setDaeText(event.detail);
    };

    window.addEventListener('daeFileUploaded', handleFileUploaded);
    return () => {
      window.removeEventListener('daeFileUploaded', handleFileUploaded);
    };
  }, [setDaeText, reset]);

  useEffect(() => {
    if (daeText) {
      setLoading(true);
      setError(null);
      try {
        const parsedBricks = parseDAE(daeText);
        setBricks(parsedBricks); // Simpan semua brick individual untuk viewer
        
        const grouped = groupBricks(parsedBricks);
        setGroupedBricks(grouped);
      } catch (err) {
        console.error("Error processing DAE file:", err);
        setError("Gagal memproses file DAE. Pastikan formatnya valid. " + err.message);
        setBricks([]);
        setGroupedBricks({});
      } finally {
        setLoading(false);
      }
    }
  }, [daeText, setBricks, setGroupedBricks, setLoading, setError]);

  const handleExport = () => {
    if (Object.keys(groupedBricks).length > 0) {
      exportCSV(groupedBricks);
    } else {
      alert("Tidak ada data untuk diekspor!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans"> {/* Added font-sans for better typography */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Mecabricks Lego Layer Counter
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Unggah file `.dae` Anda dari Mecabricks untuk menganalisis jumlah LEGO per layer.
        </p>

        <UploadBox />

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-blue-600 text-lg">Memproses file Anda...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!isLoading && !error && Object.keys(groupedBricks).length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Hasil Analisis</h2>
            
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
              >
                Export ke CSV
              </button>
            </div>

            <BrickTable grouped={groupedBricks} />

            <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6 text-center">Visualisasi 3D</h2>
            <LegoViewer allBricks={bricks} /> {/* Mengirim semua brick individual ke viewer */}
          </div>
        )}

        {!isLoading && !error && !daeText && (
            <p className="text-center text-gray-500 mt-8">Silakan unggah file .DAE untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

export default App;