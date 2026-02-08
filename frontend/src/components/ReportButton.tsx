import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

interface ReportButtonProps {
    topic: string;
    result: any;
}

export const ReportButton = ({ topic, result }: ReportButtonProps) => {
    const [generating, setGenerating] = useState(false);

    const handleGenerateReport = async () => {
        setGenerating(true);

        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const margin = 25;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);

            // Helpers
            const addPageNumber = (pageNum: number) => {
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: "right" });
            };

            const drawHeader = () => {
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(150, 150, 150);
                pdf.text("TRENDFALL AI • CONFIDENTIAL STRATEGIC INTEL", margin, 15);
                pdf.setDrawColor(240, 240, 240);
                pdf.setLineWidth(0.2);
                pdf.line(margin, 18, pageWidth - margin, 18);
            };

            // Page 1: Executive Summary
            drawHeader();
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.text("Trend Decline Assessment Report", margin, 40);

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(`SUBTITLE: Automated Cultural Lifecycle Forensics`, margin, 48);

            // Metadata Box
            pdf.setFillColor(252, 252, 252);
            pdf.setDrawColor(230, 230, 230);
            pdf.roundedRect(margin, 60, contentWidth, 35, 2, 2, "FD");

            pdf.setFontSize(10);
            pdf.setTextColor(120, 120, 120);
            pdf.text("TREND ASSET NAME", margin + 10, 70);
            pdf.text("SOURCE PLATFORM", margin + contentWidth / 2, 70);
            pdf.text("ANALYSIS TIMESTAMP", margin + 10, 85);

            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 30, 30);
            pdf.text(`${topic.toUpperCase()}`, margin + 10, 75);
            pdf.text(`YOUTUBE FORENSICS`, margin + contentWidth / 2, 75);
            pdf.text(`${new Date().toLocaleString()}`, margin + 10, 90);

            // Risk Score Large Display
            pdf.setFontSize(12);
            pdf.text("DECLINE RISK SCORE", margin, 115);

            pdf.setFontSize(64);
            pdf.setTextColor(riskColor(result.insight.riskScore));
            pdf.text(`${result.insight.riskScore}`, margin, 138);

            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.setFont("helvetica", "normal");
            pdf.text("/ 100 (REDUCED MOMENTUM PROBABILITY)", margin + 35, 138);

            // Lifecycle Stage
            const stage = getLifecycleStage(result.insight.riskScore);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text(`LIFECYCLE STAGE: ${stage}`, margin, 155);

            // Summary Text
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(60, 60, 60);
            const summary = cleanLanguage(result.insight.summary);
            const splitSummary = pdf.splitTextToSize(summary, contentWidth);
            pdf.text(splitSummary, margin, 170);

            addPageNumber(1);

            // Page 2: Key Findings
            pdf.addPage();
            drawHeader();
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("Key Findings", margin, 40);

            pdf.setFontSize(11);
            pdf.text("Primary Decline Driver", margin, 55);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(`${result.primaryDriver || result.insight.primary_driver || "Audience Saturation"}`, margin, 62);

            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("Supporting Forensic Signals", margin, 80);

            let yPos = 90;
            const signals = result.insight.signals || [];
            signals.forEach((sig: any) => {
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(40, 40, 40);
                pdf.text(`• ${sig.metric}`, margin, yPos);

                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(80, 80, 80);
                const expl = pdf.splitTextToSize(sig.explanation, contentWidth - 10);
                pdf.text(expl, margin + 5, yPos + 5);
                yPos += (expl.length * 5) + 12;

                if (yPos > pageHeight - 30) {
                    pdf.addPage();
                    drawHeader();
                    yPos = 40;
                }
            });

            addPageNumber(2);

            // Page 3: Metrics Overview
            pdf.addPage();
            drawHeader();
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("Metrics & Velocity Overview", margin, 40);

            // Chart 1: Line Chart (Engagement Velocity)
            pdf.setFontSize(10);
            pdf.text("Engagement Velocity Trend (72h Velocity)", margin, 55);

            const chartH = 50;
            const chartW = contentWidth;
            pdf.setDrawColor(220, 220, 220);
            pdf.line(margin, 115, margin + chartW, 115); // X
            pdf.line(margin, 115, margin, 115 - chartH); // Y

            const history = Array.isArray(result.trend) ? result.trend : (result.trend?.history || []);
            if (history.length > 1) {
                pdf.setDrawColor(60, 60, 60);
                pdf.setLineWidth(0.5);
                const stepX = chartW / (history.length - 1);
                history.forEach((point: any, i: number) => {
                    const x = margin + (i * stepX);
                    const y = 115 - (point.value / 100 * chartH);
                    if (i > 0) {
                        const prevX = margin + ((i - 1) * stepX);
                        const prevY = 115 - (history[i - 1].value / 100 * chartH);
                        pdf.line(prevX, prevY, x, y);
                    }
                });
            }

            // Chart 2: Flat Bars (Saturation Indicators)
            pdf.setFontSize(10);
            pdf.text("Saturation & Audience Fatigue Matrix", margin, 140);

            const drivers = result.insight.decline_drivers || [];
            let barY = 155;
            drivers.forEach((d: any) => {
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(100, 100, 100);
                pdf.text(d.label, margin, barY + 4);

                // Bar Track
                pdf.setFillColor(245, 245, 245);
                pdf.rect(margin + 35, barY, 100, 6, "F");

                // Bar Value
                pdf.setFillColor(150, 150, 150);
                pdf.rect(margin + 35, barY, (d.value / d.fullMark) * 100, 6, "F");

                pdf.text(`${d.value}%`, margin + 140, barY + 4);
                barY += 12;
            });

            addPageNumber(3);

            // Page 4: Recommendation
            pdf.addPage();
            drawHeader();
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("Strategic Recommendation", margin, 40);

            pdf.setFontSize(11);
            pdf.text("Rationale & Protocol", margin, 55);

            yPos = 65;
            const actions = result.insight.actions || ["No current action suggested based on existing signals."];
            actions.forEach((action: string) => {
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(80, 80, 80);
                pdf.text(`• ${cleanLanguage(action)}`, margin, yPos);
                yPos += 8;
            });

            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("Projected Time Window", margin, yPos + 10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(`${result.insight.predicted_time_to_decline || "Immediate Forecast (0-48h)"}`, margin, yPos + 18);

            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("Statistical Confidence", margin, yPos + 35);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(`${(result.confidence * 100 || 85).toFixed(1)}%`, margin, yPos + 43);

            addPageNumber(4);

            // Page 5: Methodology
            pdf.addPage();
            drawHeader();
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("Methodology & Information", margin, 40);

            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(140, 140, 140);

            const metText = [
                "This document is an automated assessment generated by TrendFall AI. The decline risk score represents the statistical probability of a trend entering a saturation or decay phase within the observed digital environment.",
                "",
                "DATA SOURCES:",
                "Metadata captured includes engagement velocity, comment sentiment drift, interaction quality, and audience retention proxies. All data is processed via zero-shot NLP classification and ensemble risk modeling.",
                "",
                "DISCLAIMER:",
                "THIS REPORT IS FOR INFORMATIONAL PURPOSES ONLY. PREDICTIONS ARE BASED ON METADATA SIGNALS AND DO NOT GUARANTEE MARKET OUTCOMES. TRENDFALL AI DOES NOT PROVIDE FINANCIAL OR INVESTMENT ADVICE. STRATEGIC DECISIONS REMAIN THE SOLE RESPONSIBILITY OF THE USER. SYSTEMATIC RISKS OR PLATFORM ALGORITHM SHIFTS MAY ALTER TREND TRAJECTORIES WITHOUT NOTICE."
            ];

            pdf.text(pdf.splitTextToSize(metText.join("\n"), contentWidth), margin, 55);

            addPageNumber(5);

            // Final PDF download
            pdf.save(`Trend_Report_${topic.replace(/\s+/g, '_')}.pdf`);

        } catch (err) {
            console.error("Critical PDF Error:", err);
            alert("Report generation failed due to a formatting error. Please try again.");
        }

        setGenerating(false);
    };

    // Helper: Muted colors for risk
    const riskColor = (score: number) => {
        if (score > 80) return "#991b1b"; // Dark Red
        if (score > 50) return "#92400e"; // Dark Amber
        return "#065f46"; // Dark Green
    };

    // Helper: Clean language mapping
    const cleanLanguage = (text: string) => {
        return text
            .replace(/critical alert/gi, "Strategic caution advised")
            .replace(/immediate exit/gi, "Reduced scaling recommended")
            .replace(/capital risk/gi, "Investment momentum plateau")
            .replace(/collapse/gi, "Late-stage decline phase")
    };

    const getLifecycleStage = (score: number) => {
        if (score > 80) return "High Decline Risk (Saturated)";
        if (score > 60) return "Late-stage Trend";
        if (score > 40) return "Maturation Phase";
        return "Growth Phase (Emerging)";
    };

    return (
        <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-10 py-5 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neon-blue hover:text-black hover:border-neon-blue hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all duration-300 flex items-center gap-4 group"
        >
            {generating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-neon-blue group-hover:text-black" />
                    <span className="opacity-80">Generating Report...</span>
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4 text-neon-blue group-hover:text-black transition-colors" />
                    <span>Download Strategic Intel</span>
                </>
            )}
        </button>
    );
};
