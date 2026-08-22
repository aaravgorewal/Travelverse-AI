import React, { useState } from "react";
import {
  ShieldAlert,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  Building2,
  Stethoscope,
  HeartPulse,
  BadgeAlert,
  Send,
  X,
  FileCheck
} from "lucide-react";
import { aiAPI } from "../../lib/api/ai";
import { useTripStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Badge, Input } from "../../components/ui";

export const SupportView: React.FC = () => {
  const { activeTrip } = useTripStore();
  
  // AI Support State
  const [issueTopic, setIssueTopic] = useState("emergency");
  const [issueDesc, setIssueDesc] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Helper to map role to icon and color
  const getContactMeta = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("sos") || r.includes("emergency")) return { icon: <ShieldAlert className="w-5 h-5" />, color: "bg-rose-500" };
    if (r.includes("police") || r.includes("security")) return { icon: <BadgeAlert className="w-5 h-5" />, color: "bg-blue-600" };
    if (r.includes("hospital") || r.includes("medical")) return { icon: <Stethoscope className="w-5 h-5" />, color: "bg-red-500" };
    if (r.includes("embassy") || r.includes("consulate")) return { icon: <Building2 className="w-5 h-5" />, color: "bg-indigo-600" };
    if (r.includes("insurance")) return { icon: <HeartPulse className="w-5 h-5" />, color: "bg-emerald-500" };
    if (r.includes("hotel") || r.includes("concierge")) return { icon: <Building2 className="w-5 h-5" />, color: "bg-amber-500" };
    return { icon: <PhoneCall className="w-5 h-5" />, color: "bg-slate-600" };
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDesc.trim()) return;

    setIsAskingAI(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const res = await aiAPI.support({
        query: issueDesc,
        booking_id: issueTopic,
      });
      setAiResponse(res);
    } catch (err: any) {
      setAiError(err.message || "Failed to contact AI Support.");
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* SafeNest Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <Badge variant="danger" className="bg-rose-500/20 text-rose-200 border-rose-400/30">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> SafeNest
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Travel Support & Emergency
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            Official emergency contacts and real-time AI assistance tailored to your current location and itinerary.
          </p>
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <PhoneCall className="w-6 h-6 text-rose-500" />
          Official Emergency Contacts
        </h2>
        <p className="text-xs text-slate-500">Provided securely by your backend itinerary data.</p>
        
        {(!activeTrip || !activeTrip.emergencyContacts || activeTrip.emergencyContacts.length === 0) ? (
          <Card className="p-8 text-center text-slate-500 border-dashed">
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
            <p className="text-sm font-bold">No Contacts Available</p>
            <p className="text-xs">Your current trip does not have official emergency contacts provisioned.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTrip.emergencyContacts.map((contact, i) => {
              const meta = getContactMeta(contact.role);
              return (
                <a 
                  key={i}
                  href={`tel:${contact.phone}`} 
                  className="block group"
                >
                  <Card className="p-5 h-full flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-colors bg-white dark:bg-slate-950 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 text-white rounded-xl shadow-inner ${meta.color}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{contact.name}</h4>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{contact.role}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="text-lg font-black">{contact.phone}</span>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg pointer-events-none group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-200 dark:group-hover:bg-rose-950/30">Call</Button>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Issue Resolution */}
      <Card className="p-6 sm:p-8 space-y-6 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" /> AI Problem Resolution
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Describe your problem and our AI will provide immediate, contextual advice based on {activeTrip?.destination || "your location"}.
          </p>
        </div>

        {!aiResponse ? (
          <form onSubmit={handleAskAI} className="space-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Issue Category</label>
              <select
                value={issueTopic}
                onChange={(e) => setIssueTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="emergency">Emergency / SOS</option>
                <option value="flight_delay">Flight Delay / Cancellation</option>
                <option value="lost_baggage">Lost Baggage</option>
                <option value="hotel_issue">Hotel / Accommodation Issue</option>
                <option value="general">General Support</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Describe Your Problem</label>
              <textarea
                rows={4}
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder="E.g., I lost my passport in Paris, what are my immediate steps?"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {aiError && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" /> {aiError}
              </div>
            )}

            <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto" isLoading={isAskingAI}>
              <Send className="w-4 h-4 mr-2" /> Ask SafeNest AI
            </Button>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="md">AI Resolution Active</Badge>
              <Button variant="ghost" size="sm" onClick={() => setAiResponse(null)} className="text-slate-500">
                <X className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" /> Immediate Action Steps
                </h4>
                <ul className="space-y-2">
                  {aiResponse.immediateActionSteps?.map((step: string, i: number) => (
                    <li key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-500" /> Passenger Rights & Info
                </h4>
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {aiResponse.passengerRightsGuide}
                </div>
              </div>
            </div>

            <div className="p-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Detailed Resolution Script</h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap">
                {aiResponse.resolutionScript}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
