import React, { Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float, SpotLight, useProgress } from '@react-three/drei';
import { ArrowRight, ChevronRight, Layers } from 'lucide-react';

// --- 1. KOMPONEN 3D: THE LIQUID CORE ---
const LiquidCore = () => {
  // State untuk menangani responsivitas ukuran bola 3D
  const [scale, setScale] = useState(1.8);

  useEffect(() => {
    const handleResize = () => {
      // Perkecil bola di layar mobile agar tidak menutupi teks
      if (window.innerWidth < 768) {
        setScale(1.2);
      } else {
        setScale(1.8);
      }
    };

    // Set awal
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[1, 100, 100]} scale={scale}>
          <MeshDistortMaterial
            color="#1c1c1c"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.9}
            bumpScale={0.005}
            clearcoat={1}
            clearcoatRoughness={0.1}
            radius={1}
          />
        </Sphere>
      </Float>

      <ambientLight intensity={0.2} />
      
      <SpotLight
        position={[-5, 5, 5]}
        angle={0.5}
        penumbra={1}
        intensity={200}
        color="#3b82f6"
        distance={20}
      />

      <SpotLight
        position={[5, 5, 2]}
        angle={0.5}
        penumbra={1}
        intensity={100}
        color="#ffffff"
        distance={20}
      />

      <Environment preset="city" />
    </>
  );
};

// --- 2. MAIN COMPONENT ---
const LandingPage = () => {
  const { active, progress } = useProgress();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setIsLoaded(true), 500);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  return (
    // Menggunakan h-[100dvh] untuk mobile browser agar address bar tidak mengganggu layout
    <div className="relative w-full h-[100dvh] bg-[#000000] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- A. FULL SCREEN LOADER (Blocking UI) --- */}
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center gap-4">
               <div className="w-5 h-5 border border-white/20 border-t-blue-500 rounded-full animate-spin" />
               <p className="text-xs font-mono tracking-[0.2em] text-white/50 animate-pulse">
                 INITIALIZING SYSTEM... {progress.toFixed(0)}%
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- B. BACKGROUND LAYER 3D --- */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <LiquidCore />
          </Suspense>
        </Canvas>
      </div>

      {/* OVERLAY VIGNETTE */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none" />

      {/* --- C. UI LAYER --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }} 
        transition={{ duration: 1, delay: 0.2 }}
        // Padding responsif: p-6 untuk mobile, md:p-12 untuk desktop
        className="relative z-10 flex flex-col h-full justify-between p-6 md:p-12 max-w-7xl mx-auto"
      >
        
        {/* TOP NAVIGATION */}
        <nav className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/90">
            <Layers size={18} className="text-blue-500" />
            <span>TouchlessOS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <span className="hover:text-white transition-colors cursor-pointer">Product</span>
            <span className="hover:text-white transition-colors cursor-pointer">Research</span>
            <span className="hover:text-white transition-colors cursor-pointer">Changelog</span>
          </div>

          <Link to="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            Sign In
          </Link>
        </nav>

        {/* HERO CONTENT */}
        {/* mt-0 pada mobile agar tidak overlap, -mt-50px pada desktop untuk centering */}
        <div className="flex flex-col items-center text-center justify-center flex-grow mt-0 md:mt-[-50px]">
          
          <div className="mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer group max-w-[90vw] overflow-hidden">
              <span className="bg-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0">NEW</span>
              <span className="text-xs md:text-sm text-white/70 group-hover:text-white transition-colors font-medium truncate">
                Gesture Engine 2.0 Available
              </span>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>

          {/* Typography scaling: text-4xl -> text-5xl -> text-7xl -> text-8xl */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2 md:pb-4">
            Control reality.
            <br />
            <span className="text-white/40">Without touch.</span>
          </h1>

          <p className="mt-4 md:mt-6 text-sm sm:text-base md:text-xl text-neutral-400 max-w-xs sm:max-w-md mx-auto leading-relaxed font-normal">
            Orchestrate robotic movements with fluid hand gestures. 
            Precision engineering meets intuitive design.
          </p>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto relative px-8 py-3.5 bg-white text-black rounded-full font-medium text-sm transition-transform active:scale-95 hover:bg-neutral-200 flex items-center justify-center gap-2">
                Start Simulation
                <ArrowRight size={16} />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10"></div>
              </button>
            </Link>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        {/* Menggunakan flex-col-reverse pada mobile jika konten terlalu padat, atau tetap row dengan scaling text */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end border-t border-white/5 pt-6 md:pt-8 pb-4 gap-4 md:gap-0">
           <div className="hidden md:block text-xs text-neutral-500 font-medium">
             DESIGNED IN BANDUNG
           </div>
           
           {/* Grid layout untuk stats di mobile agar rapi, flex di desktop */}
           <div className="grid grid-cols-3 w-full md:w-auto gap-4 md:gap-8 justify-items-center md:justify-items-start">
             <div className="text-center md:text-left">
               <p className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Latency</p>
               <p className="text-base md:text-lg text-white font-medium tracking-tight">12ms</p>
             </div>
             <div className="text-center md:text-left">
               <p className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Accuracy</p>
               <p className="text-base md:text-lg text-white font-medium tracking-tight">99.8%</p>
             </div>
             <div className="text-center md:text-left">
               <p className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">FPS</p>
               <p className="text-base md:text-lg text-white font-medium tracking-tight">60Hz</p>
             </div>
           </div>
           
           {/* Menampilkan teks ini di bawah stats pada mobile */}
           <div className="block md:hidden text-[10px] text-neutral-600 font-medium mt-2">
             DESIGNED IN BANDUNG
           </div>
        </div>

      </motion.div>
    </div>
  );
};

export default LandingPage;