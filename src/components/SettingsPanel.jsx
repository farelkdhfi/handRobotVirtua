import React from 'react';
import { X, Smartphone, Monitor, Cpu, Eye, EyeOff, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DEFINISI PRESET KUALITAS ---
export const GRAPHICS_PRESETS = {
  LOW: {
    label: 'Battery Saver',
    dpr: 0.75,           // Resolusi rendah
    shadows: false,      // Matikan bayangan
    geometry: 'box',     // Geometri KOTAK sederhana
    material: 'basic',   // Material tanpa cahaya (paling ringan)
    particles: false     // Matikan partikel
  },
  MEDIUM: {
    label: 'Balanced',
    dpr: 1,
    shadows: false,
    geometry: 'detail',
    material: 'standard', // Material standar bereaksi thd cahaya
    particles: true
  },
  HIGH: {
    label: 'Ultra',
    dpr: 1.5,            // Resolusi tajam
    shadows: true,       // Bayangan aktif
    geometry: 'high-poly',
    material: 'physical', // Material berat (kilap/metal)
    particles: true
  }
};

const SettingsPanel = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  // Fungsi helper untuk update state
  const handleChange = (key, value) => {
    onUpdateSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">System Settings</h2>
                  <p className="text-xs text-neutral-400">Graphic & Performance Configuration</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6">
              
              {/* 1. VIEW MODE (2D vs 3D) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rendering Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleChange('viewMode', '3D')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.viewMode === '3D' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'}`}
                  >
                    <Layers size={24} />
                    <span className="text-xs font-medium">3D Immersive</span>
                  </button>
                  <button 
                    onClick={() => handleChange('viewMode', '2D')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.viewMode === '2D' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'}`}
                  >
                    <Monitor size={24} />
                    <span className="text-xs font-medium">2D Debug / Fast</span>
                  </button>
                </div>
              </div>

              {/* 2. GRAPHICS QUALITY (Hanya aktif jika mode 3D) */}
              {settings.viewMode === '3D' && (
                <div className="space-y-3">
                   <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Graphics Quality</label>
                   <div className="flex bg-white/5 p-1 rounded-xl">
                      {Object.keys(GRAPHICS_PRESETS).map((level) => (
                        <button
                          key={level}
                          onClick={() => handleChange('quality', level)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                            settings.quality === level 
                              ? 'bg-neutral-700 text-white shadow-lg' 
                              : 'text-neutral-500 hover:text-white'
                          }`}
                        >
                          {GRAPHICS_PRESETS[level].label}
                        </button>
                      ))}
                   </div>
                   <p className="text-[10px] text-neutral-500 text-center">
                     {settings.quality === 'HIGH' ? 'Enables shadows & high-res rendering (GPU Heavy).' : 
                      settings.quality === 'LOW' ? 'Disables effects for maximum FPS.' : 'Standard balanced mode.'}
                   </p>
                </div>
              )}

              {/* 3. TOGGLES */}
              <div className="space-y-3">
                 <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Overlays</label>
                 
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                       <Eye size={18} className="text-neutral-400" />
                       <span className="text-sm text-neutral-300">Show Skeleton</span>
                    </div>
                    <button 
                      onClick={() => handleChange('showSkeleton', !settings.showSkeleton)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${settings.showSkeleton ? 'bg-blue-500' : 'bg-neutral-700'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.showSkeleton ? 'left-6' : 'left-1'}`} />
                    </button>
                 </div>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
               <button 
                 onClick={onClose}
                 className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors"
               >
                 Apply Changes
               </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;