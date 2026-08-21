import React, { useState } from "react";
import axios from "axios";
import { 
  FileText, Plus, Edit, Send, Download, Eye, Loader2, Sparkles, CheckCircle2, 
  Trash2, FileCheck, RefreshCw, X, ChevronRight
} from "lucide-react";
import { Button, Card, Badge, Input } from "../../../components/ui";

interface DocuSwiftItem {
  id: string;
  type: "quotation" | "itinerary" | "invoice" | "voucher" | "email";
  clientName: string;
  destination: string;
  title: string;
  sections: { heading: string; body: string }[];
  price?: number;
  currency?: string;
  status: "draft" | "sent";
}

export const DocuSwift: React.FC = () => {
  const [docType, setDocType] = useState<"quotation" | "itinerary" | "invoice" | "voucher" | "email">("quotation");
  const [clientName, setClientName] = useState("Elena Rostova");
  const [destination, setDestination] = useState("Tokyo, Japan");
  const [coreDetails, setCoreDetails] = useState("5-day custom luxury odyssey");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [drafts, setDrafts] = useState<DocuSwiftItem[]>([]);
  const [activeDraft, setActiveDraft] = useState<DocuSwiftItem | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSections, setEditSections] = useState<{ heading: string; body: string }[]>([]);

  // Modal Previews
  const [previewItem, setPreviewItem] = useState<DocuSwiftItem | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await axios.post("/api/v1/agent/docuswift/generate", {
        type: docType,
        clientName,
        destination,
        coreDetails
      });
      setDrafts(prev => [response.data, ...prev]);
      setActiveDraft(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to generate document", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startEdit = (doc: DocuSwiftItem) => {
    setActiveDraft(doc);
    setEditTitle(doc.title);
    setEditSections([...doc.sections]);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeDraft) return;
    try {
      const response = await axios.put(`/api/v1/agent/docuswift/edit/${activeDraft.id}`, {
        title: editTitle,
        sections: editSections
      });
      
      setDrafts(prev => prev.map(d => d.id === activeDraft.id ? response.data : d));
      setActiveDraft(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save document edits", err);
    }
  };

  const handleSend = async (doc: DocuSwiftItem) => {
    try {
      const response = await axios.post(`/api/v1/agent/docuswift/send/${doc.id}`);
      alert(response.data.message);
      setDrafts(prev => prev.map(d => d.id === doc.id ? { ...d, status: "sent" } : d));
      if (activeDraft?.id === doc.id) {
        setActiveDraft(prev => prev ? { ...prev, status: "sent" } : null);
      }
    } catch (err) {
      console.error("Failed to send document", err);
    }
  };

  const handleDownload = (doc: DocuSwiftItem) => {
    const content = `
TITLE: ${doc.title}
TYPE: ${doc.type.toUpperCase()}
CLIENT: ${doc.clientName}
DESTINATION: ${doc.destination}
STATUS: ${doc.status}

------------------------------------------------
${doc.sections.map(s => `[ ${s.heading} ]\n${s.body}\n`).join("\n")}
------------------------------------------------
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.type}-${doc.clientName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSectionBody = (index: number, val: string) => {
    setEditSections(prev => prev.map((s, idx) => idx === index ? { ...s, body: val } : s));
  };

  const updateSectionHeading = (index: number, val: string) => {
    setEditSections(prev => prev.map((s, idx) => idx === index ? { ...s, heading: val } : s));
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in zoom-in-95">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple">B2B DocuSwift</Badge>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">Agent DocuSwift Builder</h2>
          <p className="text-sm text-slate-500">Instantly generate GDS-synchronized client quotes, itineraries, invoices, and vouchers.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Side: Generator Control */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Generate Travel Document</h3>
            
            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Doc Type</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                >
                  <option value="quotation">Quotation / Pricing Option</option>
                  <option value="itinerary">Client Itinerary Summary</option>
                  <option value="invoice">B2B Booking Invoice</option>
                  <option value="voucher">Digital Services Voucher</option>
                  <option value="email">Customer Pitch Email</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Client Name</label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Destination</label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Core Details & Style Preferences</label>
                <textarea 
                  value={coreDetails} 
                  onChange={(e) => setCoreDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none h-20"
                  placeholder="5-day luxury itinerary including private tour guides..."
                />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5" isLoading={isGenerating}>
                <Sparkles className="w-4 h-4" />
                <span>Generate Document</span>
              </Button>
            </form>
          </Card>

          {/* Generated Registry list */}
          <Card className="p-5 border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Session Builder Registry</h3>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {drafts.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => { setActiveDraft(doc); setIsEditing(false); }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    activeDraft?.id === doc.id
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase">{doc.type}</p>
                  </div>
                  <Badge variant={doc.status === "sent" ? "success" : "outline"} className="text-[9px]">
                    {doc.status}
                  </Badge>
                </div>
              ))}
              {drafts.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">No documents generated yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Active Workspace Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeDraft ? (
            <Card className="p-6 border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
              
              {/* Document Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <Badge variant="purple" className="mb-1 uppercase">{activeDraft.type}</Badge>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">{activeDraft.title}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isEditing ? (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => startEdit(activeDraft)}>
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Document</span>
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleSaveEdit}>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </Button>
                  )}

                  <Button size="sm" variant="outline" className="gap-1.5 text-blue-600 hover:bg-blue-50" onClick={() => handleDownload(activeDraft)}>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>

                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5" onClick={() => handleSend(activeDraft)}>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Client</span>
                  </Button>
                </div>
              </div>

              {/* Document Body Editor Canvas */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar pr-2">
                {!isEditing ? (
                  // Read / Preview Mode
                  <div className="space-y-6 max-w-2xl mx-auto p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 shadow-sm leading-relaxed">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">TravelVerse Advisor Network</h4>
                        <p className="text-xs text-slate-400 mt-1">Bespeak Travel Quote & Document Package</p>
                      </div>
                      <Badge variant="outline">Verified GDS</Badge>
                    </div>

                    <div className="space-y-4">
                      {activeDraft.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1">
                          <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{sec.heading}</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{sec.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Interactive Edit Mode
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Document Title</label>
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>

                    {editSections.map((sec, idx) => (
                      <div key={idx} className="space-y-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                        <Input 
                          value={sec.heading} 
                          onChange={(e) => updateSectionHeading(idx, e.target.value)} 
                          className="font-bold text-slate-800" 
                        />
                        <textarea 
                          value={sec.body}
                          onChange={(e) => updateSectionBody(idx, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none h-24"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </Card>
          ) : (
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <FileText className="w-16 h-16 text-slate-350 mb-3 opacity-40" />
              <p className="font-bold text-slate-750 dark:text-slate-300">No Document Selected</p>
              <p className="text-xs text-slate-450 mt-1 max-w-xs">Use the left generation panel to create quotations, invoices, or customer emails instantly.</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};
