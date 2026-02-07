import { motion } from "framer-motion";
import { Zap, TrendingDown, Shield, BarChart3, ArrowRight } from "lucide-react";
import StarBorder from "./StarBorder";

interface LandingPageProps {
    onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
    return (
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            {/* Hero Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.15)] flex items-center justify-center gap-2"
            >
                <Zap className="w-5 h-5 text-neon-blue" />
                <span className="text-xs font-mono tracking-[0.4em] text-neon-blue uppercase drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]">
                    The Future of Trend Analysis
                </span>
            </motion.div>

            {/* Hero Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-4xl"
            >
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                        KNOW WHEN <br />
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red animate-pulse-slow filter drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                        IT ENDS.
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 max-w-2xl mx-auto backdrop-blur-sm px-4">
                    Feather.ai is the world's most advanced decision intelligence dashboard
                    built to predict the <span className="text-neon-red font-semibold">collapse</span> of
                    hyper-velocity social trends.
                </p>
            </motion.div>

            {/* Main Action */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="group z-50 mt-12"
            >
                <StarBorder
                    as="button"
                    onClick={onStart}
                    color="#00f3ff"
                    speed="4s"
                    className="hover:scale-105 transition-transform active:scale-95"
                >
                    <span className="flex items-center gap-3 font-black text-xl uppercase tracking-widest">
                        Let's Get Started
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                </StarBorder>
            </motion.div>

            {/* Feature Grids */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
            >
                <div className="glass-panel p-8 rounded-3xl text-left hover:border-neon-blue/40 transition-colors">
                    <Shield className="w-10 h-10 text-neon-blue mb-4" />
                    <h3 className="text-lg font-bold mb-2">Decision Guard</h3>
                    <p className="text-white/40 text-sm leading-relaxed">Protect your capital by identifying "dead trends" before they drain your marketing budget.</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl text-left hover:border-neon-purple/40 transition-colors">
                    <TrendingDown className="w-10 h-10 text-neon-purple mb-4" />
                    <h3 className="text-lg font-bold mb-2">Collapse Scoring</h3>
                    <p className="text-white/40 text-sm leading-relaxed">Proprietary logic detects audience fatigue and content saturation levels in real-time.</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl text-left hover:border-neon-red/40 transition-colors">
                    <BarChart3 className="w-10 h-10 text-neon-red mb-4" />
                    <h3 className="text-lg font-bold mb-2">Simulated Futures</h3>
                    <p className="text-white/40 text-sm leading-relaxed">Enter "God Mode" to simulate market shifts and see how they impact trend lifespan.</p>
                </div>
            </motion.div>

            {/* Trust Line */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="mt-20 text-[10px] uppercase tracking-[0.5em] text-white/50"
            >
                Encryption Protocol Active // Decision Core V2.4 Connected
            </motion.div>
        </div>
    );
};
