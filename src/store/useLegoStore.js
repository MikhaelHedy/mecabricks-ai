// src/store/useLegoStore.js
import { create } from 'zustand';

const useLegoStore = create((set) => ({
  daeText: null,
  bricks: [],          // Semua individual brick yang di-parse dari DAE
  groupedBricks: {},   // Brick yang sudah dikelompokkan per layer dan jenis
  isLoading: false,
  error: null,

  setDaeText: (text) => set({ daeText: text }),
  setBricks: (bricks) => set({ bricks: bricks }),
  setGroupedBricks: (grouped) => set({ groupedBricks: grouped }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: error }),

  // Reset semua state
  reset: () => set({ daeText: null, bricks: [], groupedBricks: {}, isLoading: false, error: null }),
}));

export default useLegoStore;