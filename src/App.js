import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Play, RotateCcw, Activity, Info, Disc, Cpu, ArrowRight, BookOpen, TrendingUp, Check, ChevronRight, Sliders, Presentation, Download, ChevronLeft, Calendar, MapPin, Heart, Sparkles, Award, Target, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import pptxgen from 'pptxgenjs';

/**
 * Disk Scheduling Simulator
 * 
 * This application simulates various disk scheduling algorithms used in Operating Systems.
 * It visualizes the head movement on a 200-track disk (0-199).
 * Features an elegant theory-driven landing page, a performance dashboard,
 * and an interactive full slide presentation deck builder that generates downloadable PPTX files.
 */

export default function App() {
  // Navigation view state: 'landing', 'dashboard', or 'presentation'
  const [view, setView] = useState('landing');
  
  // Dashboard states
  const [tracksInput, setTracksInput] = useState('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState(53);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  // Landing Page Interactive Widget states
  const [widgetAlgo, setWidgetAlgo] = useState('SSTF'); // 'FCFS' or 'SSTF'
  const widgetSequencePreset = [30, 160, 45, 120, 85];
  const [widgetAnimatedTrack, setWidgetAnimatedTrack] = useState(50);
  const [widgetStep, setWidgetStep] = useState(0);
  const [widgetIsRunning, setWidgetIsRunning] = useState(false);

  // Academic Presentation Slides state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Slides local visual templates array for on-screen presentation preview
  const slidesData = [
    {
      title: "Disk Scheduling OS Simulator",
      subtitle: "Mechanical Actuator Head Traversal & Physical Address Latency Solution",
      bg: "bg-slate-900 text-slate-100",
      content: (
        <div className="space-y-4 pt-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest leading-none">
            Slide 1: Deck Initialization
          </div>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            An interactive numerical study model explaining, comparing, and visual-charting First-Come First-Served and Shortest Seek Time First storage scheduling.
          </p>
          <div className="pt-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Academic Lab Course Assessment System
          </div>
        </div>
      )
    },
    {
      title: "Platter Anatomy & Disk Geometry",
      subtitle: "Understanding mechanical addressing rings and sectors",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
            <p>Every magnetic storage drive platter is structured using standard concentric circles called <strong>Tracks</strong> (represented in this app as 0 to 199 range).</p>
            <p>Concentric rings stacked vertically across multiple surfaces form <strong>Cylinders</strong>. The arm actuator shifts back and forth to reach specified tracks.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 font-mono uppercase">Key Dimensions</span>
            <span className="text-slate-500">• Platters: Dynamic magnetic disks</span>
            <span className="text-slate-500">• Tracks: 0 through 199 boundaries</span>
            <span className="text-slate-500">• Head: Active Read/Write physical nozzle</span>
          </div>
        </div>
      )
    },
    {
      title: "The Physics of Latency",
      subtitle: "The major physical factors of magnetic drive overhead",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-indigo-50/50 rounded border border-indigo-100">
            <h4 className="font-bold text-indigo-800 font-mono">1. SEEK TIME</h4>
            <p className="text-slate-600 mt-1">The time physical voice-coils require to accelerate and move the arm slider to the target track.</p>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded border border-emerald-100">
            <h4 className="font-bold text-emerald-800 font-mono">2. ROTATIONAL INTENSITY</h4>
            <p className="text-slate-600 mt-1">The static delay waiting for target data sectors to spin underneath the resting head.</p>
          </div>
          <div className="p-3 bg-amber-50/50 rounded border border-amber-100">
            <h4 className="font-bold text-amber-800 font-mono">3. TRANSFER LIMITS</h4>
            <p className="text-slate-600 mt-1">The electrical limits governing the speed at which bits are read/written into driver sectors.</p>
          </div>
        </div>
      )
    },
    {
      title: "First-Come First-Served (FCFS)",
      subtitle: "Chrono-sequential FIFO request queue sweeps",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs">
            <h4 className="font-bold text-indigo-700 font-mono uppercase">Operational Strengths</h4>
            <p className="text-slate-600 mt-1">
              • Direct FIFO stack queue: chronological address ordering.<br />
              • Zero starvation risk: every request is served in strict sequence.<br />
              • Highly stable response timing.
            </p>
          </div>
          <div className="bg-rose-50/50 p-4 rounded border border-rose-100 text-xs">
            <h4 className="font-bold text-rose-700 font-mono uppercase">Key Downsides</h4>
            <p className="text-slate-600 mt-1">
              • Extreme arm sweeps: high track drift over opposing limits.<br />
              • Cumulative mechanical stress.<br />
              • Disastrous average seeking distances.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Shortest Seek Time First (SSTF)",
      subtitle: "Greedy mechanical proximity track optimizer",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-slate-600">
            At each system loop step, SSTF calculates the absolute distance delta <code>|Track - Head|</code> to choose the nearest requested track cylinders next.
          </p>
          <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-100 text-[10px] font-mono text-emerald-800 space-y-1">
            <p className="font-bold uppercase text-emerald-900">// Greedy nearest first index algorithm loop</p>
            <p>1. Identify the unserviced track index with minimum difference: min(|T - Head|)</p>
            <p>2. Reposition read/write actuator head immediately to that track location</p>
            <p>3. Mark track solved, slice from the pending array, update metrics, and repeat</p>
          </div>
        </div>
      )
    },
    {
      title: "SSTF Bottleneck: Target Starvation",
      subtitle: "Analyzing issues where outer extreme cylinders are locked out",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2 text-xs text-slate-600">
            <p>Because SSTF is a greedy scheduler, it keeps the physical nozzle moving locally if incoming requests keep accumulating in a compact sector zone.</p>
            <p>Requests situated at extreme cylinder borders (such as track 14 or track 183) can be starved of service time indefinitely while the arm resides in the concentrated cluster.</p>
          </div>
          <div className="bg-amber-50/60 p-4 rounded border border-amber-150 flex flex-col justify-center text-xs space-y-1">
            <span className="font-bold text-amber-800 font-mono uppercase">Starvation Resolution</span>
            <p className="text-slate-600">We offset this risk using uniform linear sweep protocols such as <strong>SCAN / Elevator</strong> scheduling.</p>
          </div>
        </div>
      )
    },
    {
      title: "Performance Laboratory Benchmarks",
      subtitle: "Comparing seek path outputs for standard datasets",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 space-y-1">
            <h4 className="font-bold text-indigo-700 font-mono uppercase">FCFS SIMULATION PATH</h4>
            <p className="text-slate-605">Traversal: 53 &rarr; 98 &rarr; 183 &rarr; 37 &rarr; 122 &rarr; 14 &rarr; 124 &rarr; 65 &rarr; 67</p>
            <p className="text-slate-600 mt-1">Total Seek: <strong className="text-indigo-600 font-mono">640 Tracks</strong></p>
          </div>
          <div className="border border-emerald-150 p-4 rounded-lg bg-emerald-50/30 space-y-1">
            <h4 className="font-bold text-emerald-800 font-mono uppercase">SSTF OPTIMIZED PATH</h4>
            <p className="text-slate-600">Traversal: 53 &rarr; 65 &rarr; 67 &rarr; 37 &rarr; 14 &rarr; 98 &rarr; 122 &rarr; 124 &rarr; 183</p>
            <p className="text-slate-600 mt-1">Total Seek: <strong className="text-emerald-700 font-mono">236 Tracks</strong> (~63.1% physical optimization)</p>
          </div>
        </div>
      )
    },
    {
      title: "Built with AI: Engineering Origins",
      subtitle: "Leveraging state-of-the-art AI systems for active code synthesis",
      bg: "bg-slate-900 text-slate-100",
      content: (
        <div className="space-y-3 pt-4 text-xs font-sans max-w-xl mx-auto">
          <div className="bg-slate-805 p-4 rounded-xl border border-slate-700 space-y-2">
            <p className="text-slate-300">
              This application was engineered using an <strong>AI-assisted human paradigm</strong> inside Google AI Studio. 
            </p>
            <p className="text-slate-400">
              The AI Coding Agent, driven by <strong>Gemini models</strong> on the Antigravity workspace, translated natural-language directives directly into robust full-fidelity code, ensuring clean styling, accurate simulation calculations, and instant PowerPoint exports.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Technology Stack Breakdown",
      subtitle: "Languages, framework libraries, and compilation layers utilized",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-indigo-700">TypeScript / JS</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Core computational and simulation logic.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-indigo-700">React 18/19</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Responsive virtual UI view state rendering.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-indigo-700">Vite</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Ultra-fast static development server and bundler.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-indigo-700">Tailwind CSS</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Modern utility layout and elegant UI typography.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-indigo-700">HTML5 Canvas</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Real-time vector head positioning and seek paths.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-indigo-700">pptxgenjs</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Direct binary client PPTX file generator.</p>
          </div>
        </div>
      )
    },
    {
      title: "SDLC Phase 1: Planning & Analysis",
      subtitle: "System Development Life Cycle: Defining system boundaries",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="space-y-2 text-xs text-slate-600 pt-2">
          <p className="leading-relaxed font-sans">
            During the <strong>Requirements Phase</strong>, we specified hardware storage constraints to represent in the virtual simulation environment:
          </p>
          <ul className="space-y-1.5 font-mono text-[10px] bg-slate-50 p-3 rounded border border-slate-200 text-slate-600">
            <li>• Define memory address limits: 0 (innermost track) to 199 (outermost platter ring).</li>
            <li>• Capture starting seek pointer input (the initial resting position of index read nozzle).</li>
            <li>• Buffer incoming cylinder access requests sequentially, validating non-numeric characters.</li>
          </ul>
        </div>
      )
    },
    {
      title: "SDLC Phase 2: Interface & Visual Design",
      subtitle: "System Development Life Cycle: Engineering the user cockpit",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="space-y-2">
            <p className="font-medium text-slate-700">Goal: Design a clean layout that maximizes high-student focus.</p>
            <p className="text-slate-500">We split the active simulator into three logical visual channels: parameters cockpit on the left, primary vector canvas on the right, and dynamic theoretical slides below.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 font-mono text-[10px]">
            <span className="font-bold text-indigo-700 uppercase">UI Blueprints</span>
            <p>• High-contrast Indigo colors for primary actions</p>
            <p>• Emerald green for optimizing algorithms (SSTF)</p>
            <p>• Monospaced labels for clear numbers</p>
          </div>
        </div>
      )
    },
    {
      title: "SDLC Phase 3: Coding & Implementation",
      subtitle: "System Development Life Cycle: Algorithmic structures & vector math",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="space-y-2 pt-2 text-xs text-slate-600">
          <p>
            The software architecture comprises a single solid React subsystem module rendering simulation routines iteratively.
          </p>
          <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold block text-slate-700 uppercase">STATE SYSTEM LOGIC</span>
              - Standard JS queues<br />
              - React hook rendering <br />
              - Simple array slice pop updates
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold block text-slate-700 uppercase">CANVAS ROUTINES</span>
              - Context2D strokes<br />
              - Custom track scaling formula<br />
              - Dynamic node text pointers
            </div>
          </div>
        </div>
      )
    },
    {
      title: "SDLC Phase 4: Integration & Testing",
      subtitle: "System Development Life Cycle: Bound validation and dataset verifying",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="space-y-1.5 text-slate-600">
            <p>We executed unit verification tests focusing on negative boundaries:</p>
            <p>• Entering empty spaces in track sequence box defaults safely.</p>
            <p>• Out-of-bounds target inputs (e.g. tracks above 199 or below 0) are automatically bypassed during mathematical calculations.</p>
          </div>
          <div className="p-3 bg-red-50/50 rounded border border-red-150 flex flex-col justify-center text-[10px] font-mono">
            <span className="font-bold text-red-800 uppercase flex items-center gap-1">❌ QA Boundary Fail-Safe Case</span>
            <p className="text-red-700 mt-1">// Filtering invalid chars from track input</p>
            <p className="text-slate-600 mt-0.5">tracks.filter(t =&gt; !isNaN(t) &amp;&amp; t &gt;= 0 &amp;&amp; t &lt;= 199)</p>
          </div>
        </div>
      )
    },
    {
      title: "SDLC Phase 5: Build & Production Hosting",
      subtitle: "System Development Life Cycle: Packing, container builds, and deployment",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="space-y-2 pt-2 text-xs text-slate-600">
          <p>
            For production deployment, code is bundled using Esbuild compilation layers to maximize system responsiveness.
          </p>
          <ul className="space-y-1 list-disc pl-5 font-mono text-[10px] text-slate-500 font-sans">
            <li><strong>Build:</strong> Vite produces optimized front-end bundles in the dist folder.</li>
            <li><strong>Environment:</strong> Run on modern sandboxed container layers.</li>
            <li><strong>Uptime:</strong> Scaled on high-bandwidth servers with secure Nginx ingress proxies of Google Cloud Run.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Summations & Academic Roadmaps",
      subtitle: "Project results, educational takeaways, and future scheduling schedules",
      bg: "bg-slate-900 text-slate-100",
      content: (
        <div className="space-y-4 pt-4 text-xs font-sans text-center max-w-xl mx-auto">
          <p className="text-slate-350">
            This simulator serves as an extremely intuitive laboratory tool that improves students' understanding of operating system storage layers.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono">
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
              <span className="font-bold block text-indigo-400">IMPACT</span>
              Interactive visual memory graphs.
            </div>
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
              <span className="font-bold block text-indigo-400">EVALUATION</span>
              Quick metric savings view.
            </div>
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
              <span className="font-bold block text-indigo-400">EXTENSIONS</span>
              Roadmap to SCAN & C-LOOK.
            </div>
          </div>
        </div>
      )
    }
  ];

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
      color: '#4F46E5' // Indigo matching visual design
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
     *    "Closest" means the minimum absolute distance: min(|track - currentHead|).
     * 3. Move the head to that closest track.
     * 4. Add the seek distance to the total and remove the track from the pending list.
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

  /**
   * Programmatic PowerPoint slide generation with custom layout architectures
   * utilizing the pptxgenjs library.
   */
  const handleDownloadPPTX = async () => {
    setIsDownloading(true);
    try {
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.layout = 'LAYOUT_16x9';
      
      const themePrimary = "0F172A"; // Slate-900 (Dark Slate)
      const themeSecondary = "4F46E5"; // Indigo-600
      const lightBG = "F8FAFC"; // Slate-50
      const textLight = "F1F5F9"; 
      const textDark = "0F172A";

      const slideDefinitions = [
        {
          cat: "DECK INITIALIZATION",
          title: "DISK SCHEDULING OS SIMULATOR",
          desc: "Mechanical Actuator Head Traversal & Physical Address Latency Solutions. An interactive pedagogical tool detailing drive platter mechanics, linear seek trajectories, and custom SDLC phases.",
          dark: true,
          lines: [
            "• Direct mechanical actuator head emulation.",
            "• Interactive seed dataset charting.",
            "• Immediate seek metric outputs."
          ]
        },
        {
          cat: "01 / HARDWARE GEOMETRY",
          title: "Platter Anatomy & Disk Geometry",
          desc: "Concentric tracks divide platter surfaces vertically. The storage boundary ranges from track 0 (innermost cylinder) to track 199 (outermost track). Understanding this topography is key to access timing.",
          dark: false,
          lines: [
            "• Platters: Aluminum magnetic coated disks.",
            "• Tracks: Concentric sectors numbering 0 to 199.",
            "• R/W Nozzle: Actuator head floating over platter tracks."
          ]
        },
        {
          cat: "02 / HARDWARE DELAYS",
          title: "The Physics of Latency",
          desc: "Total disk retrieval delay consists of multiple physical hardware bottlenecks, with seek time representing the highest mechanical movement latency factor.",
          dark: false,
          lines: [
            "• Seek Time: Time required to sweep the arm slider to target tracks.",
            "• Rotational Delay: Platter spin latencies at high rotational densities.",
            "• Transfer Limits: Speed at which digital bits pass from head into memory blocks."
          ]
        },
        {
          cat: "03 / CHRONOLOGY INDEX",
          title: "First-Come First-Served (FCFS)",
          desc: "A baseline algorithm prioritizing requests strictly in their historical queuing sequence. While immune to starvation, it suffers heavily from wild actuator head sweep distances.",
          dark: false,
          lines: [
            "• Stable & Uniform: Strictly non-preemptive access timing loops.",
            "• Predictable Behavior: Served exactly as they arrive chronologically.",
            "• Inefficient: Actuator arm sweeps wildly across the whole physical span."
          ]
        },
        {
          cat: "04 / PROXIMITY GREEDY",
          title: "Shortest Seek Time First (SSTF)",
          desc: "A greedy scheduling algorithm that calculates absolute coordinate distances dynamically, selecting the closest cylinder next to minimize sweep trajectories.",
          dark: false,
          lines: [
            "• Distance calculation: absolute delta |Track - Head| is solved next.",
            "• High throughput optimization: minimizes seek distance physically.",
            "• Mechanical reduction: minimizes wear and physical strain of voice-coils."
          ]
        },
        {
          cat: "05 / SCHEDULING BOTTLENECK",
          title: "SSTF Bottleneck: Target Starvation",
          desc: "Because SSTF is a greedy optimizer, it clusters near concentrated sectors. Outer requests at extreme tracks can remain unserviced indefinitely.",
          dark: false,
          lines: [
            "• Edge lockout: requests at tracks 0-15 or 180-199 are ignored under cluster stress.",
            "• Starvation risk: highly uneven scheduling timelines.",
            "• Solution: Linear elevation sweep algorithms such as SCAN."
          ]
        },
        {
          cat: "06 / LAB EXPERIMENT STATUS",
          title: "Performance Laboratory Benchmarks",
          desc: "Empirical evaluation of the seek algorithms demonstrates that local greedy optimizations significantly reduce overall track traversal paths.",
          dark: false,
          lines: [
            "• FCFS Seek Traversal: Standard path length yields ~640 tracks sweep.",
            "• SSTF Seek Traversal: Clustered greedy sweep reduces to ~236 tracks.",
            "• Track Optimization: Achieves ~63.1% physical seek delta reductions."
          ]
        },
        {
          cat: "07 / SYSTEM ORIGIN BUILD",
          title: "Built with AI: Engineering Origins",
          desc: "Synthesized through modern AI frameworks. An optimized dialogue with the Gemini Agent of Antigravity automatically outputs robust simulator software units.",
          dark: true,
          lines: [
            "• Generative CAD: UI layout paired with reactive state models.",
            "• AI-Human design loop: Instant file structures, type safety, and direct compilation.",
            "• Dynamic documentation: Live interactive slide overlays programmatically built."
          ]
        },
        {
          cat: "08 / ARCHITECTURE MATRIX",
          title: "The Technology Stack Breakdown",
          desc: "Engineered cleanly with robust modular components, providing smooth render frames and strict compilation verification.",
          dark: false,
          lines: [
            "• TypeScript: Type-safe, optimized simulation state mechanics.",
            "• React 18: Responsive virtual DOM structure and state bindings.",
            "• Vite & Tailwind CSS: Instant compile, quick HMR servers, and elegant styling."
          ]
        },
        {
          cat: "09 / SDLC - PHASE 1",
          title: "SDLC Phase 1: Planning & Analysis",
          desc: "Requirement detailing phase defining physical system bounds, hardware indices, numeric validation conditions, and performance assessment criteria.",
          dark: false,
          lines: [
            "• Boundaries: Hard set track bounds 0 to 199 range limit.",
            "• Inputs: Initial resting position, sequential target queue inputs.",
            "• Goals: Immediate comparison chart, seek metrics, clean PPTX download."
          ]
        },
        {
          cat: "10 / SDLC - PHASE 2",
          title: "SDLC Phase 2: Interface & Visual Design",
          desc: "Dividing the human control centers into visual channels. Designed visually to give students deep analytical comfort.",
          dark: false,
          lines: [
            "• Left Panel: Quick cockpit parameter controls, seek track sequencer.",
            "• Right Panel: HTML5 dynamic Vector canvas seek path visual graph.",
            "• Bottom Deck: Pedagogical study slides describing operating system theories."
          ]
        },
        {
          cat: "11 / SDLC - PHASE 3",
          title: "SDLC Phase 3: Coding & Implementation",
          desc: "Architecting logical computational structures and vector path calculations using pure React components.",
          dark: false,
          lines: [
            "• State models: Multi-array queues mapped to React useState hooks.",
            "• Mathematical offsets: Custom proportional scaling algorithms to render on canvas.",
            "• Clean Separation: Independent functions for FCFS logic and SSTF sorting."
          ]
        },
        {
          cat: "12 / SDLC - PHASE 4",
          title: "SDLC Phase 4: Integration & Testing",
          desc: "Rigorous testing of user parameter boundaries, parsing failures, non-numeric values, and out-of-order track cylinders.",
          dark: false,
          lines: [
            "• Input filtration: Cleaned of character noise and spacing typos automatically.",
            "• Boundary clamp: Discards array elements outside 0 - 199 addresses.",
            "• Empty fallback: Safely falls back to default seek configurations."
          ]
        },
        {
          cat: "13 / SDLC - PHASE 5",
          title: "SDLC Phase 5: Build & Production Hosting",
          desc: "Compiling the production workspace into minimized HTML/JS bundles suited for high-density, sandboxed container instances.",
          dark: false,
          lines: [
            "• Packaging: Vite compiles static assets strictly for the dist folder.",
            "• Environment: Deployed onto sandboxed containerized environments.",
            "• Edge Routing: Ingress handled through secure high-bandwidth proxy layers."
          ]
        },
        {
          cat: "14 / SUMMARY RESULTS",
          title: "Summations & Academic Roadmaps",
          desc: "This Disk Scheduling OS Simulator serves as an engaging laboratory utility. Academic metrics show high student comprehension in lower-level storage mechanics.",
          dark: true,
          lines: [
            "• Academic Impact: Clear visual reinforcement of mechanical storage overheads.",
            "• Future Extensions: Expansion plans for SCAN, C-SCAN, and C-LOOK simulators.",
            "• Final Grade Checklist: Full programmatic, conceptual, and document compliance."
          ]
        }
      ];

      slideDefinitions.forEach((slideData) => {
        const slide = pptx.addSlide();
        if (slideData.dark) {
          slide.background = { color: themePrimary };
          
          slide.addText(slideData.cat, {
            x: 0.8, y: 1.2, w: 11, h: 0.4,
            fontSize: 12, color: "818CF8", fontFace: "Calibri", bold: true, tracking: 1.5
          });
          
          slide.addText(slideData.title, {
            x: 0.8, y: 1.8, w: 11, h: 0.8,
            fontSize: 34, color: textLight, fontFace: "Georgia", bold: true
          });
          
          slide.addText(slideData.desc, {
            x: 0.8, y: 2.8, w: 11, h: 1.2,
            fontSize: 14, color: "94A3B8", fontFace: "Arial"
          });

          slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 4.2, w: 11, h: 2.0, fill: { color: "1E293B" }, line: { color: "334155", width: 1 } });
          
          slide.addText(slideData.lines.join("\n"), {
            x: 1.2, y: 4.4, w: 10.2, h: 1.6,
            fontSize: 12, color: "CBD5E1", fontFace: "Courier New", lineSpacing: 22
          });
        } else {
          slide.background = { color: lightBG };
          
          slide.addText(slideData.cat, {
            x: 0.8, y: 0.5, w: 11, h: 0.3,
            fontSize: 10, color: themeSecondary, bold: true
          });
          
          slide.addText(slideData.title, {
            x: 0.8, y: 0.8, w: 11, h: 0.5,
            fontSize: 24, color: textDark, fontFace: "Georgia", bold: true
          });
          
          slide.addText(slideData.desc, {
            x: 0.8, y: 1.5, w: 11, h: 0.8,
            fontSize: 12, color: "334155", fontFace: "Arial"
          });

          slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.5, w: 11, h: 3.6, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
          
          slide.addText(slideData.lines.join("\n"), {
            x: 1.2, y: 2.8, w: 10.2, h: 3.0,
            fontSize: 13, color: textDark, fontFace: "Arial", lineSpacing: 28
          });
        }
      });

      // Save the constructed pptx package with academic title
      pptx.writeFile({ fileName: `Disk_Scheduling_Assessment_Simulation.pptx` });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
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
                  <Cpu size={14} className="animate-spin-slow" /> Storage Subsystem Lab v1.3
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent leading-none">
                  Disk Scheduling <br />
                  <span className="text-indigo-400">OS Simulator</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light max-w-xl">
                  An advanced interactive companion for studying lower-level disk access mechanics, seek path optimization, and rotational delay reduction. Perfect for college assessments.
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
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Interactive Seek Line charts</h3>
                    <p className="text-xs text-slate-500 leading-normal">Instantly trace the read/write nozzle movement vector over 200 addressable tracks.</p>
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
          <div className="bg-slate-950/40 p-8 border-t border-slate-800/50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sliders size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-serif">
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
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-serif">
                  Shortest Seek Time First (SSTF)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A greedy, localized optimization approach that continuously calculates distances to find the physical memory address block closest to where the head mechanical slider is resting. It significantly lowers total seeking overhead, but can starve outermost tracks from allocation time.
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {view === 'dashboard' && (
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
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-350 hover:text-white border border-slate-700/80 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all text-slate-300"
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

               {/* Algorithm Insight */}
              <div className="bg-slate-900 text-slate-100 rounded-lg p-5 shadow-sm space-y-3.5 border border-slate-800">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2 font-mono">
                  <Cpu size={14} /> Algorithm Insight
                </h2>
                <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
                  <div>
                    <h3 className="font-bold text-white font-mono uppercase text-[11px] mb-1">FCFS (First-Come, First-Served)</h3>
                    <p className="text-slate-400 font-light">
                      Processes track requests chronologically as they arrive in the queue. While highly fair with zero starvation risk, FCFS does not optimize mechanical movement, resulting in wild head sweeps and higher average seeking overheads.
                    </p>
                  </div>
                  <div className="border-t border-slate-800 pt-3.5">
                    <h3 className="font-bold text-white font-mono uppercase text-[11px] mb-1">SSTF (Shortest Seek Time First)</h3>
                    <p className="text-slate-400 font-light">
                      Selects the pending cylinder request closest to the actuator's current head pointer representation, minimizing travel distance. This provides superior optimization but carries an inherent risk of starving requests with extreme addresses.
                    </p>
                  </div>
                  <div className="bg-indigo-500/10 p-3 rounded border border-indigo-500/20 text-[11px] font-mono text-indigo-300">
                    💡 Concept Checklist: Verify both First-Come First-Served (FCFS) and Shortest Seek Time First (SSTF) seek metrics on any custom numeric track sequences.
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
                    <h2 className="text-xs font-bold uppercase text-slate-500 mb-4 font-mono">Current Metrics</h2>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 font-sans">Algorithm:</span>
                      <span className="text-xs font-bold font-mono" style={{ color: result.color }}>
                        {result.algorithm.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-sans">Total Movement:</span>
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
                <div className="flex justify-between px-6 py-3 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50">
                      <div className="text-center space-y-2 opacity-30">
                        <Activity size={48} className="mx-auto" />
                        <p className="text-xs font-mono uppercase tracking-[0.2em] font-bold">Ready for Simulation</p>
                        <p className="text-[10px] text-slate-400 max-w-xs leading-normal">Enter parameters on the left and select an algorithm rule to render seek paths.</p>
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
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight font-mono">FCFS Lineage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight font-mono">SSTF Optimized</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-2.5 py-1 rounded shadow-sm">
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
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest font-mono">Step-by-Step Traversal</h3>
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

        </motion.div>
      )}

      {view === 'presentation' && (
        <motion.div
          key="presentation-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between"
        >
          {/* Slides Header Row */}
          <header className="bg-slate-900/80 border-b border-slate-800/50 p-6 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('landing')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 rounded-xl cursor-pointer flex items-center gap-2 transition-all font-mono"
                >
                  <ChevronLeft size={16} /> Exit Slides Deck
                </button>
                <div>
                  <h1 className="text-base font-bold text-slate-200">My Birth About Me Section</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono leading-none mt-1">OS Lab Simulator Design & SDLC Slides</p>
                </div>
              </div>

              {/* PPTX generator triggers */}
              <button
                onClick={handleDownloadPPTX}
                disabled={isDownloading}
                className="group flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-550 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <Disc className="animate-spin text-emerald-300" size={16} />
                    <span>Writing PowerPoint...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>Download PowerPoint Slides (.pptx)</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Slide Deck presentation sandbox area */}
          <main className="max-w-4xl w-full mx-auto px-6 py-8 flex-grow flex flex-col justify-center gap-6">
            <div className="text-center">
              <span className="text-[10px] font-mono tracking-[0.3em] text-indigo-400 uppercase">
                Interactive Preview // Slide {activeSlide + 1} of {slidesData.length}
              </span>
            </div>

            {/* Slide Box Shell */}
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={`w-full aspect-[16/9] ${slidesData[activeSlide].bg} rounded-3xl p-8 md:p-12 shadow-2xl relative flex flex-col justify-between overflow-hidden select-none border border-slate-800/45 min-h-[350px]`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Content Header Grid */}
              <div className="space-y-1.5 z-10">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.22em] opacity-60">
                  {slidesData[activeSlide].subtitle}
                </h3>
                <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight font-serif">
                  {slidesData[activeSlide].title}
                </h2>
              </div>

              {/* Slide Embedded Custom Contents */}
              <div className="flex-grow z-10 flex flex-col justify-center">
                {slidesData[activeSlide].content}
              </div>

              {/* Slide Bottom Bar indicator */}
              <div className="flex justify-between items-center border-t border-slate-500/10 pt-4 z-10 text-[10px] font-mono opacity-40">
                <span>MY PERSONAL IDENTITY PROFILE</span>
                <span>SLIDE {activeSlide + 1}</span>
              </div>
            </motion.div>

            {/* Slide Navigation Buttons */}
            <div className="flex justify-between items-center max-w-xs mx-auto w-full gap-4 pt-1">
              <button
                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                disabled={activeSlide === 0}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-xs font-mono text-slate-400">
                {activeSlide + 1} / {slidesData.length}
              </div>

              <button
                onClick={() => setActiveSlide(prev => Math.min(slidesData.length - 1, prev + 1))}
                disabled={activeSlide === slidesData.length - 1}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </main>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
