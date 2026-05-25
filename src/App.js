import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Play, RotateCcw, Activity, Info, Disc, Cpu, ArrowRight, BookOpen, TrendingUp, Check, ChevronRight, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Disk Scheduling Simulator
 * 
 * This application simulates various disk scheduling algorithms used in Operating Systems.
 * It visualizes the head movement on a 200-track disk (0-199).
 * Now features an gorgeous academic landing page explaining the concepts
 * before jumping into the simulator dashboard.
 */

export default function App() {
  // Navigation view state: 'landing' or 'dashboard'
  const [view, setView] = useState('landing');
  
  // Dashboard states
  const [tracksInput, setTracksInput] = useState('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState(53);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  // Landing Page Interactive Widget states
  const [widgetAlgo, setWidgetAlgo] = useState('SSTF'); // 'FCFS' or 'SSTF'
  const [widgetCurrentHead, setWidgetCurrentHead] = useState(50);
  const widgetSequencePreset = [30, 160, 45, 120, 85];
  const [widgetAnimatedTrack, setWidgetAnimatedTrack] = useState(50);
  const [widgetStep, setWidgetStep] = useState(0);
  const [widgetIsRunning, setWidgetIsRunning] = useState(false);

  // Parse input string into an array of numbers
  const parseTracks = () => {
    return tracksInput
      .split(',')
      .map(t => parseInt(t.trim()))
      .filter(t => !isNaN(t) && t >= 0 && t <= 199);
  };

  const runFCFS = () => {
    const requestedTracks = parseTracks();
    const sequence = [initialHead, ...requestedTracks];
    let totalMovement = 0;
    for (let i = 1; i < sequence.length; i++) {
      totalMovement += Math.abs(sequence[i] - sequence[i - 1]);
    }
    setResult({
      algorithm: 'FCFS (First-Come, First-Served)',
      sequence,
      totalMovement,
      color: '#4F46E5' // Indigo matching landing page
    });
  };

  const runSSTF = () => {
    const requestedTracks = parseTracks();
    const pending = [...requestedTracks];
    const sequence = [initialHead];
    let currentHead = initialHead;
    let totalMovement = 0;

    /**
     * Shortest Seek Time First (SSTF) reasoning:
     * 1. Start from the initial head position.
     * 2. Browse the pending requests to find the track closest to the current head.
     *    "Closest" means the minimum absolute difference: min(|track - currentHead|).
     * 3. Move the head to that closest track.
     * 4. Add the movement to the total and remove the track from the pending list.
     * 5. Repeat until all requests are satisfied.
     */
    while (pending.length > 0) {
      let minDistance = Infinity;
      let closestIndex = -1;

      for (let i = 0; i < pending.length; i++) {
        const distance = Math.abs(pending[i] - currentHead);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      if (closestIndex === -1) break; // Safety break

      const nextTrack = pending.splice(closestIndex, 1)[0];
      totalMovement += minDistance;
      sequence.push(nextTrack);
      currentHead = nextTrack;
    }

    setResult({
      algorithm: 'SSTF (Shortest Seek Time First)',
      sequence,
      totalMovement,
      color: '#10B981' // Green
    });
  };

  const clearSimulation = () => {
    setResult(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    if (view === 'dashboard' && result && canvasRef.current) {
      drawChart(result);
    }
  }, [result, view]);

  // Hook for the landing page interactive widget movement simulation
  useEffect(() => {
    let interval = null;
    if (widgetIsRunning) {
      const getWidgetSequence = () => {
        if (widgetAlgo === 'FCFS') {
          return [50, 30, 160, 45, 120, 85];
        } else {
          // SSTF path starting at 50 for [30, 160, 45, 120, 85]
          // 45 is closest (diff 5) -> head=45
          // 30 is closest (diff 15) -> head=30
          // 85 is closest (diff 55) -> head=85
          // 120 is closest (diff 35) -> head=120
          // 160 is closest (diff 40) -> head=160
          return [50, 45, 30, 85, 120, 160];
        }
      };
      const seq = getWidgetSequence();
      
      interval = setInterval(() => {
        setWidgetStep(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= seq.length) {
            setWidgetIsRunning(false);
            return 0;
          }
          setWidgetAnimatedTrack(seq[nextIndex]);
          return nextIndex;
        });
      }, 1000);
    } else {
      setWidgetAnimatedTrack(50);
      setWidgetStep(0);
    }
    return () => clearInterval(interval);
  }, [widgetIsRunning, widgetAlgo]);

  const drawChart = (simResult) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set sizes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const trackWidth = (width - padding * 2) / 199;
    const stepHeight = (height - padding * 2) / (simResult.sequence.length - 1 || 1);

    // Draw grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = padding + ((width - padding * 2) / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw main axis line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(width - padding, padding);
    ctx.stroke();

    // Axis tick indicators
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 199; i += 20) {
      const x = padding + i * trackWidth;
      ctx.fillText(i.toString(), x, padding - 10);
      ctx.beginPath();
      ctx.moveTo(x, padding - 4);
      ctx.lineTo(x, padding);
      ctx.stroke();
    }

    // Draw the seek movement line
    ctx.strokeStyle = simResult.color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    simResult.sequence.forEach((track, index) => {
      const x = padding + track * trackWidth;
      const y = padding + index * stepHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw nodes and labels
    simResult.sequence.forEach((track, index) => {
      const x = padding + track * trackWidth;
      const y = padding + index * stepHeight;

      // Draw active node drop shadow circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = simResult.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Mini center dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = simResult.color;
      ctx.fill();

      // Track label styling
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = track > 185 ? 'right' : track < 15 ? 'left' : 'center';
      ctx.fillText(track.toString(), x, y - 10);
      
      // Step index badge
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = track > 185 ? 'left' : 'right';
      ctx.fillText(`#${index}`, track > 185 ? x - 15 : x + 15, y + 3);
    });
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' ? (
        <motion.div
          key="landing-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white"
        >
          {/* Main Hero & Copy */}
          <div className="max-w-6xl w-full mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
            
            {/* Left Block: Information & Launch */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider">
                  <Cpu size={14} className="animate-spin-slow" /> Storage Subsystem Lab v1.2
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent leading-none">
                  Disk Scheduling <br />
                  <span className="text-indigo-400">OS Simulator</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light max-w-xl">
                  An advanced interactive companion for studying lower-level disk access mechanics, seek path optimization, and rotational delay reduction.
                </p>
              </div>

              {/* Action and Metrics */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setView('dashboard')}
                  className="group relative flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    Launch Simulator <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <div className="text-slate-500 text-xs font-mono hidden sm:block border-l border-slate-800 pl-4 py-1">
                  TRACK ENVELOPE: <span className="text-slate-300 font-bold">0 - 199</span><br />
                  LATENCY METRIC: <span className="text-indigo-400 font-bold">SEEK DISTANCE</span>
                </div>
              </div>

              {/* Feature Highlights Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Interactive Seek Line charts</h3>
                    <p className="text-xs text-slate-500 leading-normal">Instantly trace the read/write nozzle movement vector over 200 addressable tracks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Detailed Head Travel Sums</h3>
                    <p className="text-xs text-slate-500 leading-normal">Quantify and compare structural efficiency dynamically during operations.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Block: Live Interactive Conceptual Preset Comparison Widget */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/60 p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">Interactive Preview</h3>
                  <p className="text-sm font-bold text-slate-200">Comparison Sandbox</p>
                </div>
                <Disc size={20} className="text-indigo-400 animate-spin-slow" />
              </div>

              {/* Dynamic Preset Track Visualizer Map */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-2">
                    <span>Track 0</span>
                    <span className="text-indigo-400 font-bold">Head: {widgetAnimatedTrack}</span>
                    <span>Track 199</span>
                  </div>

                  {/* Micro Visual Slider Track */}
                  <div className="h-6 bg-slate-950 rounded border border-slate-800 relative flex items-center overflow-hidden">
                    {/* Tick Lines */}
                    <div className="absolute inset-x-0 inset-y-0 opacity-10 flex justify-between pointer-events-none">
                      {[1,2,3,4,5,6,7,8,9].map(p => <div key={p} className="w-px h-full bg-white" style={{ left: `${p*10}%` }}></div>)}
                    </div>

                    {/* Pending Preset requested node points */}
                    {widgetSequencePreset.map((p, idx) => (
                      <div
                        key={idx}
                        className={`absolute w-1.5 h-1.5 rounded-full z-10 -translate-x-1/2 transition-colors duration-300 ${
                          widgetAnimatedTrack === p ? 'bg-amber-400 scale-150 ring-2 ring-amber-400/40' : 'bg-slate-700'
                        }`}
                        style={{ left: `${(p / 199) * 100}%` }}
                        title={`Target: ${p}`}
                      />
                    ))}

                    {/* Head position indicator */}
                    <motion.div
                      animate={{ left: `${(widgetAnimatedTrack / 199) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                      className="absolute w-3 h-3 bg-indigo-400 rounded-sm -translate-x-1/2 ring-4 ring-indigo-500/30 z-20 flex items-center justify-center text-[7px]"
                    />
                  </div>
                </div>

                {/* Algorithm Toggle buttons in preview */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setWidgetAlgo('FCFS'); setWidgetIsRunning(false); }}
                    className={`px-3 py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      widgetAlgo === 'FCFS'
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    FCFS Pattern
                  </button>
                  <button
                    onClick={() => { setWidgetAlgo('SSTF'); setWidgetIsRunning(false); }}
                    className={`px-3 py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      widgetAlgo === 'SSTF'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    SSTF (Closest First)
                  </button>
                </div>

                {/* Simulated Run on Widget */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Sequence Queue:</span>
                    <span className="text-slate-200 font-bold">[30, 160, 45, 120, 85]</span>
                  </div>
                  
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Current Step:</span>
                    <span className="text-indigo-300 font-bold">{widgetStep === 0 ? 'Starting at 50' : `Step ${widgetStep}`}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-1.5 border-t border-slate-800">
                    <span className="text-slate-400">Total Seek Overhead:</span>
                    <span className={`text-sm font-bold ${widgetAlgo === 'SSTF' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {widgetAlgo === 'SSTF' ? '210 Tracks' : '265 Tracks'}
                    </span>
                  </div>

                  <button
                    onClick={() => setWidgetIsRunning(!widgetIsRunning)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-[#E4E3E0] hover:text-white rounded-lg font-mono text-xs border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    {widgetIsRunning ? (
                      <>
                        <RotateCcw size={12} /> Reset Mini Traversal
                      </>
                    ) : (
                      <>
                        <Play size={12} className="fill-current text-indigo-400" /> Simulate Nozzle Traverse
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Theoretical Section: FCFS vs. SSTF */}
          <div className="bg-slate-950/40 p-8 border-t border-slate-805/50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sliders size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  First-Come, First-Served (FCFS)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Processes storage read Requests exactly in the order they join the driver request block queue. It has zero lookup-overhead, but does not adjust to mitigate physical path scatter. This often manifests in severe nozzle swing patterns over the platter.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Shortest Seek Time First (SSTF)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A greedy, localized optimization approach that continuously calculates distances to find the physical memory address block closest to where the head mechanical slider is resting. It significantly lowers total seeking overhead, but can starve outermost tracks from allocation time.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Footer */}
          <footer className="py-6 border-t border-slate-800/40 text-center text-[10px] font-mono tracking-wider text-slate-500">
            SCHOOL OF COMPUTER SCIENCE & ENGINEERING • INTEL STORAGE SUBSYSTEM EDUCATION TOOL
          </footer>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col justify-between"
        >
          {/* Header Section */}
          <header className="bg-slate-900 text-white p-6 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('landing')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-705 text-xs text-slate-300 hover:text-white border border-slate-700/80 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  &larr; Theory Deck
                </button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-indigo-300">Disk Scheduling OS Simulator</h1>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Academic Laboratory Tool v1.0</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-800 px-4 py-2 rounded border border-slate-700">
                  <span className="text-[10px] block text-slate-500 uppercase">Track Range</span>
                  <span className="text-sm font-mono">0 - 199</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
            
            {/* Sidebar Controls */}
            <aside className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                  <Activity size={14} /> Simulation Parameters
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-600 uppercase">Track Sequence</label>
                    <textarea
                      value={tracksInput}
                      onChange={(e) => setTracksInput(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono resize-none transition-all"
                      placeholder="98, 183, 37..."
                    />
                    <p className="text-[10px] text-slate-400 mt-1 italic">Comma-separated integers (0-199)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-600 uppercase">Initial Head Position</label>
                    <input
                      type="number"
                      min="0"
                      max="199"
                      value={initialHead}
                      onChange={(e) => setInitialHead(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button
                      onClick={runFCFS}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-sm transition-all cursor-pointer shadow-sm active:transform active:scale-[0.98]"
                    >
                      <Play size={14} /> Run FCFS
                    </button>
                    <button
                      onClick={runSSTF}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-sm transition-all cursor-pointer shadow-sm active:transform active:scale-[0.98]"
                    >
                      <Play size={14} /> Run SSTF
                    </button>
                    <button
                      onClick={clearSimulation}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-sm transition-all cursor-pointer mt-2"
                    >
                      <RotateCcw size={14} /> Clear Canvas
                    </button>
                  </div>
                </div>
              </div>

              {/* Logic Explanation */}
              <div className="bg-slate-800 text-slate-200 rounded-lg p-5 shadow-sm space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Info size={14} /> Algorithm Insight
                </h2>
                <p className="text-xs font-medium leading-relaxed">
                  SSTF (Shortest Seek Time First) selects the pending request closest to the current head to minimize movement.
                </p>
                <div className="pt-2">
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 w-1/3"></div>
                  </div>
                </div>
              </div>

              {/* Metrics Output - Persists or shows state */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mt-auto"
                  >
                    <h2 className="text-xs font-bold uppercase text-slate-500 mb-4">Current Metrics</h2>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">Algorithm:</span>
                      <span className="text-xs font-bold" style={{ color: result.color }}>
                        {result.algorithm.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Total Movement:</span>
                      <span className="text-2xl font-mono font-bold text-slate-900">{result.totalMovement}</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((result.totalMovement / 1000) * 100, 100)}%` }}
                        className="h-full" 
                        style={{ backgroundColor: result.color }}
                      ></motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </aside>

            {/* Canvas/Visualizer Area */}
            <section className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
              <div className="flex-grow bg-white border border-slate-200 rounded-lg shadow-inner relative flex flex-col min-h-[500px]">
                <div className="flex justify-between px-6 py-3 border-b border-slate-50 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  <span>Track 0</span>
                  <span className="hidden sm:inline">Track 100</span>
                  <span>Track 199</span>
                </div>
                <div className="flex-grow relative p-4">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full h-auto block max-h-[500px]"
                  />
                  {!result && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2 opacity-20">
                        <Activity size={48} className="mx-auto animate-pulse" />
                        <p className="text-xs font-mono uppercase tracking-[0.2em]">Ready for simulation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend and Footer Stats */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">FCFS Lineage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">SSTF Optimized</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-2 py-0.5 rounded shadow-sm">
                  SEEK SEQUENCE &rarr; TOP-TO-BOTTOM
                </span>
              </div>

              {/* Sequence Details Panel */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm nav-list-item"
                  >
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Step-by-Step Traversal</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.sequence.map((track, i) => (
                        <Fragment key={i}>
                          <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-mono text-slate-700 shadow-tiny">
                            {track}
                          </span>
                          {i < result.sequence.length - 1 && (
                            <span className="self-center text-slate-300 text-[10px]">&rarr;</span>
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </main>

          <footer className="p-6 text-center text-slate-400">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em]">
              OS Architecture Simulator // Faculty of Computing
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
