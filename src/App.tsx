import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calculator, 
  BookOpen, 
  GraduationCap, 
  TestTube, 
  Award, 
  Search, 
  Bookmark, 
  Play, 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Scale, 
  DollarSign, 
  Share2, 
  Printer, 
  Volume2, 
  ChevronRight, 
  Menu, 
  X, 
  Layers, 
  Database, 
  Cpu, 
  Info,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateFaraidh, formatFraction } from './faraidh_engine/engine';
import { FaraidhInput, HeirKey, HeirResult, ALL_HEIRS_LIST } from './faraidh_engine/types';
import { RAHBIYYAH_LESSONS, RahbiyyahLesson, QuizQuestion } from './faraidh_engine/lessons';
import { FARAIDH_TEST_CASES, TestCase } from './faraidh_engine/tests';
import { WarisLogo } from './components/WarisLogo';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'calculator' | 'results' | 'lessons' | 'tests' | 'store'>('calculator');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- CALCULATOR STATES ---
  const [deceasedGender, setDeceasedGender] = useState<'L' | 'P'>('L');
  const [assets, setAssets] = useState<number>(360000000);
  const [debts, setDebts] = useState<number>(10000000);
  const [funeralCosts, setFuneralCosts] = useState<number>(5000000);
  const [bequest, setBequest] = useState<number>(25000000);
  
  // Heirs selection count map
  const [selectedHeirs, setSelectedHeirs] = useState<Record<HeirKey, number>>({
    anak_lk: 2,
    anak_pr: 1,
    ibu: 1,
    ayah: 1,
    istri: 1,
    suami: 0,
    cucu_lk: 0,
    cucu_pr: 0,
    kakek: 0,
    saudara_knd: 0,
    saudara_by: 0,
    saudara_bu: 0,
    keponakan_knd: 0,
    keponakan_by: 0,
    paman_knd: 0,
    paman_by: 0,
    sepupu_knd: 0,
    sepupu_by: 0,
    mu_tiq: 0,
    nenek_ibu: 0,
    nenek_ayah: 0,
    saudari_knd: 0,
    saudari_by: 0,
    saudari_bu: 0,
    mu_tiqah: 0,
  });

  // Calculate Result real-time
  const faraidhInput: FaraidhInput = useMemo(() => {
    // Filter out only heirs corresponding to selected counts
    const heirs: Partial<Record<HeirKey, number>> = {};
    Object.entries(selectedHeirs).forEach(([key, val]) => {
      const count = val as number;
      if (count > 0) {
        heirs[key as HeirKey] = count;
      }
    });

    return {
      deceasedGender,
      assets,
      debts,
      funeralCosts,
      bequest,
      heirs
    };
  }, [deceasedGender, assets, debts, funeralCosts, bequest, selectedHeirs]);

  const outputResult = useMemo(() => {
    return calculateFaraidh(faraidhInput);
  }, [faraidhInput]);

  // --- OFFLINE PERSISTED HISTORY & BOOKMARKS STATE ---
  const [calculationHistory, setCalculationHistory] = useState<any[]>([]);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load persisted state safely
    try {
      const historyStr = localStorage.getItem('waris_history');
      if (historyStr) setCalculationHistory(JSON.parse(historyStr));

      const bookmarksStr = localStorage.getItem('waris_bookmarks');
      if (bookmarksStr) setBookmarkedLessons(JSON.parse(bookmarksStr));

      const scoresStr = localStorage.getItem('waris_scores');
      if (scoresStr) setQuizScores(JSON.parse(scoresStr));
    } catch (e) {
      console.error("Error retrieving stored state", e);
    }
  }, []);

  const saveToHistory = () => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      deceasedGender,
      assets,
      netEstate: outputResult.netEstate,
      heirsCount: Object.values(faraidhInput.heirs).reduce((a, b) => a + b, 0),
      summaryText: outputResult.specialCaseName ? `Kasus Spesial: ${outputResult.specialCaseName}` : `Asal Masalah: ${outputResult.finalProblem}`
    };
    const updated = [newRecord, ...calculationHistory.slice(0, 9)];
    setCalculationHistory(updated);
    localStorage.setItem('waris_history', JSON.stringify(updated));
    alert("Riwayat perhitungan waris berhasil disimpan!");
  };

  const deleteHistory = (id: number) => {
    const updated = calculationHistory.filter(item => item.id !== id);
    setCalculationHistory(updated);
    localStorage.setItem('waris_history', JSON.stringify(updated));
  };

  const toggleBookmark = (lessonId: string) => {
    let updated: string[];
    if (bookmarkedLessons.includes(lessonId)) {
      updated = bookmarkedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...bookmarkedLessons, lessonId];
    }
    setBookmarkedLessons(updated);
    localStorage.setItem('waris_bookmarks', JSON.stringify(updated));
  };

  // --- EDUCATIONAL MODULE / LESSONS STATES ---
  const [selectedLesson, setSelectedLesson] = useState<RahbiyyahLesson>(RAHBIYYAH_LESSONS[0]);
  const [lessonSearchText, setLessonSearchText] = useState('');
  const [quizScoreCard, setQuizScoreCard] = useState<Record<string, { answered: boolean; userIndex: number; isCorrect: boolean }>>({});
  const filteredLessons = useMemo(() => {
    if (!lessonSearchText) return RAHBIYYAH_LESSONS;
    const query = lessonSearchText.toLowerCase();
    return RAHBIYYAH_LESSONS.filter(l => 
      l.title.toLowerCase().includes(query) || 
      l.summary.toLowerCase().includes(query) ||
      l.verses.some(v => v.arabic.includes(query) || v.indonesian.toLowerCase().includes(query))
    );
  }, [lessonSearchText]);

  // Audio simulation per bait: generates serene chiming sequences matching the poetic meter
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playVerseAudioChime = (verseNo: number, text: string) => {
    if (isPlayingAudio === verseNo) {
      setIsPlayingAudio(null);
      return;
    }
    setIsPlayingAudio(verseNo);

    // Initialise Web Audio API context
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Play a beautiful meditative minor pentatonic cascading arpeggio simulating desert recitation chime
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C major pentatonic
      let time = ctx.currentTime;
      
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Custom woodwind/plucked string sound envelope
        osc.type = 'triangle';
        const noteIndex = (verseNo + i) % scale.length;
        osc.frequency.setValueAtTime(scale[noteIndex], time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
        
        osc.start(time);
        osc.stop(time + 1.3);
        time += 0.25; // staggered notes
      }

      setTimeout(() => {
        setIsPlayingAudio(null);
      }, 2000);

    } catch (e) {
      console.warn("Audio Context is blocked or not supported on this browser.", e);
      setIsPlayingAudio(null);
    }
  };

  // --- INTERACTIVE CHATBOT (GEMINI AI SHAIKH CONSULTANT) ---
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAiScholar = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: aiQuestion,
          heirContext: selectedHeirs,
          assetsContext: assets
        })
      });
      const data = await res.json();
      if (data.answer) {
        setAiAnswer(data.answer);
      } else if (data.error) {
        setAiAnswer(`⚠️ Terjadi kesalahan: ${data.error}`);
      }
    } catch (err) {
      setAiAnswer('⚠️ Tidak dapat terhubung ke server AI Waris Rahbiyyah.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyPreset = (heirSetup: any, isMale: 'L' | 'P') => {
    setDeceasedGender(isMale);
    const cleared = { ...selectedHeirs };
    Object.keys(cleared).forEach(k => {
      cleared[k as HeirKey] = 0;
    });
    Object.entries(heirSetup).forEach(([k, val]) => {
      cleared[k as HeirKey] = val as number;
    });
    setSelectedHeirs(cleared);
    setActiveTab('results');
  };

  // --- AUTOMATED 100 TESTS RUNNER STATE ---
  const [testSuiteRunning, setTestSuiteRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ id: number; name: string; success: boolean; error: string | null; timeMs: number }[]>([]);
  const [testStats, setTestStats] = useState({ totalRun: 0, passed: 0, failed: 0, runTime: 0 });

  // --- PRINT CONFIGURATION STATE ---
  const [deceasedName, setDeceasedName] = useState("");
  const [printNotes, setPrintNotes] = useState("");
  const [includeMathSteps, setIncludeMathSteps] = useState(true);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const runAllTests = () => {
    setTestSuiteRunning(true);
    setTestResults([]);
    const startOverall = performance.now();
    let passedCount = 0;
    const runLogs: any[] = [];

    // Run sequentially with microtask delays to keep UI smooth and progressive
    FARAIDH_TEST_CASES.forEach((tc, idx) => {
      const startTc = performance.now();
      let success = false;
      let errorDesc: string | null = null;
      try {
        const res = calculateFaraidh(tc.input);
        
        // Assertions
        if (res.errorMessages && res.errorMessages.length > 0) {
          errorDesc = `Validasi gagal: ${res.errorMessages.join("; ")}`;
        } else if (!res.isValid) {
          errorDesc = "Distribusi akhir persen tidak mencapai tepat 100% dari total porsi.";
        } else if (tc.expectedSpecialCase && res.specialCaseName !== tc.expectedSpecialCase) {
          errorDesc = `Kasus spesial tidak terdeteksi. Ekspektasi: ${tc.expectedSpecialCase}, Dapat: ${res.specialCaseName || 'Normal'}`;
        } else {
          success = true;
          passedCount++;
        }
      } catch (err: any) {
        errorDesc = `Sistem Error: ${err.message}`;
      }
      const endTc = performance.now();
      runLogs.push({
        id: tc.id,
        name: tc.name,
        success,
        error: errorDesc,
        timeMs: parseFloat((endTc - startTc).toFixed(2))
      });
    });

    const endOverall = performance.now();
    setTestResults(runLogs);
    setTestStats({
      totalRun: FARAIDH_TEST_CASES.length,
      passed: passedCount,
      failed: FARAIDH_TEST_CASES.length - passedCount,
      runTime: Math.round(endOverall - startOverall)
    });
    setTestSuiteRunning(false);
  };

  // Export & Share Mock Simulator
  const handleExportPDF = () => {
    setShowPrintPreview(true);
  };

  const handlePrintInNewTab = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('print-report-content')?.innerHTML || '';
      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Resmi Faraidh - Waris Rahbiyyah</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
            <style>
              body { 
                font-family: 'Inter', sans-serif; 
                background-color: #f8fafc;
                margin: 0;
                padding: 1.5rem;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .font-serif { font-family: 'Georgia', serif; }
              .font-arabic { font-family: 'Amiri', serif; }
              .font-display { font-family: 'Space Grotesk', sans-serif; }
              .font-mono { font-family: 'JetBrains Mono', monospace; }
              
              @media print {
                body {
                  background-color: #ffffff;
                  padding: 0;
                  margin: 0;
                }
                .no-print {
                  display: none !important;
                }
                .print-shadow-none {
                  box-shadow: none !important;
                  border: none !important;
                  padding: 0 !important;
                }
              }
            </style>
          </head>
          <body class="bg-slate-50 py-6 px-4">
            <div class="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow-lg rounded-xl border border-slate-200 print-shadow-none">
              <!-- Helper controls at the top, hidden on print -->
              <div class="no-print flex flex-col md:flex-row items-center justify-between gap-3 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 font-sans text-xs">
                <div>
                  <h4 class="font-bold text-slate-800 text-sm">Dokumen Laporan Faraidh Siap Cetak</h4>
                  <p class="text-slate-500 mt-0.5">Sistem telah memformat halaman cetak resmi Anda. Klik tombol di kanan atau tekan <strong>Ctrl + P</strong> / <strong>Cmd + P</strong>.</p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button onclick="window.print()" class="flex-1 md:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition">
                    Cetak / Simpan PDF
                  </button>
                  <button onclick="window.close()" class="flex-1 md:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-705 font-bold rounded-lg transition font-sans">
                    Tutup Halaman
                  </button>
                </div>
              </div>
              
              <div class="text-slate-900 font-sans">
                ${content}
              </div>
            </div>
            <script>
              setTimeout(function() {
                window.print();
              }, 1200);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("Popup cetak otomatis diblokir oleh browser Anda! Silakan aktifkan izin popup untuk web ini di pengaturan bar alamat browser Anda, atau simpan/cetak langsung.");
      window.print();
    }
  };

  return (
    <>
      {/* INTERACTIVE WEB VIEW */}
      <div className="min-h-screen bg-slate-50 flex flex-col antialiased print:hidden">
      
      {/* HEADER BAR */}
      <header className="bg-[#047857] text-white shadow-md border-b border-[#064e3b] sticky top-0 z-50 px-4 md:px-8 py-2 md:py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WarisLogo variant="horizontal" lightHeaderMode={true} height="44px" />
          <div className="border-l border-emerald-600/70 pl-3 py-1 hidden md:block">
            <span className="text-[10px] text-emerald-200 block font-bold tracking-wider uppercase">Faraidh Syafi'iyyah</span>
            <span className="text-[9px] text-emerald-100/70 block font-mono">Rule Engine Presisi</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Menu Items for Large Screens */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('calculator')} 
              className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'calculator' ? 'bg-[#064e3b] text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              <Calculator className="w-4 h-4" /> Kalkulator
            </button>
            <button 
              onClick={() => setActiveTab('results')} 
              className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'results' ? 'bg-[#064e3b] text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              <TrendingUp className="w-4 h-4" /> Hasil Perhitungan
              {outputResult.heirResults.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('lessons')} 
              className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'lessons' ? 'bg-[#064e3b] text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              <BookOpen className="w-4 h-4" /> Kitab Rahbiyyah
            </button>
            <button 
              onClick={() => setActiveTab('tests')} 
              className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'tests' ? 'bg-[#064e3b] text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              <TestTube className="w-4 h-4" /> Diagnostics Suite
            </button>
            <button 
              onClick={() => setActiveTab('store')} 
              className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'store' ? 'bg-[#064e3b] text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              <Layers className="w-4 h-4" /> Arsitektur & Play Store
            </button>
          </nav>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-emerald-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-[60px] h-[calc(100vh-60px)] w-72 bg-white text-slate-800 shadow-2xl z-55 lg:hidden flex flex-col p-4 border-l border-slate-200"
            >
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { setActiveTab('calculator'); setSidebarOpen(false); }} 
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'calculator' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-100'}`}
                >
                  <Calculator className="w-5 h-5 text-emerald-600" /> Kalkulator Waris
                </button>
                <button 
                  onClick={() => { setActiveTab('results'); setSidebarOpen(false); }} 
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'results' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-100'}`}
                >
                  <TrendingUp className="w-5 h-5 text-emerald-600" /> Hasil Perhitungan
                </button>
                <button 
                  onClick={() => { setActiveTab('lessons'); setSidebarOpen(false); }} 
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'lessons' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-100'}`}
                >
                  <BookOpen className="w-5 h-5 text-emerald-600" /> Kitab Ar-Rahbiyyah
                </button>
                <button 
                  onClick={() => { setActiveTab('tests'); setSidebarOpen(false); }} 
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'tests' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-100'}`}
                >
                  <TestTube className="w-5 h-5 text-emerald-600" /> Diagnostics Suite
                </button>
                <button 
                  onClick={() => { setActiveTab('store'); setSidebarOpen(false); }} 
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'store' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-100'}`}
                >
                  <Layers className="w-5 h-5 text-emerald-600" /> Arsitektur & Play Store
                </button>
              </div>

              <div className="mt-auto border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 text-center">Waris Rahbiyyah v1.0.0 (Web SPA Release)</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">

        {/* TOP COMPLIANT BANNER / STICKY DISCLAIMER */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-3 shadow-sm">
          <AlertTriangle className="text-amber-600 w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm">
            <span className="font-semibold text-amber-900">Disclaimer Hukum:</span> Aplikasi ini merupakan alat bantu pembelajaran dan simulasi pembagian waris berdasarkan kaidah ilmu faraidh dalam Kitab Ar-Rahbiyyah. Untuk penetapan hukum waris pada kasus nyata, konsultasikan kepada ahli faraidh atau lembaga syariah yang berwenang.
          </div>
        </div>

        {/* MAIN BODY CONTENTS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: KALKULATOR */}
          {activeTab === 'calculator' && (
            <motion.div 
              key="calc"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Financial Inputs & Presets Container */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Financial Form card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <DollarSign className="text-emerald-700 w-5 h-5" />
                    <h2 className="font-display font-semibold text-lg text-slate-800">1. Data Harta Istihqaq</h2>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Gender Pewaris (Yang Wafat)</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button 
                        type="button"
                        onClick={() => { setDeceasedGender('L'); setSelectedHeirs(prev => ({ ...prev, suami: 0 })); }}
                        className={`py-2 px-4 rounded-xl border font-medium text-sm transition ${deceasedGender === 'L' ? 'bg-[#047857] text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      >
                        🧔 Laki-laki (Almarhum)
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setDeceasedGender('P'); setSelectedHeirs(prev => ({ ...prev, istri: 0 })); }}
                        className={`py-2 px-4 rounded-xl border font-medium text-sm transition ${deceasedGender === 'P' ? 'bg-[#047857] text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      >
                        🧕 Perempuan (Almarhumah)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Total Harta Kasar (Rp)</label>
                    <input 
                      type="number"
                      value={assets}
                      onChange={(e) => setAssets(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Hutang (Rp)</label>
                      <input 
                        type="number"
                        value={debts}
                        onChange={(e) => setDebts(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-600 outline-none transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Biaya Makam (Rp)</label>
                      <input 
                        type="number"
                        value={funeralCosts}
                        onChange={(e) => setFuneralCosts(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Wasiat Pewaris (Rp)</label>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Maks 1/3 Harta Bersih</span>
                    </div>
                    <input 
                      type="number"
                      value={bequest}
                      onChange={(e) => setBequest(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Quick Presets / Classic Cases Preset card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Award className="text-emerald-700 w-5 h-5" />
                    <h3 className="font-display font-semibold text-base text-slate-800">Kasus Penting Preset</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleApplyPreset({ suami: 1, ibu: 1, kakek: 1, saudari_knd: 1 }, 'P')}
                      className="text-left w-full hover:bg-slate-50 p-2.5 border border-slate-100 rounded-xl transition text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">💎 Masalah Al-Akdariyyah</span>
                        <span className="text-slate-500">Suami + Ibu + Kakek + Saudari Kandung</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => handleApplyPreset({ suami: 1, ibu: 1, saudara_bu: 2, saudara_knd: 1 }, 'P')}
                      className="text-left w-full hover:bg-slate-50 p-2.5 border border-slate-100 rounded-xl transition text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">💎 Musyarakah (Himariyyah)</span>
                        <span className="text-slate-500">Suami + Ibu + 2 Sdr Seibu + Sdr Kandung</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => handleApplyPreset({ istri: 1, ibu: 1, ayah: 1 }, 'L')}
                      className="text-left w-full hover:bg-slate-50 p-2.5 border border-slate-100 rounded-xl transition text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">💡 Al-Ghorrawain (Umariyyah)</span>
                        <span className="text-slate-500">Istri + Ibu + Ayah (Sepertiga Sisa)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    <button 
                      onClick={() => handleApplyPreset({ istri: 1, ibu: 1, ayah: 1, anak_pr: 2 }, 'L')}
                      className="text-left w-full hover:bg-slate-50 p-2.5 border border-slate-100 rounded-xl transition text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">⚡ Masalah Minbariyyah (Aul 24 ke 27)</span>
                        <span className="text-slate-500">Istri + Ibu + Ayah + 2 Anak Perempuan</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Calculation History List Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="text-emerald-700 w-5 h-5" />
                      <h3 className="font-display font-semibold text-base text-slate-800">Riwayat Tersimpan</h3>
                    </div>
                    {calculationHistory.length > 0 && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                        {calculationHistory.length} Kasus
                      </span>
                    )}
                  </div>

                  {calculationHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 italic">Belum ada riwayat tersimpan offline.</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {calculationHistory.map((item) => (
                        <div key={item.id} className="p-2 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                          <div className="text-[10px]">
                            <p className="font-semibold text-slate-700">{item.summaryText}</p>
                            <p className="text-slate-400 font-mono">{item.date} • Pewaris: {item.deceasedGender === 'L' ? 'L' : 'P'}</p>
                          </div>
                          <button 
                            onClick={() => deleteHistory(item.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition"
                            title="Hapus riwayat"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Heirs Selector Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Heirs grid controls */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h2 className="font-display font-semibold text-lg text-slate-800">2. Pilih Jumlah Ahli Waris Aktif</h2>
                      <p className="text-xs text-slate-500 mt-1">Sistem Rule-Engine akan menyaring otomatis penerima Ashabul Furudh dan ashabah.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const reseted = { ...selectedHeirs };
                        Object.keys(reseted).forEach(k => {
                          reseted[k as HeirKey] = 0;
                        });
                        setSelectedHeirs(reseted);
                      }}
                      className="text-xs bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 py-1.5 px-3.5 rounded-xl transition flex items-center justify-center gap-1.5 self-start"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Ahli Waris
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    
                    {/* ASHABUL FURUDH GROUPS */}
                    {/* 1. Pasangan */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">I. Pasangan (Spouse)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deceasedGender === 'P' ? (
                          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-emerald-100/50">
                            <div>
                              <span className="font-bold text-sm block">Suami (الزوج)</span>
                              <span className="text-[10px] text-slate-400">Ahli waris pria primer. Maksimal 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setSelectedHeirs(p => ({ ...p, suami: Math.max(0, p.suami - 1) }))} 
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                              >-</button>
                              <span className="font-mono text-center w-6 font-bold">{selectedHeirs.suami}</span>
                              <button 
                                onClick={() => setSelectedHeirs(p => ({ ...p, suami: Math.min(1, p.suami + 1) }))} 
                                className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold"
                              >+</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-emerald-100/50">
                            <div>
                              <span className="font-bold text-sm block">Istri (الزوجة)</span>
                              <span className="text-[10px] text-slate-400">Penerima 1/4 atau 1/8. Maksimal 4</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setSelectedHeirs(p => ({ ...p, istri: Math.max(0, p.istri - 1) }))} 
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                              >-</button>
                              <span className="font-mono text-center w-6 font-bold">{selectedHeirs.istri}</span>
                              <button 
                                onClick={() => setSelectedHeirs(p => ({ ...p, istri: Math.min(4, p.istri + 1) }))} 
                                className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold"
                              >+</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Keturunan Utama */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">II. Anak & Cucu (Keturunan)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Anak Laki-laki (الابن)</span>
                            <span className="text-[10px] text-slate-400">Ashabah utama bin nafsih</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, anak_lk: Math.max(0, p.anak_lk - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.anak_lk}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, anak_lk: p.anak_lk + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Anak Perempuan (البنت)</span>
                            <span className="text-[10px] text-slate-400">Penerima 1/2 atau 2/3</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, anak_pr: Math.max(0, p.anak_pr - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.anak_pr}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, anak_pr: p.anak_pr + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Cucu Lk dari Anak Lk</span>
                            <span className="text-[10px] text-slate-400">Terhalang jika ada Anak Lk</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, cucu_lk: Math.max(0, p.cucu_lk - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.cucu_lk}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, cucu_lk: p.cucu_lk + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Cucu Pr dari Anak Lk</span>
                            <span className="text-[10px] text-slate-400">Bisa terhalang 2 Anak Perempuan</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, cucu_pr: Math.max(0, p.cucu_pr - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.cucu_pr}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, cucu_pr: p.cucu_pr + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Leluhur */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">III. Ayah, Ibu & Kakek, Nenek (Leluhur)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Ayah (الأب)</span>
                            <span className="text-[10px] text-slate-400">Tidak pernah terhalang total</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, ayah: Math.max(0, p.ayah - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.ayah}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, ayah: Math.min(1, p.ayah + 1) }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Ibu (الأم)</span>
                            <span className="text-[10px] text-slate-400">Tidak pernah terhalang total</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, ibu: Math.max(0, p.ibu - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.ibu}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, ibu: Math.min(1, p.ibu + 1) }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Kakek Shahih (الجد الصحيح)</span>
                            <span className="text-[10px] text-slate-400">Terhalang jika ada bapak pewaris</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, kakek: Math.max(0, p.kakek - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.kakek}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, kakek: Math.min(1, p.kakek + 1) }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Nenek dari Ibu</span>
                            <span className="text-[10px] text-slate-400">Terhalang jika ada ibu</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, nenek_ibu: Math.max(0, p.nenek_ibu - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.nenek_ibu}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, nenek_ibu: Math.min(1, p.nenek_ibu + 1) }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Nenek dari Ayah</span>
                            <span className="text-[10px] text-slate-400">Terhalang jika ada ayah / ibu</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, nenek_ayah: Math.max(0, p.nenek_ayah - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.nenek_ayah}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, nenek_ayah: Math.min(1, p.nenek_ayah + 1) }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Saudara & Saudari */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">IV. Saudara & Saudari (Siblings)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Saudara Laki-Laki Kandung</span>
                            <span className="text-[10px] text-slate-400">Ukhwah Syaqiq (Kandung)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudara_knd: Math.max(0, p.saudara_knd - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.saudara_knd}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudara_knd: p.saudara_knd + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Saudari Perempuan Kandung</span>
                            <span className="text-[10px] text-slate-400">Fardh 1/2, 2/3 atau ashabah</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudari_knd: Math.max(0, p.saudari_knd - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.saudari_knd}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudari_knd: p.saudari_knd + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Saudara Laki-Laki Seayah</span>
                            <span className="text-[10px] text-slate-400">Terhalang jika ada Sdr Kandung Lk</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudara_by: Math.max(0, p.saudara_by - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.saudara_by}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudara_by: p.saudara_by + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Saudari Perempuan Seayah</span>
                            <span className="text-[10px] text-slate-400">Ukhwah li Ab</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudari_by: Math.max(0, p.saudari_by - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.saudari_by}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudari_by: p.saudari_by + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Saudara Laki-Laki Seibu</span>
                            <span className="text-[10px] text-slate-400">Membagi rata bersama wanita</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudara_bu: Math.max(0, p.saudara_bu - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.saudara_bu}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudara_bu: p.saudara_bu + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Saudari Perempuan Seibu</span>
                            <span className="text-[10px] text-slate-400">Membagi rata bersama pria</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudari_bu: Math.max(0, p.saudari_bu - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.saudari_bu}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, saudari_bu: p.saudari_bu + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Keponakan, Paman, Sepupu */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">V. Kerabat Sekunder (Keponakan & Paman)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Anak Lk Sdr Kandung</span>
                            <span className="text-[10px] text-slate-400">Keponakan laki-laki</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, keponakan_knd: Math.max(0, p.keponakan_knd - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.keponakan_knd}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, keponakan_knd: p.keponakan_knd + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">Paman Kandung</span>
                            <span className="text-[10px] text-slate-400">Saudara ayah kandung</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, paman_knd: Math.max(0, p.paman_knd - 1) }))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold">-</button>
                            <span className="font-mono text-center w-6 font-bold">{selectedHeirs.paman_knd}</span>
                            <button onClick={() => setSelectedHeirs(p => ({ ...p, paman_knd: p.paman_knd + 1 }))} className="w-8 h-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                      onClick={() => setActiveTab('results')}
                      className="px-6 py-3 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 transition flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      Proses Pembagian Waris <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: HASIL PERHITUNGAN */}
          {activeTab === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6"
            >
              
              {/* Back to Calculator Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100/80">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-inner">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-emerald-900 text-sm md:text-base">Hasil Perhitungan Berhasil Dihimpun</h4>
                    <p className="text-xs text-emerald-700/80 mt-0.5">Seluruh rincian pembagian ashabul furudh waris telah siap ditinjau.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs md:text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                  <span>Kembali ke Kalkulator Waris</span>
                </button>
              </div>
              
              {/* Top Result State Quick Overview card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="md:col-span-2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    {outputResult.isValid ? (
                      <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Rule Engine Valid (100%)
                      </span>
                    ) : (
                      <span className="text-xs bg-red-50 text-red-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Validasi Error
                      </span>
                    )}
                    {outputResult.specialCaseName && (
                      <span className="text-xs bg-purple-50 text-purple-800 font-bold px-3 py-1 rounded-full">
                        ✨ {outputResult.specialCaseName}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">Penyelesaian Faraidh</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Harta Bersih: <span className="font-mono font-semibold text-slate-700">Rp {outputResult.netEstate.toLocaleString('id-ID')}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-center border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asal Masalah Utama</span>
                  <span className="font-mono text-3xl font-bold text-[#047857]">{outputResult.ancestralProblem}</span>
                  <span className="text-[10px] text-slate-500 mt-1">Pembagi KPK awal</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-center border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masalah Akhir (Tashih)</span>
                  <span className="font-mono text-3xl font-bold text-emerald-800">
                    {outputResult.finalProblem} {outputResult.isAul && <span className="text-xs text-purple-600 font-sans font-medium">(Aul)</span>}
                    {outputResult.isRadd && <span className="text-xs text-blue-600 font-sans font-medium">(Radd)</span>}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Setelah penyesuaian porsi</span>
                </div>

              </div>

              {/* Grid of details & diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart and Actions */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-display font-semibold text-slate-800">Visual Distribusi</h3>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={handleExportPDF}
                        className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Ekspor PDF / Cetak"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={saveToHistory}
                        className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition text-xs font-bold flex items-center gap-1"
                        title="Simpan ke Riwayat Offline"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>

                  {/* Beautiful Clean Native SVG Circular Sector Diagram */}
                  <div className="flex justify-center items-center py-6 relative">
                    {outputResult.heirResults.filter(h => h.totalPercentage > 0).length === 0 ? (
                      <div className="text-center text-xs text-slate-400 italic py-10">Pilih ahli waris untuk melihat diagram.</div>
                    ) : (
                      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                        {(() => {
                          let accumulatedPercentage = 0;
                          const premiumColors = ["#2d5a27", "#b8860b", "#4f8246", "#dcb23c", "#709c67", "#8fa189", "#1d4418", "#d4b355"];
                          return outputResult.heirResults
                            .filter(h => h.totalPercentage > 0)
                            .map((h, i) => {
                              const strokeDasharray = `${h.totalPercentage} ${100 - h.totalPercentage}`;
                              const strokeDashoffset = 100 - accumulatedPercentage + 25; // start at top vertical
                              accumulatedPercentage += h.totalPercentage;
                              const color = premiumColors[i % premiumColors.length];
                              return (
                                <circle 
                                  key={h.key}
                                  cx="21" 
                                  cy="21" 
                                  r="15.915" 
                                  fill="transparent" 
                                  stroke={color} 
                                  strokeWidth="6px" 
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                />
                              );
                            });
                        })()}
                        {/* Center Hole Accent */}
                        <circle cx="21" cy="21" r="11" fill="white" />
                      </svg>
                    )}
                  </div>

                  {/* Diagram Legend */}
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {outputResult.heirResults.filter(h => h.totalPercentage > 0).map((h, i) => {
                      const premiumColors = ["#2d5a27", "#b8860b", "#4f8246", "#dcb23c", "#709c67", "#8fa189", "#1d4418", "#d4b355"];
                      const color = premiumColors[i % premiumColors.length];
                      return (
                        <div key={h.key} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: color }}></span>
                            <span className="font-semibold text-slate-700 truncate">{h.name} ({h.qty}x)</span>
                          </div>
                          <span className="font-mono font-bold text-slate-500 shrink-0">{h.totalPercentage.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Heir Portion breakdown card */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                  <h3 className="font-display font-semibold text-lg text-slate-800 pb-3 border-b border-slate-100">Distribusi Porsi Ahli Waris</h3>
                  
                  {outputResult.heirResults.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 italic text-sm">Harap tentukan ahli waris di tab Kalkulator terlebih dahulu.</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {outputResult.heirResults.map((heir) => (
                        <div 
                          key={heir.key} 
                          className={`p-4 rounded-2xl border transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${heir.status === 'Gugur' ? 'bg-red-50/40 border-red-100 opacity-70' : 'bg-slate-50 border-slate-100 hover:shadow-sm'}`}
                        >
                          <div className="flex gap-3">
                            <div className="text-xl pt-1">
                              {heir.status === 'Gugur' ? '❌' : '✅'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">{heir.name} <span className="text-xs text-slate-400 font-normal">({heir.qty} orang)</span></span>
                                <span className="text-xs arabic-text text-emerald-800">{heir.arabicName}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 italic leading-relaxed whitespace-pre-wrap">{heir.reason}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-8 sm:pl-0">
                            {heir.status === 'Gugur' ? (
                              <span className="text-xs font-bold text-red-700 bg-red-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">GUGUR (MAHJUB)</span>
                            ) : (
                              <>
                                <span className="font-mono text-sm font-bold text-slate-800">{heir.originalShare} porsi kelompok</span>
                                <span className="text-xs text-slate-500 font-mono mt-0.5">Rp {heir.amountPerIndiv.toLocaleString('id-ID')} / orang</span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 rounded-full font-bold mt-1">Total: Rp {heir.totalAmount.toLocaleString('id-ID')} ({heidPercentFormatted(heir.totalPercentage)})</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

              {/* PRINT MENU CARD */}
              <div id="print-menu-card" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-2">
                    <Printer className="w-5 h-5 text-emerald-700" /> Menu Cetak Laporan Faraidh Resmi
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Konfigurasi dokumen cetak fisik atau PDF hasil perhitungan dengan menyisipkan rincian nama pewaris dan catatan syar'i keluarga.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Metadata Input Options */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label id="lbl-deceased-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Nama Pewaris (Almarhum / Almarhumah)
                      </label>
                      <input 
                        type="text"
                        value={deceasedName}
                        onChange={(e) => setDeceasedName(e.target.value)}
                        placeholder="Misal: H. Ahmad Fauzi"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                      />
                    </div>

                    <div>
                      <label id="lbl-print-notes" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Catatan Tambahan Keluarga / Keterangan
                      </label>
                      <textarea 
                        value={printNotes}
                        onChange={(e) => setPrintNotes(e.target.value)}
                        placeholder="Misal: Kesepakatan pembagian berdasarkan urutan ashabul furudh Syafi'iyyah, disaksikan seluruh ahli waris di Bandung."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition resize-none"
                      />
                    </div>
                  </div>

                  {/* Print Document Checkboxes */}
                  <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-col gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Pilihan Konten Dokumen
                      </span>
                      
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700">
                        <input 
                          type="checkbox"
                          checked={includeMathSteps}
                          onChange={(e) => setIncludeMathSteps(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium">Sertakan Langkah Rinci Matematika (Tashih)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer text-slate-700">
                        <input 
                          type="checkbox"
                          checked={includeExplanations}
                          onChange={(e) => setIncludeExplanations(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium">Sertakan Landasan Syar'i & Log Penghalangan</span>
                      </label>
                    </div>

                    {/* Big Print Trigger Button */}
                    <button 
                      onClick={handleExportPDF}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Printer className="w-5 h-5" /> Cetak Laporan Faraidh Resmi
                    </button>
                  </div>
                </div>
              </div>

              {/* Mathematical Step-by-Step logs and Diagnostic log traces */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-800">Langkah Matematika Perhitungan Rule Engine</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Penelusuran urutan kualifikasi silsilah perolehan berdasarkan hukum ashabul furudh Kitab Ar-Rahbiyyah.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Steps list */}
                  <div className="flex flex-col gap-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                      <Cpu className="w-4 h-4" /> Alur Langkah Perhitungan
                    </h4>
                    
                    {outputResult.calculationSteps.map((step, idx) => (
                      <div key={idx} className="relative pl-6 pb-2 border-l-2 border-emerald-100 last:border-l-0">
                        <span className="absolute left-[-6px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <h5 className="font-bold text-xs text-slate-700">{step.title}</h5>
                        <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed mt-1">{step.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Scholarly Explanatory notes */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest flex items-center gap-1">
                      <Info className="w-4 h-4" /> Catatan Teoretis & Log Penghalangan
                    </h4>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2 max-h-96 overflow-y-auto">
                      {outputResult.explanationLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Tidak ada catatan penghalangan khusus.</p>
                      ) : (
                        outputResult.explanationLogs.map((log, index) => (
                          <div key={index} className="text-xs text-slate-700 leading-relaxed py-1 borders-b border-white last:border-b-0 whitespace-pre-wrap">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Interactive Consult Chatbot */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-emerald-700 w-6 h-6" />
                  <div>
                    <h3 className="font-display font-semibold text-lg text-slate-800">Konsultan Faraidh Syar'i (AI Sheikh)</h3>
                    <p className="text-xs text-slate-500">Ajukan pertanyaan terkait kasus pewarisan, perbedaan madzhab, atau pemaknaan bait Kitab Ar-Rahbiyyah.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Contoh: Mengapa bagian kakek dan saudara didahulukan lewat jalur muqasamah?"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white transition"
                    onKeyDown={(e) => e.key === 'Enter' && askAiScholar()}
                  />
                  <button 
                    onClick={askAiScholar}
                    disabled={aiLoading}
                    className="px-6 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition disabled:bg-slate-300"
                  >
                    {aiLoading ? "Memikirkan..." : "Tanyakan"}
                  </button>
                </div>

                {aiAnswer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
                  >
                    {aiAnswer}
                  </motion.div>
                )}

              </div>

            </motion.div>
          )}

          {/* TAB 3: KITAB AL-RAHBIYYAH */}
          {activeTab === 'lessons' && (
            <motion.div 
              key="lessons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Sidebar chapters list */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={lessonSearchText}
                    onChange={(e) => setLessonSearchText(e.target.value)}
                    placeholder="Cari bab atau bait syair..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto max-h-[500px]">
                  {filteredLessons.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 italic">Tidak ada bab yang cocok.</p>
                  ) : (
                    filteredLessons.map((lesson) => {
                      const isSelected = selectedLesson.id === lesson.id;
                      const isBookmarked = bookmarkedLessons.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setQuizScoreCard({});
                          }}
                          className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center ${isSelected ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold mr-1.5">{lesson.chapter}</span>
                            <span className="text-xs block mt-1">{lesson.title}</span>
                          </div>
                          <div className="flex gap-1.5">
                            {isBookmarked && <Bookmark className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />}
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Lesson Viewer & Quiz section */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Verse study viewer */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                  <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">{selectedLesson.chapter}</span>
                      <h2 className="font-display font-semibold text-lg text-slate-800 mt-2">{selectedLesson.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleBookmark(selectedLesson.id)}
                        className={`p-2 rounded-xl transition ${bookmarkedLessons.includes(selectedLesson.id) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                        title="Tandai Bab ini"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                    {selectedLesson.summary}
                  </p>

                  <div className="flex flex-col gap-4 mt-2">
                    <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Bait Matan Ar-Rahbiyyah</h4>
                    
                    {selectedLesson.verses.map((verse) => (
                      <div key={verse.number} className="p-4 bg-emerald-50/20 border border-emerald-50 rounded-2xl flex items-start gap-4 transition hover:bg-emerald-50/30">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-1">{verse.number}</span>
                        <div className="flex-1">
                          {/* Arabic text with beautiful font styling */}
                          <p className="arabic-text text-right text-[#064e3b] font-medium leading-loose mb-2 select-text" dir="rtl">
                            {verse.arabic}
                          </p>
                          <p className="text-xs text-slate-500 italic leading-relaxed">
                            "{verse.indonesian}"
                          </p>
                        </div>
                        <button 
                          onClick={() => playVerseAudioChime(verse.number, verse.arabic)}
                          className={`p-2 rounded-xl transition shrink-0 ${isPlayingAudio === verse.number ? 'bg-emerald-700 text-white animate-pulse' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          title="Simulasi Lantunan Poetik"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quizzes card */}
                {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-1.5">
                        <Award className="text-emerald-700" /> Kuis Interaktif Pemahaman
                      </h3>
                      <p className="text-xs text-slate-500">Uji langsung ilmu faraidh Anda berdasarkan bait-bait pelajaran di atas.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                      {selectedLesson.quizzes.map((quiz) => {
                        const scoreState = quizScoreCard[quiz.id];
                        return (
                          <div key={quiz.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h5 className="font-bold text-slate-700 text-sm leading-relaxed mb-3">{quiz.question}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {quiz.options.map((opt, oIdx) => {
                                const isUserChoice = scoreState?.answered && scoreState.userIndex === oIdx;
                                const isCorrectOpt = oIdx === quiz.correctIndex;
                                
                                let optClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                                if (scoreState?.answered) {
                                  if (isCorrectOpt) {
                                    optClass = "bg-emerald-100 border-emerald-300 text-emerald-900";
                                  } else if (isUserChoice) {
                                    optClass = "bg-red-100 border-red-350 text-red-900";
                                  } else {
                                    optClass = "bg-white border-slate-100 text-slate-400";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    disabled={scoreState?.answered}
                                    onClick={() => {
                                      const isCorrect = oIdx === quiz.correctIndex;
                                      setQuizScoreCard(prev => ({
                                        ...prev,
                                        [quiz.id]: { answered: true, userIndex: oIdx, isCorrect }
                                      }));
                                      
                                      // Score logging persistence
                                      const currentScores = { ...quizScores };
                                      currentScores[quiz.id] = isCorrect ? 100 : 0;
                                      setQuizScores(currentScores);
                                      localStorage.setItem('waris_scores', JSON.stringify(currentScores));
                                    }}
                                    className={`p-3 text-left border rounded-xl text-xs font-semibold transition ${optClass}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {scoreState?.answered && (
                              <div className="mt-3 text-xs bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                                <span className="font-bold block mb-1">
                                  {scoreState.isCorrect ? "✅ Tepat Sekali!" : "❌ Koreksi Jawaban"}
                                </span>
                                {quiz.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 4: TEST SUITE */}
          {activeTab === 'tests' && (
            <motion.div 
              key="tests"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6"
            >
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="font-display font-semibold text-xl text-slate-800">Faraidh Rule-Engine Diagnostics Suite</h2>
                  <p className="text-xs text-slate-500 mt-1">Uji integritas engine waris menggunakan 100 kasus faraidh klasik untuk memastikan kesetimbangan total mencapai 100%.</p>
                </div>
                <button 
                  onClick={runAllTests}
                  disabled={testSuiteRunning}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 self-start"
                >
                  <RefreshCw className={`w-4 h-4 ${testSuiteRunning ? 'animate-spin' : ''}`} /> Jalankan 100 Test Cases
                </button>
              </div>

              {/* Stats overview */}
              {testStats.totalRun > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total Kasus Diuji</span>
                    <span className="text-2xl font-mono font-bold text-slate-700">{testStats.totalRun}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Kasus Lulus</span>
                    <span className="text-2xl font-mono font-bold text-emerald-600">✓ {testStats.passed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-red-600 font-bold uppercase">Kegagalan</span>
                    <span className="text-2xl font-mono font-bold text-red-600">✗ {testStats.failed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Waktu Eksekusi</span>
                    <span className="text-2xl font-mono font-bold text-slate-700">{testStats.runTime} ms</span>
                  </div>
                </div>
              )}

              {/* Tests runner scroll container */}
              <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-2">
                {testResults.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 italic text-sm">Klik tombol diatas untuk memulai pengujian engine faraidh otomatis.</p>
                ) : (
                  testResults.map((result) => (
                    <div 
                      key={result.id} 
                      className={`p-3 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-2 text-xs transition ${result.success ? 'bg-emerald-50/30 border-emerald-100 text-slate-700' : 'bg-red-50 border-red-100 text-slate-900'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full font-mono font-bold flex items-center justify-center shrink-0 ${result.success ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}`}>
                          {result.id}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800">{result.name}</span>
                          {!result.success && <p className="text-red-600 italic font-medium mt-1">Error: {result.error}</p>}
                        </div>
                      </div>
                      <span className="font-mono text-slate-400 text-[10px] uppercase shrink-0">
                        {result.success ? `Lulus (${result.timeMs}ms)` : 'Gagal'}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 5: ARCHITECTURE & PLAY STORE ROADMAP */}
          {activeTab === 'store' && (
            <motion.div 
              key="store"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              
              {/* Architecture clean layout card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-display font-semibold text-lg text-slate-800">Flutter Clean Architecture Blueprint</h3>
                  <p className="text-xs text-slate-500">Strukturisasi modul WARIS RAHBIYYAH agar kokoh, adaptif, dan siap dipublikasikan ke Play Store.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-xs text-[#047857] uppercase tracking-wider mb-2">1. Domain Layer</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Merupakan core murni bebas dependensi luar. Berisi Entities (Heir), Value Objects, Abstraksi Repositori, dan Use-Cases pembagian waris syar'i.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-xs text-[#047857] uppercase tracking-wider mb-2">2. Application Layer</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Mengatur state management menggunakan **Riverpod/BLoC**. Memproses alur validasi input, trigger penyelesaian kasus khusus, dan auto-calculate hasil akhir.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-xs text-[#047857] uppercase tracking-wider mb-2">3. Faraidh Engine</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Mesin kalkulasi berbasis aturan (Rule Engine) mandiri. Dapat berjalan di server-side JS/TS maupun native Dart sehingga fleksibel untuk integrasi multiplatform.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-xs text-[#047857] uppercase tracking-wider mb-2">4. Infrastructure</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Implementasi persistensi offline-first menggunakan **SQLite (sqflite)** untuk melacak data calculations, bookmarks, quizzes, serta client integrasi API.
                    </p>
                  </div>
                </div>
              </div>

              {/* ERD / Database schema representation */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-1.5">
                    <Database className="text-emerald-700 w-5 h-5" /> SQLite Skema Database Pengiring (Entity Relationship)
                  </h3>
                  <p className="text-xs text-slate-500">Skema tabel SQLite offline yang dioperasikan pada mobile untuk merekam data secara utuh.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px] text-slate-600">
                  
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl">
                    <span className="font-bold text-white block pb-1 border-b border-emerald-800">TABLE: calculations</span>
                    <span className="block mt-2">id (INTEGER PRIMARY KEY)</span>
                    <span className="block">deceased_gender (TEXT CHECK)</span>
                    <span className="block">total_estate (NUMERIC)</span>
                    <span className="block">debts_funeral (NUMERIC)</span>
                    <span className="block">bequest (NUMERIC)</span>
                    <span className="block">created_at (TIMESTAMP)</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl">
                    <span className="font-bold text-white block pb-1 border-b border-emerald-800">TABLE: heirs</span>
                    <span className="block mt-2">id (INTEGER PRIMARY KEY)</span>
                    <span className="block">calc_id (INTEGER FK references calculations)</span>
                    <span className="block">heir_key (TEXT CHECK)</span>
                    <span className="block">quantity (INTEGER)</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl">
                    <span className="font-bold text-white block pb-1 border-b border-emerald-800">TABLE: results</span>
                    <span className="block mt-2">id (INTEGER PRIMARY KEY)</span>
                    <span className="block">calc_id (INTEGER FK)</span>
                    <span className="block">heir_key (TEXT)</span>
                    <span className="block">status (TEXT)</span>
                    <span className="block">percentage (REAL)</span>
                    <span className="block">amount_allocated (NUMERIC)</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl">
                    <span className="font-bold text-white block pb-1 border-b border-emerald-800">TABLE: rahbiyyah_lessons</span>
                    <span className="block mt-2">id (TEXT PRIMARY KEY)</span>
                    <span className="block">title (TEXT)</span>
                    <span className="block">chapter (TEXT)</span>
                    <span className="block">summary_content (TEXT)</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl">
                    <span className="font-bold text-white block pb-1 border-b border-emerald-800">TABLE: bookmarks</span>
                    <span className="block mt-2">id (INTEGER PRIMARY KEY)</span>
                    <span className="block">lesson_id (TEXT FK to lessons)</span>
                    <span className="block">created_at (TIMESTAMP)</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl">
                    <span className="font-bold text-white block pb-1 border-b border-emerald-800">TABLE: quiz_results</span>
                    <span className="block mt-2">id (INTEGER PRIMARY KEY)</span>
                    <span className="block">quiz_id (TEXT)</span>
                    <span className="block">is_correct (INTEGER)</span>
                    <span className="block">score (REAL)</span>
                    <span className="block">completed_at (TIMESTAMP)</span>
                  </div>

                </div>
              </div>

              {/* Play Store launch roadmap */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-display font-semibold text-lg text-slate-800">Roadmap Pengembangan & Strategi Publikasi Google Play Console</h3>
                  <p className="text-xs text-slate-500">Langkah taktis menaikkan Waris Rahbiyyah dari prototipe web menjadi aplikasi mobile siap pakai.</p>
                </div>

                <div className="flex flex-col gap-4 text-xs md:text-sm text-slate-700 leading-relaxed">
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">1</div>
                    <div>
                      <span className="font-bold text-slate-800 block mb-0.5">Tahap 1: Inisiasi Flutter Project & State Binding (Minggu 1)</span>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Inisiasi proyek menggunakan Flutter SDK terbaru terikat struktur Clean Architecture. Buat file implementasi Dart parser untuk rule-engine faraidh_engine yang dikonversikan langsung dari rancangan TS di atas.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">2</div>
                    <div>
                      <span className="font-bold text-slate-800 block mb-0.5">Tahap 2: Integrasi SQLite (sqflite) & Caching (Minggu 2)</span>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Lakukan embedding naskah Kitab Ar-Rahbiyyah dari asetan lokal ke dalam tabel SQLite. Kaitkan fitur bookmark pelajaran, pencatatan skor kuis interaktif, serta penyimpanan riwayat perhitungan waris di database lokal untuk mendukung status Offline First murni.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">3</div>
                    <div>
                      <span className="font-bold text-slate-800 block mb-0.5">Tahap 3: Visual Polish, Desain Material 3 & Chime Audio (Minggu 3)</span>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Terapkan skema warna harmoni forest emerald, tipografi premium inter, serta kustomisasi widget Material 3. Implementasikan audio pemutaran naskah bait puisi menggunakan library `audioplayers` agar user dapat mendengarkan seni lantunan Ar-Rahbiyyah secara jernih.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">4</div>
                    <div>
                      <span className="font-bold text-slate-800 block mb-0.5">Tahap 4: Pengujian Ketat & Integrasi Play Store (Minggu 4)</span>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Jalankan suite diagnostic 100 kasus uji pada perangkat fisik emulator. Daftarkan konsol Google Play Console, sertakan dokumen disclaimer hukum yang diwajibkan untuk kategori aplikasi religius/hukum keuangan, buat aset grafis, dan rilis versi uji internal (Internal Testing) sebelum publikasi publik penuh.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 px-4 md:px-8 mt-12 text-center text-xs">
        <p className="font-display font-medium text-slate-200">WARIS RAHBIYYAH — Aplikasi Faraidh Islam Profesional</p>
        <p className="mt-2 text-slate-500 leading-relaxed max-w-xl mx-auto">
          Dikembangkan dengan kaidah tirkah ushul syariat yang diselaraskan secara matematis melalui Rule-Based System deterministik untuk pembelajaran dan kemaslahatan umat Islam.
        </p>
        <p className="mt-4 text-[10px] text-slate-600">&copy; 2026 Waris Rahbiyyah Web Portal. All Rights Reserved.</p>
      </footer>

    </div>

    {showPrintPreview && (
      <div id="print-preview-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
        <div className="bg-slate-100 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <Printer className="w-6 h-6 text-emerald-100" />
              <div>
                <h3 className="font-display font-semibold text-lg">Pratinjau Cetak Laporan Faraidh</h3>
                <p className="text-[11px] text-emerald-100/80">Periksa format laporan resmi sebelum dicetak atau disimpan ke PDF.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrintInNewTab}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-emerald-800 font-bold text-xs rounded-lg transition shadow flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Buka di Tab Baru & Cetak (Sangat Direkomendasikan)
              </button>
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-100 hover:text-white transition"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick alert bar inside the modal */}
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 text-xs text-amber-800 flex items-start gap-2 shrink-0">
            <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Saran Penggunaan:</span> Karena keterbatasan keamanan browser di arena sandbox iframe, klik tombol <strong>"Buka di Tab Baru & Cetak"</strong> di atas. Ini akan membuka tab bersih yang bebas dari antarmuka luar dan memunculkan pop-up print browser/save-PDF seketika secara jernih dan utuh.
            </div>
          </div>

          {/* Scrollable sheet body mimicking real paper */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center">
            <div className="bg-white max-w-4xl w-full p-8 md:p-12 shadow-md rounded-xl border border-slate-200 text-slate-900 font-sans leading-relaxed text-sm">
              {/* Header Application Name with Official Logo */}
              <div className="text-center pb-4 mb-4 border-b-2 border-slate-950 flex flex-col items-center">
                <WarisLogo variant="vertical" height="75px" className="mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Sistem Faraidh Syafi'iyyah Klasik & Rule Engine Presisi
                </p>
                <p className="text-xs font-bold text-slate-800 mt-2 uppercase">
                  Laporan Resmi Hasil Perhitungan & Distribusi Faraidh (Waris Islam)
                </p>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 pb-6 border-b border-dashed border-slate-300">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pewaris (Almarhum/Almarhumah)</span>
                  <span className="font-semibold text-slate-805 mt-0.5 block font-serif">
                    {deceasedName ? deceasedName : "Hamba Allah"} ({deceasedGender === 'L' ? 'Laki-Laki' : 'Perempuan'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tanggal Perhitungan</span>
                  <span className="font-semibold text-slate-805 mt-0.5 block">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Harta Kotor Terdaftar (Bruto)</span>
                  <span className="font-mono text-slate-805 mt-0.5 block">Rp {assets.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Kewajiban Pengurang</span>
                  <span className="font-mono text-slate-805 mt-0.5 block">
                    Utang: Rp {debts.toLocaleString('id-ID')} | Jenazah: Rp {funeralCosts.toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Wasiat Syar'i (Maks 1/3)</span>
                  <span className="font-mono text-slate-855 block">Rp {bequest.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">Harta Bersih Terbagi (Netto/Tirkah)</span>
                  <span className="font-mono font-bold text-emerald-800 mt-0.5 block text-base">
                    Rp {outputResult.netEstate.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Engine Diagnostics & Tashih Summary */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-3 gap-4 mb-6">
                <div className="text-center border-r border-slate-200 last:border-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Asal Masalah</span>
                  <span className="font-mono text-sm font-bold text-slate-800 block mt-0.5">{outputResult.ancestralProblem}</span>
                </div>
                <div className="text-center border-r border-slate-200 last:border-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Masalah Akhir (Tashih)</span>
                  <span className="font-mono text-sm font-bold text-emerald-900 block mt-0.5">
                    {outputResult.finalProblem} 
                    {outputResult.isAul && " (Aul)"}
                    {outputResult.isRadd && " (Radd)"}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Status Istimewa</span>
                  <span className="text-xs font-semibold text-slate-750 block mt-1">
                    {outputResult.specialCaseName || "Kasus Normal"}
                  </span>
                </div>
              </div>

              {/* Main Heirs Table */}
              <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-2">Tabel Distribusi Saham Ahli Waris</h3>
              <table className="w-full border-collapse border border-slate-300 text-xs mb-6 text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-300 px-3 py-2">Golongan Ahli Waris</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Status</th>
                    <th className="border border-slate-300 px-2 py-2 text-center">Porsi Awal</th>
                    <th className="border border-slate-300 px-2 py-2 text-center">Nominal Per Ahli Waris</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Nilai Total Kelompok</th>
                    <th className="border border-slate-300 px-2 py-2 text-center w-16">Persen</th>
                  </tr>
                </thead>
                <tbody>
                  {outputResult.heirResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border border-slate-300 px-3 py-4 text-center italic text-slate-400">
                        Tidak ada ahli waris yang ditentukan.
                      </td>
                    </tr>
                  ) : (
                    outputResult.heirResults.map((heir, idx) => (
                      <tr key={heir.key} className={heir.status === 'Gugur' ? 'bg-slate-50 text-slate-400 italic font-normal line-through' : ''}>
                        <td className="border border-slate-300 px-3 py-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 px-3 py-2 font-medium">
                          <div>
                            {heir.name} <span className="text-[10px] text-slate-500 font-normal">({heir.qty}x)</span>
                          </div>
                          <div className="text-[9px] text-slate-505 mt-0.5">{heir.arabicName}</div>
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center font-medium max-w-28 text-[11px]">
                          {heir.status}
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-center font-mono">
                          {heir.status === 'Gugur' ? '0' : heir.originalShare}
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-center font-mono font-semibold">
                          {heir.status === 'Gugur' ? '-' : `Rp ${heir.amountPerIndiv.toLocaleString('id-ID')}`}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold">
                          {heir.status === 'Gugur' ? 'Rp 0' : `Rp ${heir.totalAmount.toLocaleString('id-ID')}`}
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold">
                          {heidPercentFormatted(heir.totalPercentage)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Print Notes */}
              {printNotes && (
                <div className="mb-6 p-4 border border-slate-300 bg-slate-50/50 rounded-xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-1">Catatan Tambahan Keluarga:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{printNotes}"</p>
                </div>
              )}

              {/* Mathematical Steps (conditional) */}
              {includeMathSteps && outputResult.calculationSteps && outputResult.calculationSteps.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-2 border-b border-slate-300 pb-1">
                    Rincian Algoritma & Langkah Perhitungan Matematika
                  </h3>
                  <div className="flex flex-col gap-3 text-xs text-slate-600">
                    {outputResult.calculationSteps.map((step, idx) => (
                      <div key={idx} className="pb-2 border-b border-slate-100 last:border-0">
                        <span className="font-bold text-slate-800">Langkah {idx + 1}: {step.title}</span>
                        <p className="mt-1 leading-relaxed text-[11px] whitespace-pre-wrap">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theoretical Notes / Explanations (conditional) */}
              {includeExplanations && outputResult.explanationLogs && outputResult.explanationLogs.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-2 border-b border-slate-300 pb-1">
                    Landasan Hukum Kitab-Kitab Syafi'iyyah (Matan Rahbiyyah) & Log Hijab
                  </h3>
                  <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-slate-600">
                    {outputResult.explanationLogs.map((log, index) => (
                      <li key={index} className="leading-relaxed text-[11px] whitespace-pre-wrap">{log}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official signature block */}
              <div className="mt-10 pt-8 border-t border-slate-200 text-xs text-center">
                {/* Row 1: Primary Signatures */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-52">
                    <p className="font-semibold text-slate-705">Saksi / Ahli Waris Keluarga</p>
                    <div className="h-14"></div>
                    <p className="border-t border-slate-400 pt-1 font-medium text-slate-500">( ______________________ )</p>
                  </div>
                  
                  <div className="w-48 flex flex-col items-center pt-2">
                    <div className="text-[10px] text-slate-400 italic mb-1 font-mono">Dibuat: {new Date().toLocaleDateString('id-ID')}</div>
                    <p className="font-bold text-emerald-800 tracking-wide font-sans text-xs">WARIS RAHBIYYAH SYSTEM</p>
                    <p className="text-[9px] text-slate-500 mt-1">Kaidah Usul Faraidh Islam</p>
                  </div>
                  
                  <div className="w-52">
                    <p className="font-semibold text-slate-705">Pembimbing / KUA / Saksi Alim</p>
                    <div className="h-14"></div>
                    <p className="border-t border-slate-400 pt-1 font-medium text-slate-500">( ______________________ )</p>
                  </div>
                </div>

                {/* Row 2: 3 Witness Columns (Saksi-Saksi Resmi) */}
                <div className="mt-8 pt-6 border-t border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl text-center">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px] text-left mb-6">Saksi-Saksi Resmi Keluarga & Ahli Waris:</p>
                  
                  {/* Grid for Witnesses */}
                  <div className="grid grid-cols-3 gap-x-6 gap-y-8">
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-slate-600 text-[11px]">Saksi I</p>
                      <div className="h-12"></div>
                      <p className="border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400 w-full max-w-[145px]">( __________________ )</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-slate-600 text-[11px]">Saksi II</p>
                      <div className="h-12"></div>
                      <p className="border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400 w-full max-w-[145px]">( __________________ )</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-slate-600 text-[11px]">Saksi III</p>
                      <div className="h-12"></div>
                      <p className="border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400 w-full max-w-[145px]">( __________________ )</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer with actions */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
            <span className="text-xs text-slate-500 font-mono">Kaidah Hukum Syafi'i & Ar-Rahbiyyah</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup Pratinjau
              </button>
              <button 
                onClick={handlePrintInNewTab}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Buka di Tab Baru & Cetak
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    <div id="print-report-content" className="hidden print:block bg-white text-slate-900 p-8 font-sans max-w-4xl mx-auto text-sm leading-relaxed">
      {/* Header Application Name with Official Logo */}
      <div className="text-center pb-4 mb-4 border-b-2 border-slate-950 flex flex-col items-center">
        <WarisLogo variant="vertical" height="75px" className="mb-2" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
          Sistem Faraidh Syafi'iyyah Klasik & Rule Engine Presisi
        </p>
        <p className="text-xs font-bold text-slate-800 mt-2 uppercase">
          Laporan Resmi Hasil Perhitungan & Distribusi Faraidh (Waris Islam)
        </p>
      </div>

      {/* Metadata Details Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 pb-6 border-b border-dashed border-slate-300">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Pewaris (Almarhum/Almarhumah)</span>
          <span className="font-semibold text-slate-800 mt-0.5 block font-serif">
            {deceasedName ? deceasedName : "Hamba Allah"} ({deceasedGender === 'L' ? 'Laki-Laki' : 'Perempuan'})
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Tanggal Perhitungan</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Harta Kotor Terdaftar (Bruto)</span>
          <span className="font-mono text-slate-800 mt-0.5 block">Rp {assets.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Kewajiban Pengurang</span>
          <span className="font-mono text-slate-800 mt-0.5 block">
            Utang: Rp {debts.toLocaleString('id-ID')} | Jenazah: Rp {funeralCosts.toLocaleString('id-ID')}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Wasiat Syar'i (Maks 1/3)</span>
          <span className="font-mono text-slate-800 mt-0.5 block">Rp {bequest.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">Harta Bersih Terbagi (Netto/Tirkah)</span>
          <span className="font-mono font-bold text-emerald-800 mt-0.5 block text-base">
            Rp {outputResult.netEstate.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Engine Diagnostics & Tashih Summary */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-3 gap-4 mb-6">
        <div className="text-center border-r border-slate-200 last:border-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Asal Masalah</span>
          <span className="font-mono text-lg font-bold text-slate-800 block mt-0.5">{outputResult.ancestralProblem}</span>
        </div>
        <div className="text-center border-r border-slate-200 last:border-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Masalah Akhir (Tashih)</span>
          <span className="font-mono text-lg font-bold text-emerald-955 block mt-0.5">
            {outputResult.finalProblem} 
            {outputResult.isAul && " (Aul)"}
            {outputResult.isRadd && " (Radd)"}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Status Istimewa</span>
          <span className="text-xs font-semibold text-slate-700 block mt-1">
            {outputResult.specialCaseName || "Kasus Normal"}
          </span>
        </div>
      </div>

      {/* Main Heirs Table */}
      <h3 className="font-bold text-sm uppercase text-slate-800 tracking-wider mb-2">Tabel Distribusi Saham Ahli Waris</h3>
      <table className="w-full border-collapse border border-slate-300 text-xs mb-6 text-left">
        <thead>
          <tr className="bg-slate-100 text-slate-800">
            <th className="border border-slate-300 px-3 py-2 text-center w-8">No</th>
            <th className="border border-slate-300 px-3 py-2">Golongan Ahli Waris</th>
            <th className="border border-slate-300 px-3 py-2 text-center">Status</th>
            <th className="border border-slate-300 px-2 py-2 text-center">Porsi Awal</th>
            <th className="border border-slate-300 px-2 py-2 text-center">Nominal Per Ahli Waris</th>
            <th className="border border-slate-300 px-3 py-2 text-right">Nilai Total Kelompok</th>
            <th className="border border-slate-300 px-2 py-2 text-center w-16">Persen</th>
          </tr>
        </thead>
        <tbody>
          {outputResult.heirResults.length === 0 ? (
            <tr>
              <td colSpan={7} className="border border-slate-300 px-3 py-4 text-center italic text-slate-400">
                Tidak ada ahli waris yang ditentukan.
              </td>
            </tr>
          ) : (
            outputResult.heirResults.map((heir, idx) => (
              <tr key={heir.key} className={heir.status === 'Gugur' ? 'bg-slate-50 text-slate-400 italic font-normal line-through' : ''}>
                <td className="border border-slate-300 px-3 py-2 text-center">{idx + 1}</td>
                <td className="border border-slate-300 px-3 py-2 font-medium">
                  <div>
                    {heir.name} <span className="text-[10px] text-slate-500 font-normal">({heir.qty}x)</span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{heir.arabicName}</div>
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center font-medium max-w-28 text-[11px]">
                  {heir.status}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono">
                  {heir.status === 'Gugur' ? '0' : heir.originalShare}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono font-semibold">
                  {heir.status === 'Gugur' ? '-' : `Rp ${heir.amountPerIndiv.toLocaleString('id-ID')}`}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold">
                  {heir.status === 'Gugur' ? 'Rp 0' : `Rp ${heir.totalAmount.toLocaleString('id-ID')}`}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold">
                  {heidPercentFormatted(heir.totalPercentage)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Print Notes */}
      {printNotes && (
        <div className="mb-6 p-4 border border-slate-300 bg-slate-50/50 rounded-xl">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-1">Catatan Tambahan Keluarga:</h4>
          <p className="text-xs text-slate-600 leading-relaxed italic">"{printNotes}"</p>
        </div>
      )}

      {/* Mathematical Steps (conditional) */}
      {includeMathSteps && outputResult.calculationSteps && outputResult.calculationSteps.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-2 border-b border-slate-300 pb-1">
            Rincian Algoritma & Langkah Perhitungan Matematika
          </h3>
          <div className="flex flex-col gap-3 text-xs text-slate-600">
            {outputResult.calculationSteps.map((step, idx) => (
              <div key={idx} className="pb-2 border-b border-slate-100 last:border-0">
                <span className="font-bold text-slate-800">Langkah {idx + 1}: {step.title}</span>
                <p className="mt-1 leading-relaxed text-[11px] whitespace-pre-wrap">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theoretical Notes / Explanations (conditional) */}
      {includeExplanations && outputResult.explanationLogs && outputResult.explanationLogs.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-2 border-b border-slate-300 pb-1">
            Landasan Hukum Kitab-Kitab Syafi'iyyah (Matan Rahbiyyah) & Log Hijab
          </h3>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-slate-600">
            {outputResult.explanationLogs.map((log, index) => (
              <li key={index} className="leading-relaxed text-[11px] whitespace-pre-wrap">{log}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Official signature block */}
      <div className="mt-10 pt-8 border-t border-slate-200 text-xs text-center">
        {/* Row 1: Primary Signatures */}
        <div className="flex justify-between items-start mb-8">
          <div className="w-52">
            <p className="font-semibold text-slate-700">Saksi / Ahli Waris Keluarga</p>
            <div className="h-14"></div>
            <p className="border-t border-slate-400 pt-1 font-medium text-slate-500">( ______________________ )</p>
          </div>
          
          <div className="w-48 flex flex-col items-center pt-2">
            <div className="text-[10px] text-slate-400 italic mb-1 font-mono">Dibuat: {new Date().toLocaleDateString('id-ID')}</div>
            <p className="font-bold text-emerald-800 tracking-wide font-sans text-xs">WARIS RAHBIYYAH SYSTEM</p>
            <p className="text-[9px] text-slate-500 mt-1">Kaidah Usul Faraidh Islam</p>
          </div>
          
          <div className="w-52">
            <p className="font-semibold text-slate-700">Pembimbing / KUA / Saksi Alim</p>
            <div className="h-14"></div>
            <p className="border-t border-slate-400 pt-1 font-medium text-slate-500">( ______________________ )</p>
          </div>
        </div>

        {/* Row 2: 3 Witness Columns (Saksi-Saksi Resmi) */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl text-center">
          <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px] text-left mb-6">Saksi-Saksi Resmi Keluarga & Ahli Waris:</p>
          
          {/* Grid for Witnesses */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-8">
            <div className="flex flex-col items-center">
              <p className="font-semibold text-slate-600 text-[11px]">Saksi I</p>
              <div className="h-12"></div>
              <p className="border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400 w-full max-w-[145px]">( __________________ )</p>
            </div>
            
            <div className="flex flex-col items-center">
              <p className="font-semibold text-slate-600 text-[11px]">Saksi II</p>
              <div className="h-12"></div>
              <p className="border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400 w-full max-w-[145px]">( __________________ )</p>
            </div>
            
            <div className="flex flex-col items-center">
              <p className="font-semibold text-slate-600 text-[11px]">Saksi III</p>
              <div className="h-12"></div>
              <p className="border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400 w-full max-w-[145px]">( __________________ )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

// Utility to nicely print percents
function heidPercentFormatted(pct: number): string {
  if (pct === 0) return '0%';
  if (Number.isInteger(pct)) return `${pct}%`;
  return `${pct.toFixed(2)}%`;
}
