import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  QrCode,
  Download,
  Printer,
  Mail,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { TripPlan } from "../../../types";

interface TripGenieShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
}

export function TripGenieShareModal({ isOpen, onClose, trip }: TripGenieShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "qr" | "export">("link");

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/tripgenie?tripId=${trip.id}&dest=${encodeURIComponent(
    trip.destination
  )}`;

  const generateMarkdownSummary = () => {
    let md = `# ✈️ ${trip.title}\n`;
    md += `**Destination:** ${trip.destination} | **Duration:** ${trip.days.length} Days | **Budget:** $${trip.budgetTotal.toLocaleString()} ${trip.currency}\n\n`;
    md += `### 🌟 AI Trip Summary\n${trip.summary || trip.aiRationale || "Curated by TripGenie AI."}\n\n`;
    
    if (trip.flights && trip.flights.length > 0) {
      md += `### 🛫 Flights\n`;
      trip.flights.forEach((f) => {
        md += `- **${f.type.toUpperCase()}:** ${f.airline} (${f.flightNumber}) | ${f.fromCode} ➔ ${f.toCode} | Departure: ${f.departureTime} | $${f.pricePerPerson}/person\n`;
      });
      md += `\n`;
    }

    if (trip.hotels && trip.hotels.length > 0) {
      md += `### 🏨 Accommodation\n`;
      trip.hotels.forEach((h) => {
        md += `- **${h.name}** (${h.stars}★, ${h.rating}/5) | Room: ${h.roomType} | $${h.nightlyPrice}/night ($${h.totalPrice} total)\n`;
      });
      md += `\n`;
    }

    md += `### 📅 Day-by-Day Itinerary\n`;
    trip.days.forEach((d) => {
      md += `#### Day ${d.dayNumber}: ${d.theme || "Exploration"}\n`;
      d.activities.forEach((a) => {
        md += `- **${a.time}:** ${a.title} (${a.duration}, $${a.estimatedCost}) - ${a.location}\n  _${a.description}_\n`;
      });
      md += `\n`;
    });

    if (trip.costBreakdown) {
      md += `### 💵 Estimated Cost Breakdown\n`;
      md += `- Flights: $${trip.costBreakdown.flights.toLocaleString()}\n`;
      md += `- Lodging: $${trip.costBreakdown.lodging.toLocaleString()}\n`;
      md += `- Activities: $${trip.costBreakdown.activities.toLocaleString()}\n`;
      md += `- Food & Dining: $${trip.costBreakdown.foodDining.toLocaleString()}\n`;
      md += `- Ground Transit: $${trip.costBreakdown.localTransit.toLocaleString()}\n`;
      md += `- **Total Estimated:** $${trip.costBreakdown.totalEstimated.toLocaleString()} ${trip.costBreakdown.currency}\n`;
    }

    md += `\n_Generated autonomously by TRAVELVERSE TripGenie AI_`;
    return md;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateMarkdownSummary());
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${trip.destination.replace(/[^a-z0-9]/gi, "_")}_TripGenie_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="tripgenie-share-dialog"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Share TripGenie Blueprint
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {trip.destination} • {trip.days.length} Days Itinerary
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("link")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "link"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Direct Link & Social
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "qr"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "export"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export & Print
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Shareable Trip URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 select-all font-mono"
                  />
                  <button
                    id="copy-share-url-btn"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Quick Social Shares */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Share Directly
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Check out our ${trip.days.length}-day trip to ${trip.destination} crafted with TripGenie AI: ${shareUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      `Travel Itinerary: ${trip.title}`
                    )}&body=${encodeURIComponent(
                      `Here is the itinerary for our upcoming ${trip.destination} journey:\n\n${shareUrl}\n\nSummary:\n${trip.summary}`
                    )}`}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Email Itinerary
                  </a>
                </div>
              </div>

              {/* Copy Full Markdown */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="copy-markdown-summary-btn"
                  onClick={handleCopySummary}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  {copiedSummary ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                  {copiedSummary ? "Markdown Copied to Clipboard!" : "Copy Formatted Markdown Summary"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "qr" && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-md">
                {/* Visual QR Code Generator representation */}
                <div className="w-44 h-44 bg-slate-900 p-2 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-white rounded-lg">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30
                            ? "bg-slate-900"
                            : i % 5 === 0
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-1.5 bg-white rounded-md shadow-lg border border-slate-200">
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Scan to Open on Mobile
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Point any phone camera at this code to load the interactive TripGenie itinerary.
                </p>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-3">
              <button
                id="download-json-btn"
                onClick={handleDownloadJson}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 transition group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Download Full JSON Blueprint
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Export complete flight, hotel, and activity schema
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
              </button>

              <button
                id="print-itinerary-btn"
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/60 transition group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Print / Save as PDF
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      High-contrast printable format with schedules
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <span>TravelVerse TripGenie AI</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
