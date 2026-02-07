import { useState } from "react";
// import { StarField } from "./components/StarField";
import Hyperspeed from "./components/Hyperspeed";
import { hyperspeedPresets } from "./components/HyperSpeedPresets";
import { RiskMeter } from "./components/RiskMeter";
import { TrendChart } from "./components/TrendChart";
import { DeclineRadar } from "./components/DeclineRadar";
import { LifecycleTimeline } from "./components/LifecycleTimeline";
import { Activity, Sparkles, Zap, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data to prevent crash if backend is offline
const MOCK_RESULT = {
  insight: {
    summary: "Feather.ai detected high volatility in this trend.",
    riskScore: 85,
    declineRisk: "High",
    actions: ["Pivot immediately", "Reduce ad spend", "Monitor competitors"]
  },
  trend: {
    history: [
      { date: "Mon", value: 100 },
      { date: "Tue", value: 90 },
      { date: "Wed", value: 40 }, // Crash
      { date: "Thu", value: 20 },
      { date: "Fri", value: 10 },
    ]
  }
};

import { Component, ErrorInfo, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Hyperspeed Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 flex items-center justify-center bg-black/80 text-red-500 p-10 border border-red-500">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold mb-4">3D Component Crashed</h2>
            <pre className="whitespace-pre-wrap bg-gray-900 p-4 rounded text-sm overflow-auto max-h-60">
              {this.state.error?.message}
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [topic, setTopic] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!topic) return;
    setAnalyzing(true);
    setResult(null);

    // Simulate API call for safety
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, timeWindow: "48h" })
        });

        if (!response.ok) throw new Error("Backend failed");
        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.warn("Backend unavailable, using mock data", error);
        setResult(MOCK_RESULT);
      } finally {
        setAnalyzing(false);
      }
    }, 1500);
  };

  return (
    // Added a simple gradient background instead of 3D for now
    <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-neon-purple/30 font-sans bg-black">

      {/* 3D Background - Hyperspeed Restored */}
      <ErrorBoundary>
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
      </ErrorBoundary>


      {/* Hero Crystal - DISABLED */}
      {/* <div className="fixed inset-0 pointer-events-none"> <HeroCrystal /> </div> */}

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center min-h-screen">

        {/* Header Badge */}
        <div className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.15)] flex items-center justify-center gap-2">
          <Activity className="w-5 h-5 text-neon-blue" />
          <span className="text-xs font-mono tracking-[0.4em] text-neon-blue uppercase drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]">
            TrendFall AI
          </span>
        </div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-center mb-6 drop-shadow-2xl"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
            PREDICT THE
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red via-purple-500 to-neon-blue animate-pulse filter drop-shadow-[0_0_20px_rgba(188,19,254,0.5)]">
            COLLAPSE
          </span>
        </motion.h1>

        {/* Search Input */}
        <div className="w-full max-w-2xl relative group z-50 mt-12">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2">
            <Zap className="w-6 h-6 text-neon-blue ml-3 opacity-70" />
            <input
              type="text"
              placeholder="Enter trend (e.g. 'Skibidi Toilet')"
              className="w-full bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-white/30 text-lg font-medium"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue px-8 py-3 rounded-lg font-semibold transition-all border border-neon-blue/30 uppercase tracking-wider text-sm"
            >
              {analyzing ? "Scanning..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {analyzing && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-neon-blue/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-neon-blue animate-spin shadow-[0_0_40px_rgba(0,243,255,0.4)]"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-neon-blue animate-pulse" />
            </div>
            <p className="text-neon-blue font-mono text-sm tracking-widest animate-pulse">ANALYZING SIGNAL PATTERNS...</p>
          </div>
        )}

        {/* Results Dashboard */}
        <AnimatePresence>
          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="w-full mt-16 space-y-8 pb-20"
            >
              <div className="glass-panel p-8 rounded-2xl border-neon-purple/30 bg-white/5 backdrop-blur-xl">
                <h3 className="text-neon-purple font-mono text-sm tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> FEATHER.AI INTELLIGENCE
                </h3>
                <p className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                  {result.insight.summary}
                </p>
              </div>


              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Risk & Radar */}
                <div className="space-y-6">
                  <RiskMeter score={result.insight.riskScore} level={result.insight.declineRisk} />

                  <div className="glass-panel p-6 rounded-2xl bg-white/5 backdrop-blur-xl border-neon-purple/30">
                    <DeclineRadar data={result.insight.decline_drivers || [
                      { label: "Saturation", value: 50, fullMark: 100 },
                      { label: "Fatigue", value: 50, fullMark: 100 },
                      { label: "Sentiment", value: 50, fullMark: 100 },
                      { label: "Algo Shift", value: 50, fullMark: 100 },
                      { label: "Disengage", value: 50, fullMark: 100 },
                    ]} />
                  </div>
                </div>

                {/* Right Column: Chart & Timeline */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-panel p-6 rounded-2xl bg-white/5 backdrop-blur-xl border-white/10">
                    <LifecycleTimeline stage="Saturation" />
                  </div>
                  <div className="glass-panel p-6 rounded-2xl bg-white/5 backdrop-blur-xl">
                    <TrendChart data={result.trend.history} color={result.insight.declineRisk === "High" ? "#ff003c" : "#0aff00"} />
                  </div>

                  {/* Actions Area */}
                  <div className="glass-panel p-6 rounded-2xl">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Strategic Response</h4>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/50 rounded hover:bg-neon-blue/20 text-xs text-neon-blue font-bold uppercase tracking-wider transition-all">
                        Pivot Strategy
                      </button>
                      <button className="px-4 py-2 bg-purple-500/10 border border-purple-500/50 rounded hover:bg-purple-500/20 text-xs text-purple-400 font-bold uppercase tracking-wider transition-all">
                        Partner with Creators
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default App;
