import { useState, useCallback, Component, type ErrorInfo, type ReactNode } from "react";
import Hyperspeed from "./components/Hyperspeed";
import { hyperspeedPresets } from "./components/HyperSpeedPresets";
import { TrendChart } from "./components/TrendChart";
import { DeclineRadar } from "./components/DeclineRadar";
import { LifecycleTimeline } from "./components/LifecycleTimeline";
import { AIInsightCard } from "./components/AIInsightCard";
import { Zap, Activity, AlertTriangle, Info, ArrowUpRight, Sparkles, CheckCircle, ShieldCheck, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SimulationControl } from "./components/SimulationControl";
import { WorldMap } from "./components/WorldMap";
import { ComparisonView } from "./components/ComparisonView";
import { ReportButton } from "./components/ReportButton";
import { PredictionCard } from "./components/PredictionCard";
import { LandingPage } from "./components/LandingPage";

// Mock data to prevent crash if backend is offline
const MOCK_RESULT = {
  insight: {
    summary: "Feather.ai detected high volatility in this trend (Offline Mode).",
    riskScore: 85,
    declineRisk: "High",
    actions: ["Pivot immediately", "Reduce ad spend", "Monitor competitors"],
    signals: [
      { metric: "Search Volume", status: "Critical", explanation: "Simulated drop of -45%." },
      { metric: "Sentiment", status: "Warning", explanation: "Negative sentiment detected." }
    ],
    decline_drivers: [
      { label: "Saturation", value: 90, fullMark: 100 },
      { label: "Fatigue", value: 80, fullMark: 100 },
      { label: "Sentiment", value: 70, fullMark: 100 },
      { label: "Algo Shift", value: 50, fullMark: 100 },
      { label: "Disengage", value: 60, fullMark: 100 },
    ]
  },
  trend: {
    history: [
      { timestamp: "Mon", value: 100 },
      { timestamp: "Tue", value: 90 },
      { timestamp: "Wed", value: 40 },
      { timestamp: "Thu", value: 20 },
      { timestamp: "Fri", value: 10 },
    ]
  }
};

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
        <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black flex items-center justify-center">
          <div className="absolute top-5 right-5 text-xs text-white/20 font-mono border border-white/10 px-2 py-1 rounded">
            LITE MODE (WebGL Failed)
          </div>
          <div className="hidden">{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [topic, setTopic] = useState("");
  const [analysisType, setAnalysisType] = useState<"trend" | "campaign">("trend");
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [lastAnalyzedTopic, setLastAnalyzedTopic] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showBattleMode, setShowBattleMode] = useState(false);
  const [showInputError, setShowInputError] = useState(false);

  const detectPlatform = (val: string) => {
    if (val.includes("youtube.com") || val.includes("youtu.be")) return "YouTube";
    if (val.includes("instagram.com")) return "Instagram";
    if (val.includes("tiktok.com")) return "TikTok";
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTopic(val);
    const platform = detectPlatform(val);
    if (platform) {
      setDetectedPlatform(platform);
      setAnalysisType("campaign");
    } else if (!val.startsWith("http")) {
      setDetectedPlatform(null);
    }
  };

  const displayedResult = showSimulator && simulatedResult ? simulatedResult : result;

  const handleUpdateSimulation = useCallback((simData: any) => {
    setSimulatedResult(simData);
  }, []);

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setShowInputError(true);
      setTimeout(() => setShowInputError(false), 3000);
      return;
    }
    setShowInputError(false);
    setAnalyzing(true);
    setShowSimulator(false);
    setSimulatedResult(null);
    setLastAnalyzedTopic(topic);

    let searchTopic = topic.trim();
    if (detectedPlatform) {
      try {
        const url = new URL(searchTopic);
        searchTopic = url.pathname.split("/").pop() || "Campaign Analysis";
      } catch {
        searchTopic = "Campaign Analysis";
      }
    }

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: searchTopic, timeWindow: "48h" })
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
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neon-blue selection:text-black overflow-x-hidden">
      <ErrorBoundary>
        <Hyperspeed effectOptions={hyperspeedPresets.one as any} />
      </ErrorBoundary>

      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onStart={() => setShowDashboard(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center min-h-screen"
          >
            <motion.button
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => setShowDashboard(false)}
              className="fixed top-6 left-6 z-[100] p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 hover:border-neon-blue transition-all group shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <Info className="w-5 h-5 text-neon-blue group-hover:rotate-12 transition-transform" />
              <span className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1 bg-black border border-white/10 rounded text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
                EXIT_CORE
              </span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowDashboard(false)}
              className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.15)] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 hover:border-neon-blue/50 transition-all group/logo outline-none font-inherit"
            >
              <Activity className="w-5 h-5 text-neon-blue group-hover/logo:scale-110 transition-transform" />
              <span className="text-xs font-mono tracking-[0.4em] text-neon-blue uppercase drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]">
                TrendFall AI
              </span>
            </motion.button>

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

            <div className="w-full max-w-2xl relative group z-50 mt-12">
              <div className="flex justify-between items-end mb-2 px-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase"
                >
                  {analysisType === "campaign" ? "Intelligence / Campaign_Forensics" : "Intelligence / Market_Trend"}
                </motion.span>
                {detectedPlatform && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-mono font-bold tracking-widest text-neon-blue uppercase bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20"
                  >
                    {detectedPlatform} SIGNAL DETECTED
                  </motion.span>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500"></div>

              <div className="relative flex flex-col bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex border-b border-white/5 bg-white/5">
                  <button
                    onClick={() => { setAnalysisType("trend"); setDetectedPlatform(null); }}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${analysisType === "trend" ? "text-neon-blue bg-white/5" : "text-white/30 hover:text-white/50"}`}
                  >
                    Trend Analysis
                  </button>
                  <button
                    onClick={() => { setAnalysisType("campaign"); }}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${analysisType === "campaign" ? "text-neon-purple bg-white/5" : "text-white/30 hover:text-white/50"}`}
                  >
                    Campaign Forensics
                  </button>
                </div>

                <div className="flex items-center p-2">
                  <div className="ml-3 p-2 bg-white/5 rounded-lg">
                    {analysisType === "campaign" ? (
                      <Activity className="w-5 h-5 text-neon-purple" />
                    ) : (
                      <Zap className="w-5 h-5 text-neon-blue" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={analysisType === "campaign" ? "Paste YouTube Video URL or Campaign Link..." : "Enter trend keyword (e.g. 'Skibidi Toilet')..."}
                    className="w-full bg-transparent border-none outline-none text-white px-4 py-4 placeholder:text-white/20 text-lg font-light tracking-wide"
                    value={topic}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className={`px-8 py-4 rounded-lg font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all text-black shadow-lg ${analysisType === "campaign"
                        ? "bg-gradient-to-r from-neon-purple to-purple-600 shadow-purple-500/20"
                        : "bg-gradient-to-r from-neon-blue to-blue-600 shadow-neon-blue/20"
                      }`}
                  >
                    {analyzing ? (
                      <span className="flex items-center gap-2">
                        <Activity className="w-3 h-3 animate-spin" />
                        Scanning
                      </span>
                    ) : (
                      "Analyze"
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showInputError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -bottom-10 left-0 flex items-center gap-2 text-neon-red font-mono text-xs tracking-widest pl-2"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    SYSTEM_ERROR: PLEASE_TYPE_A_TREND_NAME
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-20 flex flex-col items-center"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-neon-blue/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-neon-blue border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-neon-blue font-mono tracking-widest text-sm animate-pulse">ANALYZING SIGNAL PATTERNS...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {displayedResult && !analyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full mt-20"
                >
                  <div className="flex justify-end mb-4 gap-4">
                    <button
                      onClick={() => setShowBattleMode(!showBattleMode)}
                      className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${showBattleMode
                        ? "bg-orange-500 text-black border-orange-500"
                        : "bg-transparent text-gray-400 border-white/20 hover:border-white/50"
                        }`}
                    >
                      {showBattleMode ? "Exit Battle" : "⚔️ Battle Mode"}
                    </button>
                    <button
                      onClick={() => setShowSimulator(!showSimulator)}
                      disabled={showBattleMode}
                      className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${showSimulator
                        ? "bg-neon-blue text-black border-neon-blue"
                        : "bg-transparent text-gray-400 border-white/20 hover:border-white/50"
                        } ${showBattleMode ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {showSimulator ? "Exit Simulator" : "Enter God Mode"}
                    </button>
                  </div>

                  {showBattleMode ? (
                    <ComparisonView mainTopic={topic} mainData={displayedResult} />
                  ) : (
                    <>
                      {showSimulator && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mb-8"
                        >
                          <SimulationControl
                            initialData={{ slope: -20, sentiment: -0.5, fatigue: 60 }}
                            onUpdate={handleUpdateSimulation}
                            onReset={() => setShowSimulator(false)}
                          />
                        </motion.div>
                      )}

                      {/* Insight Header - Decision Intelligence Summary */}
                      <div
                        className={`mb-12 border-l-4 pl-6 py-2 transition-all duration-1000 ${displayedResult.insight.riskScore > 75 ? "border-neon-red bg-neon-red/5" :
                          displayedResult.insight.riskScore > 40 ? "border-amber-500 bg-amber-500/5" :
                            "border-neon-blue bg-neon-blue/5"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldCheck className={`w-4 h-4 ${displayedResult.insight.riskScore > 75 ? "text-neon-red" : "text-neon-blue"}`} />
                          <h3 className="text-white/40 font-mono text-[10px] tracking-[0.4em] uppercase">
                            Executive Summary / {showSimulator ? "Simulated Outlook" : "Market Intelligence"}
                          </h3>
                        </div>
                        <p className="text-2xl md:text-4xl font-light text-white leading-tight max-w-4xl">
                          {displayedResult.insight.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-8">
                          <AIInsightCard
                            riskScore={displayedResult.insight.riskScore}
                            signals={displayedResult.insight.signals || []}
                            drivers={displayedResult.insight.decline_drivers || []}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-cyan-400" />
                                Trend Velocity {showSimulator && "(Simulated)"}
                              </h3>
                              <div className="h-[200px]">
                                <TrendChart data={displayedResult.trend.history || displayedResult.trend} color={displayedResult.insight.riskScore > 75 ? "#ff003c" : "#00f3ff"} />
                              </div>
                            </div>

                            <div className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                              <div>
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                  <PieChart className="w-3 h-3 text-purple-400" />
                                  Fatigue Radar
                                </h3>
                                <div className="h-[200px] flex items-center justify-center">
                                  <DeclineRadar data={displayedResult.insight.decline_drivers || []} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-black/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6">Global Resilience Mapping</h3>
                            <WorldMap riskScore={displayedResult.insight.riskScore} />
                          </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                          <PredictionCard
                            probability={displayedResult.insight.decline_probability || (displayedResult.insight.riskScore / 100)}
                            timeToDecline={displayedResult.insight.predicted_time_to_decline || "Calculating..."}
                          />

                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Phase Detection</h3>
                            <LifecycleTimeline stage={
                              displayedResult.insight.riskScore > 80 ? "Collapse" :
                                displayedResult.insight.riskScore > 60 ? "Decline" :
                                  displayedResult.insight.riskScore > 40 ? "Saturation" :
                                    "Growth"
                            } />
                          </div>

                          <div className="bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/20 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.05)]">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue mb-4">Strategic Protocol</h4>
                            <div className="space-y-3">
                              {(displayedResult.insight.actions || ["Assess Impact"]).map((action: string, i: number) => (
                                <button key={i} className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-neon-blue hover:text-black hover:border-neon-blue transition-all group flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider">{action}</span>
                                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="text-[9px] font-mono text-white/40 leading-tight">
                              DATA VALIDATED BY FEATHER CORE.<br />
                              <span className="text-white/60">READY FOR EXECUTIVE DEFENSE.</span>
                            </div>
                          </div>

                          <div className="flex justify-center pt-8">
                            <ReportButton topic={topic} riskScore={displayedResult.insight.riskScore} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
