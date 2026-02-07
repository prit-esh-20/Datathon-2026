"use client";

import { useState } from "react";
import { TrendInput } from "@/components/TrendInput";
import { RiskMeter } from "@/components/RiskMeter";
import { TrendChart } from "@/components/TrendChart";
import { InsightPanel } from "@/components/InsightPanel";
import { SignalCard } from "@/components/SignalCard";
import { ActionList } from "@/components/ActionList";
import { analyzeTrend } from "@/lib/featherAI";
import { MOCK_TRENDS } from "@/lib/mockData";
import { FeatherInsight, TrendData, TimeWindow } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingDown, Activity, Zap } from "lucide-react";
import { StarField } from "@/components/StarField";
import { FloatingCrystal } from "@/components/FloatingCrystal";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ trend: TrendData; insight: FeatherInsight } | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (topic: string, timeWindow: TimeWindow) => {
    setLoading(true);
    setError("");
    setData(null);

    // Normalize topic for mock lookup
    const key = topic.toLowerCase().trim().replace(/ /g, "-");
    const mockTrend = MOCK_TRENDS[key];

    // Simulate delay logic
    const processAnalysis = async (trend: TrendData) => {
      try {
        const insight = await analyzeTrend(trend);
        setData({ trend, insight });
      } catch (e) {
        setError("Failed to analyze trend. Please try again.");
      }
    }

    if (!mockTrend) {
      const fallbackTrend: TrendData = {
        id: "generic",
        topic: topic,
        category: "Topic",
        currentVelocity: 500,
        peakVelocity: 1000,
        engagementScore: 50,
        saturationIndex: 60,
        history: Array.from({ length: 24 }).map((_, i) => ({
          timestamp: `${i}h ago`,
          value: 1000 - i * 50 + Math.random() * 200,
        })).reverse(),
      };
      await processAnalysis(fallbackTrend);
    } else {
      await processAnalysis(mockTrend);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white relative overflow-x-hidden selection:bg-neon-purple/30 font-sans">
      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <StarField />
      </div>

      {/* Ambient Gradients for extra depth */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-neon-purple/5 blur-[150px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-neon-blue/5 blur-[150px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center min-h-screen">

        {/* Hero Section */}
        <div className="w-full flex flex-col items-center justify-center pt-20 pb-24 relative">
          {/* 3D Crystal Hero Element */}
          <div className="absolute top-[-150px] w-full h-[800px] pointer-events-none z-[-1] opacity-70 mix-blend-screen">
            <FloatingCrystal />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.15)] flex items-center justify-center">
              <Activity className="w-6 h-6 text-neon-blue" />
            </div>
            <span className="text-sm font-mono tracking-[0.4em] text-neon-blue uppercase drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
              TrendFall AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-8 drop-shadow-2xl z-10"
          >
            PREDICT THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red via-purple-500 to-neon-blue animate-pulse filter drop-shadow-[0_0_20px_rgba(188,19,254,0.5)]">
              COLLAPSE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl text-white/60 max-w-xl text-center font-light leading-relaxed mb-12 z-10"
          >
            Identify when a trend is about to die with detailed explanations. <br />
            Powered by <strong className="text-white font-semibold">Feather.ai</strong> decision intelligence.
          </motion.p>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-2xl z-20"
          >
            <TrendInput onAnalyze={handleAnalyze} isLoading={loading} />
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="w-full flex flex-col items-center justify-center py-24 space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-neon-blue/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-neon-blue animate-spin shadow-[0_0_40px_rgba(0,243,255,0.4)]"></div>
              <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-neon-blue animate-pulse" />
            </div>
            <p className="text-center text-neon-blue font-mono text-sm animate-pulse tracking-[0.2em] font-bold uppercase">
              Analyzing Social Vectors...
            </p>
          </div>
        )}

        {/* Results Dashboard */}
        <AnimatePresence>
          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-8 pb-20"
            >
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"></div>

              {/* Insight Panel (Top Priority) */}
              <InsightPanel insight={data.insight} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visuals */}
                <div className="space-y-8">
                  <RiskMeter score={data.insight.riskScore} level={data.insight.declineRisk} />
                  <ActionList actions={data.insight.actions} />
                </div>

                {/* Middle & Right: Signals & Charts */}
                <div className="lg:col-span-2 space-y-8">
                  <TrendChart data={data.trend.history} color={data.insight.declineRisk === "High" ? "#ff003c" : data.insight.declineRisk === "Medium" ? "#facc15" : "#0aff00"} />

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white/90 flex items-center gap-2 pl-2">
                      <Zap className="w-5 h-5 text-neon-purple fill-neon-purple/20" />
                      Signal Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.insight.signals.map((signal, idx) => (
                        <SignalCard key={idx} signal={signal} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
