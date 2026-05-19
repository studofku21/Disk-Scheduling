import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Disk Scheduling Simulator
 * 
 * This application simulates various disk scheduling algorithms used in Operating Systems.
 * It visualizes the head movement on a 200-track disk (0-199).
 */

export default function App() {
  const [tracksInput, setTracksInput] = useState('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState(53);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

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
      color: '#3B82F6' // Blue
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
    if (result && canvasRef.current) {
      drawChart(result);
    }
  }, [result]);

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

    // Draw grid/axis
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding / 2);
    ctx.lineTo(width - padding, padding / 2);
    ctx.stroke();

    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 199; i += 20) {
      const x = padding + i * trackWidth;
      ctx.fillText(i.toString(), x, padding / 2 - 5);
      ctx.beginPath();
      ctx.moveTo(x, padding / 2);
      ctx.lineTo(x, padding / 2 + 5);
      ctx.stroke();
    }

    // Draw the seek line
    ctx.strokeStyle = simResult.color;
    ctx.lineWidth = 2;
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

    // Draw points and labels
    simResult.sequence.forEach((track, index) => {
      const x = padding + track * trackWidth;
      const y = padding + index * stepHeight;

      // Point
      ctx.fillStyle = simResult.color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Track label
      ctx.fillStyle = '#374151';
      ctx.textAlign = track > 180 ? 'right' : track < 20 ? 'left' : 'center';
      ctx.fillText(track.toString(), x, y - 8);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Header Section */}
      <header className="bg-slate-900 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-300">Disk Scheduling OS Simulator</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Academic Laboratory Tool v1.0</p>
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
                className="w-full h-full block"
              />
              {!result && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 opacity-20">
                    <Activity size={48} className="mx-auto" />
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
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
              >
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Step-by-Step Traversal</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.sequence.map((track, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-mono text-slate-700 shadow-tiny">
                        {track}
                      </span>
                      {i < result.sequence.length - 1 && (
                        <span className="self-center text-slate-300 text-[10px]">&rarr;</span>
                      )}
                    </React.Fragment>
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
    </div>
  );
}
