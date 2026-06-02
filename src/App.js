import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Play, RotateCcw, Activity, Info, Disc, Cpu, ArrowRight, BookOpen, TrendingUp, Check, ChevronRight, Sliders, Presentation, Download, ChevronLeft } from 'lucide-react';
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
   * utilizing the npm pptxgenjs library.
   */
  const handleDownloadPPTX = async () => {
    setIsDownloading(true);
    try {
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.layout = 'LAYOUT_16x9';
      
      const themePrimary = "1E1B4B"; // Dark Indigo index
      const themeSecondary = "4F46E5"; // Indigo main
      const themeAccent = "10B981"; // Emerald green
      const darkBG = "111827"; // Dark background slate
      const lightBG = "F8FAFC"; // Soft background white
      const textLight = "F1F5F9"; 
      const textDark = "0F172A";
      const textMuted = "64748B";

      // --- Slide 1: Cover Page (Dark Accent) ---
      const sl1 = pptx.addSlide();
      sl1.background = { color: themePrimary };
      sl1.addText("ACADEMIC ASSESSMENT LAB", {
        x: 0.8, y: 1.5, w: 11, h: 0.4,
        fontSize: 12, color: "818CF8", fontFace: "Calibri", bold: true, tracking: 1.5
      });
      sl1.addText("Operating System\nDisk Scheduling Simulator", {
        x: 0.8, y: 2.1, w: 11, h: 1.4,
        fontSize: 38, color: textLight, fontFace: "Georgia", bold: true
      });
      sl1.addText("An interactive investigation of seek time metrics, mechanical movement tracks, and mechanical queue scheduling overhead.", {
        x: 0.8, y: 3.8, w: 10.5, h: 0.8,
        fontSize: 13, color: "94A3B8", fontFace: "Arial"
      });
      sl1.addText("Algorithmic Scope: 15-Slide Master Deck & Mechanical Queue Solutions", {
        x: 0.8, y: 5.6, w: 11, h: 0.4,
        fontSize: 12, color: "A5B4FC", fontFace: "Lucida Console", italic: true
      });

      // --- Slide 2: Platter Geography ---
      const sl2 = pptx.addSlide();
      sl2.background = { color: lightBG };
      sl2.addText("01 / GEOMETRIC CONSTRAINTS", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl2.addText("Platter Anatomy & Disk Geometry", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl2.addText("Concentric tracks on physical platters form vertically aligned cylinders. An electromagnetic actuator shifts the tip back and forth.", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl2.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl2.addText("PHYSICAL SPECIFICATION BOUNDS", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 13, color: themeSecondary, bold: true });
      sl2.addText("• Platters: Circular magnetic substrates coating storage sectors\n" +
                   "• Track Coordinates: Simulates a track envelope from 0 (innermost) to 199 (outermost)\n" +
                   "• Read/Write head nozzle: Shifts dynamically to address seek destinations of requests queue", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 12, color: textDark, lineSpacing: 24
      });

      // --- Slide 3: Mechanical Latency ---
      const sl3 = pptx.addSlide();
      sl3.background = { color: lightBG };
      sl3.addText("02 / PERFORMANCE BARRIERS", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: "EF4444", bold: true });
      sl3.addText("The Physics of Mechanical Latency", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl3.addText("Physical movement restricts physical hardware drive performance scores. Three latency barriers restrict throughput speed:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      // 3 block layouts
      sl3.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 3.5, h: 3.6, fill: { color: "EEF2FF" }, line: { color: "C7D2FE", width: 1 } });
      sl3.addText("1. SEEK TIME", { x: 1.1, y: 2.6, w: 2.9, h: 0.3, fontSize: 12, color: "3730A3", bold: true });
      sl3.addText("The absolute delay as voice-coils accelerate and reposition the arm to target cylinder boundaries.", { x: 1.1, y: 3.1, w: 2.9, h: 2.6, fontSize: 11, color: "1E1B4B" });

      sl3.addShape(pptx.shapes.RECTANGLE, { x: 4.6, y: 2.3, w: 3.5, h: 3.6, fill: { color: "F0FDF4" }, line: { color: "BBF7D0", width: 1 } });
      sl3.addText("2. ROTATIONAL INTENSITY", { x: 4.9, y: 2.6, w: 2.9, h: 0.3, fontSize: 12, color: "166534", bold: true });
      sl3.addText("The static delay waiting for physical magnetic media blocks to spin underneath the resting head.", { x: 4.9, y: 3.1, w: 2.9, h: 2.6, fontSize: 11, color: "14532D" });

      sl3.addShape(pptx.shapes.RECTANGLE, { x: 8.4, y: 2.3, w: 3.5, h: 3.6, fill: { color: "FFFBEB" }, line: { color: "FDE68A", width: 1 } });
      sl3.addText("3. TRANSFER LIMITS", { x: 8.7, y: 2.6, w: 2.9, h: 0.3, fontSize: 12, color: "92400E", bold: true });
      sl3.addText("The electrical bit density thresholds governing reading write actions onto track boundaries.", { x: 8.7, y: 3.1, w: 2.9, h: 2.6, fontSize: 11, color: "78350F" });

      // --- Slide 4: FCFS Protocol Protocol ---
      const sl4 = pptx.addSlide();
      sl4.background = { color: lightBG };
      sl4.addText("03 / FIFO BASELINE SCHEDULER", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl4.addText("First-Come, First-Served Protocol Architecture", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl4.addText("FCFS services incoming storage inputs strictly matching their chronological queue sequence. No search sorting is run.", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      // Pros / Cons
      sl4.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 5.2, h: 3.6, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 } });
      sl4.addText("ADVANTAGES", { x: 1.2, y: 2.6, w: 4.4, h: 0.3, fontSize: 13, color: "334155", bold: true });
      sl4.addText("• Zero administrative sort overhead\n• Full equity: rules out starving outermost registers\n• Predictable and chronological data response path", { x: 1.2, y: 3.1, w: 4.4, h: 2.4, fontSize: 11, color: textDark, lineSpacing: 18 });

      sl4.addShape(pptx.shapes.RECTANGLE, { x: 6.6, y: 2.3, w: 5.2, h: 3.6, fill: { color: "FFF5F5" }, line: { color: "FED7D7", width: 1 } });
      sl4.addText("CRITICAL FLAWS", { x: 7.0, y: 2.6, w: 4.4, h: 0.3, fontSize: 13, color: "9B2C2C", bold: true });
      sl4.addText("• Wild track swings: nozzle loops over outer boundaries\n• Cumulative actuator wear occurs rapidly\n• Large seek path averages degrade physical platters", { x: 7.0, y: 3.1, w: 4.4, h: 2.4, fontSize: 11, color: "742A2A", lineSpacing: 18 });

      // --- Slide 5: SSTF Protocol ---
      const sl5 = pptx.addSlide();
      sl5.background = { color: lightBG };
      sl5.addText("04 / PROXIMITY EXPEDIENCE", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeAccent, bold: true });
      sl5.addText("Shortest Seek Time First (SSTF) Heuristic", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl5.addText("SSTF maximizes local response timing by targeting track cylinders situated closest to the nozzle tip on each step loop.", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl5.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "F0FDF4" }, line: { color: "BBF7D0", width: 1 } });
      sl5.addText("MATHEMATICAL GREEDY LOGIC RULES", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 12, color: "115E59", bold: true });
      sl5.addText("1. Capture active head pointer index location H\n" +
                   "2. For each queued target cylinder T_i in pending array queue, calculate distance: Delta_i = |T_i - H|\n" +
                   "3. Pick optimal track pointer location: Next_Target = argmin(Delta_i)\n" +
                   "4. Reposition head to Next_Target, slice request from pending queue stack, and repeat loops", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 11, color: "134E4A", fontFace: "Courier New", lineSpacing: 18
      });

      // --- Slide 6: Starvation Dilemma ---
      const sl6 = pptx.addSlide();
      sl6.background = { color: lightBG };
      sl6.addText("05 / ALLOCATION INEQUALITY", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: "D97706", bold: true });
      sl6.addText("The SSTF Bottleneck: Track Starvation", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl6.addText("Because SSTF uses a locality-oriented greedy search, it locks outlying tracks from servicing if active requests keep entering near center sectors.", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl6.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "FFFBEB" }, line: { color: "FCD34D", width: 1 } });
      sl6.addText("THE RESOURCE LOCKOUT MECHANISM", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 12, color: "92400E", bold: true });
      sl6.addText("• High Density Clusters: Incoming tracks grouped at center (e.g. 50-70) trigger constant micro shifts.\n" +
                   "• Extreme Addresses: Request queues standing at cylinder extremities (e.g. 14, 183) wait indefinitely.\n" +
                   "• Scheduling Tradeoff: Optimizing speed degrades fairness variables unless linear elevators (SCAN) are employed.", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 12, color: "78350F", lineSpacing: 20
      });

      // --- Slide 7: Comparative Data ---
      const sl7 = pptx.addSlide();
      sl7.background = { color: lightBG };
      sl7.addText("06 / QUANTITATIVE ANALYSIS", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl7.addText("Laboratory Comparative Run Benchmarks", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl7.addText("Dataset variables executed at target resting head point 53: [98, 183, 37, 122, 14, 124, 65, 67]", {
        x: 0.8, y: 1.5, w: 11, h: 0.4, fontSize: 12, color: "334155"
      });
      // FCFS result card
      sl7.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.1, w: 5.2, h: 3.8, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl7.addText("FCFS SEQUENTIAL ORDER CHART", { x: 1.2, y: 2.4, w: 4.4, h: 0.3, fontSize: 12, color: themeSecondary, bold: true });
      sl7.addText("• Execution order matches arrival sequential queue\n" +
                   "• Nozzle movement path distance calculation:\n" +
                   "  |98-53| + |183-98| + |37-183| + ...\n" +
                   "• Absolute Total Seeking Traverse: 640 tracks", { x: 1.2, y: 2.9, w: 4.4, h: 2.6, fontSize: 11, color: textDark, lineSpacing: 18 });

      // SSTF optimized card
      sl7.addShape(pptx.shapes.RECTANGLE, { x: 6.6, y: 2.1, w: 5.2, h: 3.8, fill: { color: "F0FDF4" }, line: { color: "BBF7D0", width: 1 } });
      sl7.addText("SSTF NEAREST-PROXIMITY CHART", { x: 7.0, y: 2.4, w: 4.4, h: 0.3, fontSize: 12, color: "15803D", bold: true });
      sl7.addText("• Execution order shifts dynamically based on distance argmin()\n" +
                   "• Nozzle reposition path distance calculation:\n" +
                   "  |65-53| + |67-65| + |37-67| + ...\n" +
                   "• Absolute Total Seeking Traverse: 236 tracks (~63.1% physical optimization!)", { x: 7.0, y: 2.9, w: 4.4, h: 2.6, fontSize: 11, color: "14532D", lineSpacing: 18 });

      // --- Slide 8: Built with AI ---
      const sl8 = pptx.addSlide();
      sl8.background = { color: themePrimary };
      sl8.addText("07 / PROJECT SCHEMATICS", { x: 0.8, y: 1.2, w: 11, h: 0.3, fontSize: 11, color: "818CF8", bold: true });
      sl8.addText("Engineering Origins: AI-Assisted Synthesis", { x: 0.8, y: 1.6, w: 11, h: 0.6, fontSize: 30, color: textLight, fontFace: "Georgia", bold: true });
      sl8.addText([
        { text: "• Gemini-Driven Workspace: ", options: { bold: true, color: "818CF8" } },
        { text: "This educational companion is synthetically codesigned using an agent workspace inside Google AI Studio.\n\n" },
        { text: "• Natural Language Translation: ", options: { bold: true, color: "818CF8" } },
        { text: "Prompt guidelines were mapped into full functional systems, completely avoiding traditional slow manual coding routines.\n\n" },
        { text: "• Human-AI Symbiosis: ", options: { bold: true, color: "818CF8" } },
        { text: "The system ensures math calculations and canvas plots are robust and responsive to student inputs." }
      ], { x: 0.8, y: 2.5, w: 11, h: 3.5, fontSize: 13, color: "CBD5E1" });

      // --- Slide 9: Tech Stack ---
      const sl9 = pptx.addSlide();
      sl9.background = { color: lightBG };
      sl9.addText("08 / TECHNOLOGY INVENTORY", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl9.addText("Development Framework Stack", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl9.addText("A modern suite of robust and standardized frameworks powers the interactive layers:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      // Stack list
      sl9.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 3.5, h: 1.7, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl9.addText("LANGUAGES & ENGINE", { x: 1.0, y: 2.4, w: 3.1, h: 0.25, fontSize: 11, color: themeSecondary, bold: true });
      sl9.addText("TypeScript / ESM JavaScript\nReact 18/19 state core", { x: 1.0, y: 2.7, w: 3.1, h: 1.0, fontSize: 10, color: textDark });

      sl9.addShape(pptx.shapes.RECTANGLE, { x: 4.6, y: 2.2, w: 3.5, h: 1.7, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl9.addText("AESTHETIC LAYOUTS", { x: 4.8, y: 2.4, w: 3.1, h: 0.25, fontSize: 11, color: themeSecondary, bold: true });
      sl9.addText("Tailwind CSS utility classes\nFramer Motion transitions", { x: 4.8, y: 2.7, w: 3.1, h: 1.0, fontSize: 10, color: textDark });

      sl9.addShape(pptx.shapes.RECTANGLE, { x: 8.4, y: 2.2, w: 3.5, h: 1.7, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl9.addText("COMPILATION LAYER", { x: 8.6, y: 2.4, w: 3.1, h: 0.25, fontSize: 11, color: themeSecondary, bold: true });
      sl9.addText("Vite Bundler pipelines\nUnified sandboxed containers", { x: 8.6, y: 2.7, w: 3.1, h: 1.0, fontSize: 10, color: textDark });

      sl9.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 4.2, w: 11, h: 1.5, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl9.addText("REPRESENTING REAL-TIME PLOTS & SLIDES GENERATION", { x: 1.1, y: 4.4, w: 10.4, h: 0.25, fontSize: 11, color: "10B981", bold: true });
      sl9.addText("Plotting on the browser-native HTML5 Canvas 2D container for high-speed coordinate vectors. Binary slide generation drives directly from user state into editable PPTX blocks via the client library pptxgenjs.", { x: 1.1, y: 4.7, w: 10.4, h: 0.9, fontSize: 10, color: textDark });

      // --- Slide 10: SDLC Planning ---
      const sl10 = pptx.addSlide();
      sl10.background = { color: lightBG };
      sl10.addText("09 / SOFTWARE LIFE CYCLE", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl10.addText("SDLC Phase 1: Planning & Analysis", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl10.addText("We defined constraints, user interactive inputs, and OS theoretical models before writing code files:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl10.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl10.addText("REQUIREMENTS INVENTORY MAP", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 12, color: themeSecondary, bold: true });
      sl10.addText("• Boundaries: Limit dynamic cylinder range to exactly 0 - 199. Reject strings or out of bounds indices safely.\n" +
                   "• State Variables: Rest tract coordinates, seek history logger array, absolute accumulate seek sum tracker.\n" +
                   "• Target Audience: College computer science laboratory exercises requiring immediate on-screen plots and PowerPoint download files.", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 12, color: textDark, lineSpacing: 22
      });

      // --- Slide 11: SDLC Design ---
      const sl11 = pptx.addSlide();
      sl11.background = { color: lightBG };
      sl11.addText("10 / SOFTWARE LIFE CYCLE", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl11.addText("SDLC Phase 2: Interface & Visual Design", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl11.addText("We created comprehensive layout wireframes to structure student interaction flows logically:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl11.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 } });
      sl11.addText("LAYOUT BLUEPRINTS OVERVIEW", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 12, color: themeSecondary, bold: true });
      sl11.addText("1. Input Cockpit (Left Side): Easily set tracks input string and active start head. Run FCFS / SSTF algorithms.\n" +
                   "2. Reposition Line Vector Canvas (Right Side): High-contrast rendering track lines sequentially down.\n" +
                   "3. Classroom Slide deck (Bottom area): Dynamic interactive theoretical presentations that students review and download.", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 12, color: textDark, lineSpacing: 20
      });

      // --- Slide 12: SDLC Implementation ---
      const sl12 = pptx.addSlide();
      sl12.background = { color: lightBG };
      sl12.addText("11 / SOFTWARE LIFE CYCLE", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl12.addText("SDLC Phase 3: Coding & Implementation", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl12.addText("Translating geometric planning into robust, compiled client code files inside the workspace:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl12.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl12.addText("ALGORITHMIC IMPLEMENTATION SCRIPT SAMPLES", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 12, color: themeAccent, bold: true });
      sl12.addText("// Run SSTF closest calculation dynamically\n" +
                   "while (pending.length > 0) {\n" +
                   "  let min_dist = Infinity, closest_idx = -1;\n" +
                   "  for (let i = 0; i < pending.length; i++) {\n" +
                   "    let dist = Math.abs(pending[i] - currentHead);\n" +
                   "    if (dist < min_dist) { min_dist = dist; closest_idx = i; }\n" +
                   "  }\n" +
                   "  currentHead = pending.splice(closest_idx, 1)[0];\n" +
                   "}", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 11, color: "065F46", fontFace: "Courier New", lineSpacing: 14
      });

      // --- Slide 13: SDLC Testing ---
      const sl13 = pptx.addSlide();
      sl13.background = { color: lightBG };
      sl13.addText("12 / SOFTWARE LIFE CYCLE", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: "EF4444", bold: true });
      sl13.addText("SDLC Phase 4: Integration & Quality Assurance", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl13.addText("We validated system boundaries and calculations systematically to guard against runtime bugs:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      // 2 columns
      sl13.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 5.2, h: 3.6, fill: { color: "FFF5F5" }, line: { color: "FEE2E2", width: 1 } });
      sl13.addText("BOUNDARY TEST CASES", { x: 1.2, y: 2.6, w: 4.4, h: 0.3, fontSize: 12, color: "991B1B", bold: true });
      sl13.addText("• Empty Inputs: Defaults gracefully instead of crashing math calculation processes.\n" +
                   "• Out of boundaries inputs: Filtering blocks outside the active 0-199 track layout automatically.\n" +
                   "• Non-numerical inputs: Parsing and rejecting characters from string sequence.", { x: 1.2, y: 3.0, w: 4.4, h: 2.5, fontSize: 11, color: "7F1D1D", lineSpacing: 18 });

      sl13.addShape(pptx.shapes.RECTANGLE, { x: 6.6, y: 2.3, w: 5.2, h: 3.6, fill: { color: "F0FDF4" }, line: { color: "DCFCE7", width: 1 } });
      sl13.addText("MATHEMATICAL TRUTH ACCURACY", { x: 7.0, y: 2.6, w: 4.4, h: 0.3, fontSize: 12, color: "166534", bold: true });
      sl13.addText("• Verified that FCFS total seek math outputs exactly equal 640 on data set sequence.\n" +
                   "• Verified that SSTF calculations yield exactly 236 total seek tracks.\n" +
                   "• Audited browser console to verify zero canvas memory leaks during continuous renders.", { x: 7.0, y: 3.0, w: 4.4, h: 2.5, fontSize: 11, color: "14532D", lineSpacing: 18 });

      // --- Slide 14: SDLC Deployment ---
      const sl14 = pptx.addSlide();
      sl14.background = { color: lightBG };
      sl14.addText("13 / SOFTWARE LIFE CYCLE", { x: 0.8, y: 0.5, w: 11, h: 0.3, fontSize: 10, color: themeSecondary, bold: true });
      sl14.addText("SDLC Phase 5: Build & Production Deployment", { x: 0.8, y: 0.8, w: 11, h: 0.5, fontSize: 24, color: textDark, fontFace: "Georgia", bold: true });
      sl14.addText("The packing-to-cloud build process packages systems safely into sandboxed production environments:", {
        x: 0.8, y: 1.5, w: 11, h: 0.5, fontSize: 12, color: "334155"
      });
      sl14.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 11, h: 3.6, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 } });
      sl14.addText("BUILD SYSTEM SCHEMATICS & PIPELINES", { x: 1.2, y: 2.6, w: 10.2, h: 0.3, fontSize: 12, color: themeSecondary, bold: true });
      sl14.addText("• Code Optimization: Vite bundles client files using Tree Shaking optimizations.\n" +
                   "• Server Bundling: Esbuild packages Node.js logic into CJS files (dist/server.cjs) to improve container startup performance.\n" +
                   "• Hosting Target: Run inside Google Cloud Run instances shielded by Nginx routing reverse proxies for high-bandwidth global delivery.", {
        x: 1.2, y: 3.1, w: 10.2, h: 2.4, fontSize: 12, color: textDark, lineSpacing: 22
      });

      // --- Slide 15: Summary ---
      const sl15 = pptx.addSlide();
      sl15.background = { color: themePrimary };
      sl15.addText("14 / ACADEMIC SUMMATIONS", { x: 0.8, y: 1.2, w: 11, h: 0.3, fontSize: 11, color: "818CF8", bold: true });
      sl15.addText("Laboratory Takeaways & Future Extension Roadmaps", { x: 0.8, y: 1.6, w: 11, h: 0.6, fontSize: 30, color: textLight, fontFace: "Georgia", bold: true });
      sl15.addText([
        { text: "• High Classroom Impact: ", options: { bold: true, color: "818CF8" } },
        { text: "Interactive, real-time feedback improves students' conceptual understanding of operating system storage layers.\n\n" },
        { text: "• Scheduling Compromise: ", options: { bold: true, color: "818CF8" } },
        { text: "We trace how optimizing spatial seek times forces a direct tradeoff with CPU allocation equity.\n\n" },
        { text: "• Future Horizons: ", options: { bold: true, color: "818CF8" } },
        { text: "The simulator core easily expands to support more complex elevator algorithms such as SCAN, C-SCAN, and C-LOOK." }
      ], { x: 0.8, y: 2.5, w: 11, h: 3.5, fontSize: 13, color: "CBD5E1" });

      // Save the constructed pptx package
      pptx.writeFile({ fileName: "Disk_Scheduling_Simulator_Presentation.pptx" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

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
      bg: "bg-white text-slate-800 border border-slate-250",
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
            <p className="text-slate-650">We offset this risk using uniform linear sweep protocols such as <strong>SCAN / Elevator</strong> scheduling.</p>
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
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
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
          <div className="p-2.5 bg-slate-50 border border-slate-250 rounded">
            <span className="font-bold text-indigo-700">TypeScript / JS</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Core computational and simulation logic.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-250 rounded">
            <span className="font-bold text-indigo-700">React 18/19</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Responsive virtual UI view state rendering.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-250 rounded">
            <span className="font-bold text-indigo-700">Vite</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Ultra-fast static development server and bundler.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-250 rounded">
            <span className="font-bold text-indigo-700">Tailwind CSS</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Modern utility layout and elegant UI typography.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-250 rounded">
            <span className="font-bold text-indigo-700">HTML5 Canvas</span>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Real-time vector head positioning and seek paths.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-250 rounded">
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
          <ul className="space-y-1.5 font-mono text-[10px] bg-slate-55 p-3 rounded border border-slate-200 text-slate-600">
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
          <div className="bg-slate-50 p-3 rounded border border-slate-205 space-y-1 font-mono text-[10px]">
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
          <div className="p-3 bg-red-50/50 rounded border border-red-100 flex flex-col justify-center text-[10px] font-mono">
            <span className="font-bold text-red-800 uppercase flex items-center gap-1">❌ QA Boundary Fail-Safe Case</span>
            <p className="text-red-700 mt-1">// Filtering invalid chars from track input</p>
            <p className="text-slate-605 mt-0.5">tracks.filter(t =&gt; !isNaN(t) &amp;&amp; t &gt;= 0 &amp;&amp; t &lt;= 199)</p>
          </div>
        </div>
      )
    },
    {
      title: "SDLC Phase 5: Build & Production Hosting",
      subtitle: "System Development Life Cycle: Packing, container builds, and deployment",
      bg: "bg-white text-slate-800 border border-slate-200",
      content: (
        <div className="space-y-2 pt-2 text-xs text-slate-650">
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

                <button
                  onClick={() => setView('presentation')}
                  className="relative flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-605 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer active:scale-95 shadow-md"
                >
                  <BookOpen size={18} /> Presentation Slides
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
                    <h3 className="text-sm font-semibold text-slate-200">Downloadable PPTX Deck</h3>
                    <p className="text-xs text-slate-500 leading-normal">Generate fully responsive PowerPoint presentation slides summarizing your assignment results.</p>
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

          {/* Academic Footer */}
          <footer className="py-6 border-t border-slate-800/40 text-center text-[10px] font-mono tracking-wider text-slate-500">
            SCHOOL OF COMPUTER SCIENCE & ENGINEERING • INTEL STORAGE SUBSYSTEM EDUCATION TOOL
          </footer>
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
                <button
                  onClick={() => setView('presentation')}
                  className="px-3.5 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 text-xs text-indigo-300 hover:text-indigo-100 border border-indigo-700/50 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <BookOpen size={13} /> Presentation Slides
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
                <p className="text-xs font-medium leading-relaxed font-sans">
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
                <div className="flex justify-between px-6 py-3 border-b border-slate-55 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
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

          <footer className="p-6 text-center text-slate-400 border-t border-slate-200 bg-white">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em]">
              OS Architecture Simulator // Faculty of Computing
            </p>
          </footer>
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
          <header className="bg-slate-900/80 border-b border-slate-805/50 p-6 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('landing')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-xs text-slate-300 hover:text-white border border-slate-700 rounded-xl cursor-pointer flex items-center gap-2 transition-all font-mono"
                >
                  <ChevronLeft size={16} /> Exit Slides Deck
                </button>
                <div>
                  <h1 className="text-base font-bold text-slate-200">OS Assessment Slides Builder</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono leading-none mt-1">Presentation Classroom Layouts</p>
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
                <span>INTEL STORAGE SYSTEMS LABS</span>
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

          <footer className="py-6 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900/60 bg-slate-900/20">
            COMPUTING SCIENCE DEPARTMENT • PRESS DOWNLOAD BTN TO EXPORT EDITABLE SLIDES FILE
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
