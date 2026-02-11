import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Wifi, Activity, Box, Lock, Target, Layers, Command, ChevronRight, Zap, Loader2, Settings, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { drawCanvasManual } from '../utils/drawingUtils';
import { ParticleBurst } from '../components/scene/Particles';
import { Hand3D } from '../components/scene/MechHand';
import { SmartCube, SortingZone } from '../components/scene/GameElements';

const HandRobotDashboard = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // --- SETTINGS STATE ---
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('HIGH'); // 'LOW' | 'MEDIUM' | 'HIGH'

  const [activeGrabId, setActiveGrabId] = useState(null);
  const [score, setScore] = useState(0);
  const [explosions, setExplosions] = useState([]);

  const [handData, setHandData] = useState({
    landmarks: [],
    systemStatus: 'INITIALIZING...',
    confidence: 0,
    gesture: 'NONE',
    handedness: 'N/A',
    fingerTip: { x: 0, y: 0, z: 0 }
  });

  const handleScore = (position) => {
    setScore(s => s + 100);
    // Hanya tampilkan partikel jika bukan mode Low
    if (quality !== 'LOW') {
      setExplosions(prev => [...prev, { id: Date.now(), position, color: '#4ade80' }]);
    }
  };

  const handleFail = () => {
    setScore(s => Math.max(0, s - 50));
  };

  const removeExplosion = (id) => {
    setExplosions(prev => prev.filter(e => e.id !== id));
  };

  useEffect(() => {
    const initLandmarker = async () => {
      setIsLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setHandData(prev => ({ ...prev, systemStatus: 'MODEL READY' }));
        detectLoop();
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
        setHandData(prev => ({ ...prev, systemStatus: 'ERROR LOADING' }));
      } finally {
        setIsLoading(false);
      }
    };

    initLandmarker();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarkerRef.current) handLandmarkerRef.current.close();
    };
  }, []);

  const detectLoop = () => {
    if (handLandmarkerRef.current && webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const startTimeMs = performance.now();
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
            for (const landmarks of results.landmarks) {
                drawCanvasManual(ctx, landmarks, videoWidth, videoHeight);
            }
        }
        ctx.restore();
      }

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const isGripping = distance < 0.08;
        
        let handedness = 'N/A';
        let scoreVal = 0;
        if (results.handedness && results.handedness.length > 0) {
            handedness = results.handedness[0][0].categoryName === 'Right' ? 'LEFT' : 'RIGHT';
            scoreVal = Math.round(results.handedness[0][0].score * 100);
        }

        setHandData({
          landmarks: landmarks,
          systemStatus: 'TRACKING ACTIVE',
          confidence: scoreVal,
          gesture: isGripping ? 'GRIPPING' : 'OPEN HAND',
          handedness: handedness,
          fingerTip: { x: indexTip.x.toFixed(2), y: indexTip.y.toFixed(2), z: indexTip.z ? indexTip.z.toFixed(2) : '0.00' }
        });
      } else {
        setHandData(prev => ({ ...prev, systemStatus: 'SEARCHING...', landmarks: [], gesture: 'NONE' }));
      }
    }
    requestRef.current = requestAnimationFrame(detectLoop);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

  return (
    // FIX: Menggunakan h-[100dvh] agar pas di mobile browser, overflow-y-auto untuk scroll di mobile, hidden di desktop
    <div className="h-[100dvh] w-full bg-[#000000] text-white font-sans overflow-y-auto lg:overflow-hidden p-4 md:p-6 flex flex-col selection:bg-blue-500/20">
      
      {/* 1. TOP NAVIGATION BAR */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
        className="flex items-center justify-between mb-4 md:mb-6 px-2 relative shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
             <Layers size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-white">TouchlessOS</span>
            <span className="text-[10px] text-neutral-500 font-medium tracking-wide">DASHBOARD v3.2</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-neutral-500">
             <span className="text-white">Workspace</span>
             {/* Settings Trigger */}
             <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 hover:text-white transition-colors cursor-pointer ${showSettings ? 'text-white' : ''}`}
             >
                <Settings size={14} />
                Settings
             </button>
          </div>
          {/* Mobile Settings Icon */}
          <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 ${showSettings ? 'text-white' : 'text-neutral-400'}`}
             >
                <Settings size={16} />
          </button>

          <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            <Wifi size={12} className="text-emerald-400" />
            <span className="hidden md:inline text-xs font-medium text-emerald-400">Connected</span>
          </div>
        </div>

        {/* SETTINGS DROPDOWN MENU */}
        <AnimatePresence>
            {showSettings && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-12 right-0 w-64 bg-[#111] border border-white/10 rounded-xl p-4 shadow-2xl z-50 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                        <Monitor size={14} className="text-blue-400" />
                        <span className="text-xs font-semibold text-white">GRAPHICS QUALITY</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {['LOW', 'MEDIUM', 'HIGH'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setQuality(mode)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    quality === mode 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span>{mode} PERFORMANCE</span>
                                {quality === mode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-[10px] text-neutral-600 text-center">
                        {quality === 'LOW' && "Max FPS. Simple shapes. No Shadows."}
                        {quality === 'MEDIUM' && "Balanced visual & performance."}
                        {quality === 'HIGH' && "Full visuals. Raytracing effects."}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.nav>

      {/* 2. MAIN GRID LAYOUT */}
      {/* FIX: Ubah ke Flex-col di mobile, Flex-row di Desktop (lg) */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0"
      >
        {/* ASIDE: Lebar penuh di mobile, fixed width di desktop */}
        <motion.aside variants={itemVariants} className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
          
          {/* Webcam Box: Aspect Ratio menyesuaikan agar tidak terlalu tinggi di mobile */}
          <div className="relative rounded-[24px] overflow-hidden bg-white/5 border border-white/5 shadow-2xl backdrop-blur-sm aspect-video lg:aspect-[4/3] group shrink-0">
            <Webcam ref={webcamRef} className="absolute top-0 left-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" mirrored={true} />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1]" />
            <AnimatePresence>
                {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-white tracking-wider">INITIALIZING AI CORE</span>
                        <span className="text-[10px] text-blue-400 font-mono mt-1 animate-pulse">Loading WASM & GPU Delegates...</span>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
            <div className="absolute top-4 left-4 flex gap-2 z-10">
               {!isLoading && (
               <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80 flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${handData.systemStatus === 'TRACKING ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'}`} />
                 LIVE FEED
               </div>
               )}
            </div>
          </div>

          {/* Stats Container: Scrollable di desktop, full height di mobile */}
          <div className="flex-1 flex flex-col gap-3 min-h-min lg:overflow-y-auto custom-scrollbar pr-1">
            <div className="p-5 rounded-[24px] bg-gradient-to-br from-neutral-900 to-black border border-white/10 relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 p-5 opacity-10"> <Activity size={80} className="text-white" /> </div>
               <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Performance Score</p>
               <motion.div key={score} initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-semibold text-white tracking-tight"> {score.toLocaleString()} </motion.div>
               <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                 <Zap size={12} fill="currentColor" />
                 <span>Optimized ({quality})</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
               <div className={`p-4 rounded-[20px] border transition-colors duration-300 flex flex-col justify-between h-28 ${handData.gesture === 'GRIPPING' ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                 <Box size={20} className={handData.gesture === 'GRIPPING' ? 'text-white' : 'text-neutral-500'} />
                 <div>
                   <p className={`text-[10px] uppercase font-bold mb-0.5 ${handData.gesture === 'GRIPPING' ? 'text-blue-200' : 'text-neutral-500'}`}>Actuator</p>
                   <p className="text-sm font-semibold text-white tracking-wide">{handData.gesture}</p>
                 </div>
               </div>
               <div className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex flex-col justify-between h-28">
                 <Target size={20} className="text-neutral-500" />
                 <div>
                   <p className="text-[10px] uppercase font-bold text-neutral-500 mb-0.5">Accuracy</p>
                   <p className="text-sm font-semibold text-white tracking-wide">{handData.confidence}%</p>
                 </div>
               </div>
            </div>

            <div className={`px-4 py-3 rounded-full border flex items-center justify-between shrink-0 ${activeGrabId ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
               <div className="flex items-center gap-3">
                  <Lock size={14} className={activeGrabId ? 'text-amber-400' : 'text-neutral-600'} />
                  <span className={`text-xs font-medium tracking-wide ${activeGrabId ? 'text-amber-200' : 'text-neutral-500'}`}> {activeGrabId ? `OBJECT ${activeGrabId} LOCKED` : 'NO TARGET'} </span>
               </div>
               {activeGrabId && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
            </div>

            {/* LOG BOX: Fixed height di mobile (h-40) agar tidak stretch, Flex-1 di desktop */}
            <div className="h-40 lg:h-auto lg:flex-1 bg-black/40 rounded-[20px] border border-white/5 p-4 font-mono text-[10px] text-neutral-400 overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
               <div className="flex flex-col gap-1.5 h-full overflow-y-auto">
                 <div className="text-neutral-600 border-b border-white/5 pb-2 mb-1"> SYSTEM_LOG_OUTPUT </div>
                 {isLoading ? ( <span className="text-blue-400 animate-pulse pl-2"> INITIALIZING AI MODEL...</span>
                 ) : handData.landmarks.length > 0 ? (
                   <>
                     <span className="text-emerald-500 flex items-center gap-2"> <ChevronRight size={10} /> HAND_DETECTED [{handData.handedness}] </span>
                     <span className="text-neutral-500 pl-4"> COORD: {handData.fingerTip.x}, {handData.fingerTip.y} </span>
                     {handData.gesture === 'GRIPPING' && ( <span className="text-blue-400 pl-4"> !! GRIP EVENT TRIGGERED </span> )}
                   </>
                 ) : ( <span className="text-neutral-600 animate-pulse pl-2">... {handData.systemStatus}</span> )}
               </div>
            </div>
          </div>
        </motion.aside>

        {/* --- MAIN 3D VIEWPORT --- */}
        {/* FIX: Tinggi fixed di mobile agar terlihat jelas, flex-1 di desktop */}
        <motion.main 
          variants={itemVariants} 
          className="h-[500px] lg:h-auto lg:flex-1 relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-[#0a0a0a] to-black shrink-0"
        >
           <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] rounded-[32px]" />
           
           {/* PASS SHADOWS PROP BASED ON QUALITY */}
           <Canvas camera={{ position: [0, 4, 16], fov: 35 }} shadows={quality !== 'LOW'}>
              {quality !== 'LOW' && <fog attach="fog" args={['#000000', 10, 40]} />}
              <ambientLight intensity={quality === 'LOW' ? 1.0 : 0.4} />
              
              {quality !== 'LOW' && (
                  <>
                    <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" distance={50} decay={2} castShadow />
                    <pointLight position={[-10, 5, -10]} intensity={1} color="#ffffff" distance={50} decay={2} />
                    <Environment preset="city" />
                    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
                  </>
              )}

              {/* PROP QUALITY diteruskan ke komponen */}
              <SortingZone position={[-4.5, -2, 0]} color="#fbbf24" label="ZONE A" quality={quality} />
              <SortingZone position={[4.5, -2, 0]} color="#22d3ee" label="ZONE B" quality={quality} />

              <Hand3D landmarks={handData.landmarks} quality={quality} />

              <SmartCube
                id={1} startPos={[-1, 0, 0]} color="#fbbf24" targetZoneX={-1}
                landmarks={handData.landmarks} isGripping={handData.gesture === 'GRIPPING'}
                activeId={activeGrabId}
                onGrab={() => setActiveGrabId(1)}
                onRelease={() => setActiveGrabId(null)}
                onScore={handleScore}
                onFail={handleFail}
                quality={quality}
              />

              <SmartCube
                id={2} startPos={[1, 0, 0]} color="#22d3ee" targetZoneX={1}
                landmarks={handData.landmarks} isGripping={handData.gesture === 'GRIPPING'}
                activeId={activeGrabId}
                onGrab={() => setActiveGrabId(2)}
                onRelease={() => setActiveGrabId(null)}
                onScore={handleScore}
                onFail={handleFail}
                quality={quality}
              />

              {explosions.map(ex => (
                <ParticleBurst key={ex.id} position={ex.position} color={ex.color} onComplete={() => removeExplosion(ex.id)} />
              ))}

              <OrbitControls enableZoom={true} enablePan={false} minDistance={10} maxDistance={25} maxPolarAngle={Math.PI / 2 - 0.1} />
           </Canvas>

           <motion.div 
             initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}
             className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-xl w-max"
           >
              <Command size={14} className="text-neutral-400" />
              <span className="text-xs font-medium text-white tracking-wide">Mode: {quality} Quality</span>
              <div className="w-[1px] h-3 bg-white/20" />
           </motion.div>
        </motion.main>
      </motion.div>
    </div>
  );
};

export default HandRobotDashboard;