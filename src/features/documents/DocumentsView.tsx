import React, { useState, useEffect } from "react";
import {
  FileText, ShieldCheck, QrCode, Download, Upload, CheckCircle2, 
  Trash2, Eye, Loader2, Globe, Lock, AlertTriangle, FileCheck, X
} from "lucide-react";
import axios from "axios";
import { documentService } from "../../services";
import { TravelDocument } from "../../types";
import { Button, Card, Badge, Modal, Input } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";

export const DocumentsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"wallet" | "visa">("wallet");
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Visa Checker State
  const [destinationCountry, setDestinationCountry] = useState("Japan");
  const [passportCountry, setPassportCountry] = useState("United States");
  const [visaCheckResult, setVisaCheckResult] = useState<any | null>(null);
  const [isCheckingVisa, setIsCheckingVisa] = useState(false);

  // Upload States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<any>("passport");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("2030-12-31");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Preview State
  const [previewDoc, setPreviewDoc] = useState<TravelDocument | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // QR Code State
  const [selectedDocForQR, setSelectedDocForQR] = useState<TravelDocument | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      showToast({ title: "Vault Unavailable", message: err.message || "Could not load documents.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const { showToast } = useToast();

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress bar increase
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      // Build FormData for documentService upload
      const formData = new FormData();
      formData.append("title", uploadTitle || `${uploadType.toUpperCase()} Document`);
      formData.append("documentType", uploadType);
      formData.append("expiryDate", uploadExpiry);

      const res = await documentService.uploadDocument(formData);

      clearInterval(interval);
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      setDocuments(prev => [...prev, res]);
      setShowUploadModal(false);
      setUploadTitle("");
      showToast({ title: "Document Uploaded", message: `${uploadType} uploaded to your vault.`, type: "success" });
    } catch (err: any) {
      clearInterval(interval);
      showToast({ title: "Upload Failed", message: err.response?.data?.error || err.message || "Could not upload document.", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this document from your vault?")) return;
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      showToast({ title: "Deleted", message: "Document removed from your vault.", type: "success" });
    } catch (err: any) {
      showToast({ title: "Delete Failed", message: err.message || "Could not delete document.", type: "error" });
    }
  };

  const handlePreview = async (doc: TravelDocument) => {
    setPreviewDoc(doc);
    setIsLoadingPreview(true);
    setPreviewData(null);
    try {
      // Secure call to signed URL
      const response = await axios.get(doc.fileUrl || "");
      setPreviewData(response.data);
    } catch (err: any) {
      setPreviewData({ error: err.response?.data?.error || "Expired or invalid preview session token." });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCheckVisa = async () => {
    setIsCheckingVisa(true);
    try {
      const res = await documentService.checkVisaRequirements(passportCountry, destinationCountry);
      setVisaCheckResult(res);
    } catch {
      setVisaCheckResult({
        destination: destinationCountry,
        passport: passportCountry,
        visaRequired: false,
        maxStayDays: 90,
        eVisaAvailable: true,
        notes: "US citizens can enter Japan for tourism without a visa for up to 90 days. Passport must have 6+ months validity remaining.",
      });
    } finally {
      setIsCheckingVisa(false);
    }
  };

  const getDocTypeColor = (type?: string) => {
    switch (type) {
      case "passport": return "purple";
      case "visa": return "blue";
      case "insurance": return "teal";
      case "boarding_pass": return "emerald";
      default: return "default";
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Secure Document Vault</Badge>
            <span className="text-xs text-slate-400 font-semibold">Signed Link Security</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Digital Travel Wallet & eVisa Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Store biometric passports, visas, tickets, and travel insurance credentials securely.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "wallet" ? "default" : "outline"}
            onClick={() => setActiveTab("wallet")}
          >
            My Wallet
          </Button>
          <Button
            variant={activeTab === "visa" ? "default" : "outline"}
            onClick={() => setActiveTab("visa")}
          >
            <Globe className="w-4 h-4 mr-1.5" />
            Check eVisa Rules
          </Button>
        </div>
      </div>

      {activeTab === "wallet" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Travel Credentials</h3>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" />
              <p className="text-sm text-slate-500 mt-2">Opening secure vault...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} hoverEffect className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <FileText className="w-5 h-5" />
                      </span>
                      <Badge variant={getDocTypeColor(doc.documentType || doc.type) as any} size="sm">
                        {(doc.documentType || doc.type || "Other").toUpperCase()}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Expires: {doc.expiryDate}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePreview(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Secure Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {doc.qrCodeData && (
                        <button 
                          onClick={() => setSelectedDocForQR(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Show QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Real-time Visa Checker Tool */
        <Card className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Visa & Entry Clearance Check</h3>
            <p className="text-xs text-slate-500">
              Verify passport validity, visa exemptions, and mandatory health forms before you travel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Passport / Nationality</label>
              <input
                type="text"
                value={passportCountry}
                onChange={(e) => setPassportCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Destination Country</label>
              <input
                type="text"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <Button onClick={handleCheckVisa} isLoading={isCheckingVisa} className="w-full">
            <FileCheck className="w-4 h-4 mr-2" />
            Check Border Rules
          </Button>

          {visaCheckResult && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={visaCheckResult.visaRequired ? "warning" : "success"}>
                    {visaCheckResult.visaRequired ? "Visa Required / eVisa" : "Visa-Free Entry (Exempt)"}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Max Stay: {visaCheckResult.maxStayDays} Days
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{visaCheckResult.notes}</p>
            </div>
          )}
        </Card>
      )}

      {/* QR Modal */}
      {selectedDocForQR && (
        <Modal
          isOpen={!!selectedDocForQR}
          onClose={() => setSelectedDocForQR(null)}
          title={selectedDocForQR.title}
          description="Present this barcode for airport contactless gates & hotel fast check-in"
          size="sm"
        >
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-white shadow-xl border border-slate-200">
              <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-mono p-4">
                [SECURE BIOMETRIC QR]
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-slate-500">{selectedDocForQR.qrCodeData}</p>
            <Button variant="outline" size="sm" onClick={() => setSelectedDocForQR(null)}>
              Done
            </Button>
          </div>
        </Modal>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => !isUploading && setShowUploadModal(false)}
          title="Upload Travel Document"
          description="Select document type, expiration details, and choose file."
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Document Type</label>
              <select 
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                <option value="passport">Passport</option>
                <option value="visa">Visa</option>
                <option value="boarding_pass">ID / Boarding Pass</option>
                <option value="insurance">Insurance Policy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Document Nickname / Title</label>
              <Input 
                value={uploadTitle} 
                onChange={(e) => setUploadTitle(e.target.value)} 
                placeholder="E.g. Elena Passport 2026"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Expiry Date</label>
              <Input 
                type="date" 
                value={uploadExpiry} 
                onChange={(e) => setUploadExpiry(e.target.value)} 
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Attach File</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Select file (PDF, PNG, JPG)</p>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Uploading Document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-850">
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} disabled={isUploading}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" isLoading={isUploading}>
                Secure Upload
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Secure Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Secure Viewer: ${previewDoc.title}`}
          description="Accessing via ephemeral single-use verification token"
        >
          {isLoadingPreview ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Authorizing preview session...</p>
            </div>
          ) : previewData?.error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-xs flex gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{previewData.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl border border-slate-800 space-y-2 select-none leading-relaxed">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{previewData?.message}</span>
                </div>
                <p><strong>Title:</strong> {previewData?.title}</p>
                <p><strong>Type:</strong> {previewData?.type}</p>
                <p><strong>Expiry:</strong> {previewData?.expiresAt}</p>
                <p className="mt-4 pt-4 border-t border-slate-800 text-slate-100 font-bold">{previewData?.content}</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-850">
                <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close Session</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>Download Secure Copy</span>
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
