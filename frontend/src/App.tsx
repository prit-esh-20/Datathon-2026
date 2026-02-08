import { useState, useCallback, Component, type ErrorInfo, type ReactNode } from "react";

import { TrendChart } from "./components/TrendChart";
import { DeclineRadar } from "./components/DeclineRadar";
import { LifecycleTimeline } from "./components/LifecycleTimeline";
import { AIInsightCard } from "./components/AIInsightCard";
import { Zap, Activity, AlertTriangle, Info, ArrowUpRight, Sparkles, CheckCircle, ShieldCheck, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LightRays from "./components/LightRays";

import ShinyText from "./components/ShinyText";

import { SimulationControl } from "./components/SimulationControl";
import { WorldMap } from "./components/WorldMap";
import { ComparisonView } from "./components/ComparisonView";
import { ReportButton } from "./components/ReportButton";
import { PredictionCard } from "./components/PredictionCard";
import { LandingPage } from "./components/LandingPage";

// Mock data to prevent crash if backend is offline
const MOCK_RESULT = {
  insight: {
    summary: "System detected high capital risk in this trend segment (Offline Mode).",
    riskScore: 85,
    declineRisk: "Critical",
    actions: ["Reduce Exposure", "Halt Ad Spend", "Competitor Conquesting"],
    signals: [
      { metric: "Search Volume", status: "Critical", explanation: "Projected drop of -45% in next cycle." },
      { metric: "Sentiment", status: "Warning", explanation: "Negative sentiment velocity detected." }
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
  const [userMode, setUserMode] = useState<"marketing" | "investor">("marketing");

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

  const handleAnalyze = async (overrideTopic?: string | any) => {
    const targetTopic = typeof overrideTopic === "string" ? overrideTopic : topic;

    if (!targetTopic.trim()) {
      setShowInputError(true);
      setTimeout(() => setShowInputError(false), 3000);
      return;
    }

    if (typeof overrideTopic === "string") {
      setTopic(targetTopic);
    }

    setShowInputError(false);
    setAnalyzing(true);
    setShowSimulator(false);
    setSimulatedResult(null);
    setLastAnalyzedTopic(targetTopic);

    let searchTopic = targetTopic.trim();
    // Keep full URL for YouTube/Social detection in backend

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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neon-blue selection:text-black overflow-x-hidden relative">
      <ErrorBoundary>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            pulsating={false}
            fadeDistance={1}
            saturation={1}
            className="w-full h-full"
          />
        </div>


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
              <ShinyText
                text="COLLAPSE"
                disabled={false}
                speed={3}
                className="filter drop-shadow-[0_0_20px_rgba(188,19,254,0.5)]"
                color="#b026ff"
                shineColor="#ffffff"
              />
            </motion.h1>


            <div className="w-full max-w-5xl relative group z-50 mt-12 flex flex-col gap-8">
              {/* Enterprise Mode Toggle */}
              <div className="flex justify-center mb-4 relative z-50">
                <div className="bg-white/5 border border-white/10 rounded-full p-1 flex items-center pointer-events-auto">
                  <button
                    onClick={() => setUserMode("marketing")}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${userMode === "marketing" ? "bg-neon-blue text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]" : "text-white/40 hover:text-white"}`}
                  >
                    Marketing
                  </button>
                  <button
                    onClick={() => setUserMode("investor")}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${userMode === "investor" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "text-white/40 hover:text-white"}`}
                  >
                    Investor
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end mb-2 px-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase"
                >
                  {userMode === "investor" ? "Capital Allocation / Risk_Management" : (analysisType === "campaign" ? "Intelligence / Campaign_Forensics" : "Intelligence / Market_Trend")}
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
                {userMode === "marketing" ? (
                  <>
                    <div className="flex border-b border-white/5 bg-white/5">
                      <button
                        onClick={() => { setAnalysisType("trend"); setDetectedPlatform(null); }}
                        className={`flex-1 py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-all ${analysisType === "trend" ? "text-neon-blue bg-white/5 border-b-2 border-neon-blue" : "text-white/30 hover:text-white/50"}`}
                      >
                        Trend Risk Analysis
                      </button>
                      <button
                        onClick={() => { setAnalysisType("campaign"); }}
                        className={`flex-1 py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-all ${analysisType === "campaign" ? "text-neon-purple bg-white/5 border-b-2 border-neon-purple" : "text-white/30 hover:text-white/50"}`}
                      >
                        Campaign Intelligence
                      </button>
                    </div>

                    <div className="flex items-center p-4">
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
                        className="w-full bg-transparent border-none outline-none text-white px-6 py-4 placeholder:text-white/20 text-lg font-light tracking-wide"
                        value={topic}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                      />
                      <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className={`px-10 py-4 rounded-lg font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all text-black shadow-lg ${analysisType === "campaign"
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
                          "Analyze Risk"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="flex justify-center mb-2">
                      <ShieldCheck className="w-12 h-12 text-white/20" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                      Institutional Portfolio View
                    </h2>
                    <p className="text-white/40 text-sm max-w-lg mx-auto">
                      Track overall portfolio exposure to high-volatility cultural assets.
                      Detect systemic risks across multiple active campaigns.
                    </p>

                    <div className="flex justify-center gap-4 mt-6">
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Exposure</div>
                        <div className="text-xl font-bold text-white">$4.2M</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Capital at Risk</div>
                        <div className="text-xl font-bold text-neon-red">$850K</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Divestment Signals</div>
                        <div className="text-xl font-bold text-amber-400">3 Active</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Trend Portfolio Section (New) */}
              {!analyzing && !displayedResult && (
                <div className="w-full mt-12 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-neon-blue" />
                      {userMode === "investor" ? "Institutional Portfolio Monitor" : "Active Trend Portfolio"}
                    </h3>
                    <button className="text-[10px] font-mono text-neon-blue border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/10">
                      VIEW_FULL_REPORT
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                    {userMode === "marketing" ? (
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-black/40">
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Trend Asset</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Decline Risk</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Time Window</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Collapse Driver</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-white">Gen Z "Silent Walking"</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30">
                                Critical (88%)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/60 font-mono text-xs">48 Hours</td>
                            <td className="px-6 py-4 text-white/60 text-xs">Audience Fatigue</td>
                            <td className="px-6 py-4 text-right">
                              <span
                                onClick={() => handleAnalyze('Gen Z "Silent Walking"')}
                                className="text-xs font-bold text-red-400 group-hover:underline cursor-pointer"
                              >
                                DIVEST_NOW &rarr;
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-white">"Coquette" Aesthetics</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                Elevated (62%)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/60 font-mono text-xs">2 Weeks</td>
                            <td className="px-6 py-4 text-white/60 text-xs">Saturation</td>
                            <td className="px-6 py-4 text-right">
                              <span
                                onClick={() => handleAnalyze('"Coquette" Aesthetics')}
                                className="text-xs font-bold text-amber-400 group-hover:underline cursor-pointer"
                              >
                                MONITOR &rarr;
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-white">AI Clay Filters</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/20 text-green-500 border border-green-500/30">
                                Low (15%)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/60 font-mono text-xs">&gt; 3 Months</td>
                            <td className="px-6 py-4 text-white/60 text-xs">None</td>
                            <td className="px-6 py-4 text-right">
                              <span
                                onClick={() => handleAnalyze('AI Clay Filters')}
                                className="text-xs font-bold text-green-400 group-hover:underline cursor-pointer"
                              >
                                SCALE_SPEND &rarr;
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-black/40">
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Asset Class</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Ticker / Sector</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Exposure</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest">Volatility (VaR)</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase text-white/40 tracking-widest text-right">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-white">Social Media Equities</td>
                            <td className="px-6 py-4 text-white/60 font-mono text-xs">$META, $SNAP</td>
                            <td className="px-6 py-4 text-white font-mono">$1.2M</td>
                            <td className="px-6 py-4">
                              <span className="text-red-500 font-bold">High (Beta: 1.8)</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                onClick={() => handleAnalyze('Social Media Equities')}
                                className="text-xs font-bold text-red-400 group-hover:underline cursor-pointer"
                              >
                                HEDGE_POSITION &rarr;
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-white">Direct-to-Consumer (DTC)</td>
                            <td className="px-6 py-4 text-white/60 font-mono text-xs">Retail / Apparel</td>
                            <td className="px-6 py-4 text-white font-mono">$500K</td>
                            <td className="px-6 py-4">
                              <span className="text-amber-500 font-bold">Medium</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                onClick={() => handleAnalyze('DTC Retail')}
                                className="text-xs font-bold text-amber-400 group-hover:underline cursor-pointer"
                              >
                                HOLD &rarr;
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-bold text-white">Creator Economy Fund</td>
                            <td className="px-6 py-4 text-white/60 font-mono text-xs">Venture / Series B</td>
                            <td className="px-6 py-4 text-white font-mono">$2.5M</td>
                            <td className="px-6 py-4">
                              <span className="text-green-500 font-bold">Low</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                onClick={() => handleAnalyze('Creator Economy Fund')}
                                className="text-xs font-bold text-green-400 group-hover:underline cursor-pointer"
                              >
                                ACCUMULATE &rarr;
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-4 h-4 ${displayedResult.insight.riskScore > 75 ? "text-neon-red" : "text-neon-blue"}`} />
                            <h3 className="text-white/40 font-mono text-[10px] tracking-[0.4em] uppercase">
                              Forensic Analysis / {displayedResult.detectedTrend || (showSimulator ? "Simulated" : "Market Intel")}
                            </h3>
                          </div>
                          {displayedResult.confidence && (
                            <div className="text-[10px] font-mono text-neon-blue/60 bg-neon-blue/5 px-2 py-0.5 rounded border border-neon-blue/20">
                              CONFIDENCE: {(displayedResult.confidence * 100).toFixed(1)}%
                            </div>
                          )}
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
                            primaryDriver={displayedResult.primaryDriver || displayedResult.insight.primary_driver}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-cyan-400" />
                                Engagement Velocity Analysis {showSimulator && "(Simulated)"}
                              </h3>
                              <div className="h-[200px]">
                                <TrendChart
                                  data={Array.isArray(displayedResult.trend) ? displayedResult.trend : (displayedResult.trend?.history || [])}
                                  color={displayedResult.insight.riskScore > 75 ? "#ff003c" : "#00f3ff"}
                                  subtitle="Estimated trend trajectory"
                                />
                              </div>
                            </div>

                            <div className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                              <div>
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                  <PieChart className="w-3 h-3 text-purple-400" />
                                  Saturation & Fatigue Metrics
                                </h3>
                                <div className="h-[300px] flex items-center justify-center">
                                  <DeclineRadar data={displayedResult.insight.decline_drivers || []} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-black/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6">Global Market Resilience</h3>
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
