// src/components/UploadBox.jsx
import React from 'react';

export default function UploadBox() {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (e.g., max 50MB)
    const MAX_FILE_SIZE_MB = 50;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`Ukuran file melebihi batas ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = null; // Clear the input
      return;
    }

    try {
      const text = await file.text();
      window.dispatchEvent(new CustomEvent('daeFileUploaded', { detail: text }));
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Gagal membaca file: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
      <input id="dae-upload" type="file" accept=".dae, .xml" onChange={handleFileChange} className="hidden" />
      <label htmlFor="dae-upload" className="block text-blue-700 font-semibold text-lg cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6H16a4 4 0 014 4v1H6m0 0l-3-3m3 3l3-3m-3 3v4a3 3 0 003 3h15" />
        </svg>
        <span>Klik atau tarik file .DAE / .XML di sini</span>
      </label>
      <p className="text-sm text-gray-500 mt-2">Ukuran file maksimal: 50MB</p>
    </div>
  );
}