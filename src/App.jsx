// src/App.jsx
import React, { useState, useEffect } from 'react';
import UploadBox from './components/UploadBox';
import BrickTable from './components/BrickTable';
import LegoViewer from './components/LegoViewer';
import { parseDAE } from './parser/daeParser';
import { groupBricks } from './engine/groupingEngine';
import { exportCSV } from './utils/exportCSV';

export default function App() {
  const [daeText, setDaeText] = useState("");
  const [bricks, setBricks] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const handleUpload = (e) => {
      setLoading(true);
      setError(null); // Clear previous errors
      setDaeText(e.detail);
    };
    window.addEventListener('daeFileUploaded', handleUpload);
    return () => window.removeEventListener('daeFileUploaded', handleUpload);
  }, []);

  useEffect(() => {
    if (daeText) {
      try {
        const parsed = parseDAE(daeText);
        setBricks(parsed);
        setGrouped(groupBricks(parsed));
      } catch (err) {
        console.error("Error parsing DAE file:", err);
        setError("Gagal mengurai file DAE: " + err.message + ". Pastikan ini adalah file COLLADA (.dae) yang valid dari Mecabricks.");
        setBricks([]); // Clear previous bricks on error
        setGrouped({}); // Clear previous grouped data on error
      } finally {
        setLoading(false);
      }
    }
  }, [daeText]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-black text-center text-gray-900 mb-2">LEGO Layer Analyzer</h1>
        <p className="text-center text-gray-500 mb-8">Mecabricks DAE File Processor</p>
        
        <UploadBox />

        {loading && <div className="text-center py-10 text-blue-600 font-semibold">Memproses file... Ini mungkin memakan waktu untuk file besar.</div>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!loading && !error && bricks.length > 0 && (
          <div className="mt-8">
            <LegoViewer allBricks={bricks} />
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => exportCSV(grouped)} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition"
              >
                Download CSV
              </button>
            </div>
            <BrickTable grouped={grouped} />
          </div>
        )}
      </div>
    </div>
  );
}