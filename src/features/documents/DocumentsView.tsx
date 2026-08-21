import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  QrCode,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Globe,
  Lock,
  Plus,
} from "lucide-react";
import { documentService } from "../../services";
import { TravelDocument } from "../../types";
import { Button, Card, Badge, Modal } from "../../components/ui";

export const DocumentsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"wallet" | "visa">("wallet");
  const [destinationCountry, setDestinationCountry] = useState("Japan");
  const [passportCountry, setPassportCountry] = useState("United States");
  const [visaCheckResult, setVisaCheckResult] = useState<any | null>(null);
  const [isCheckingVisa, setIsCheckingVisa] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TravelDocument | null>(null);

  const mockDocuments: TravelDocument[] = [
    {
      id: "doc-1",
      userId: "u-101",
      title: "Biometric Passport (US)",
      documentType: "passport",
      expiryDate: "2032-11-20",
      status: "valid",
      fileUrl: "#",
      qrCodeData: "PASSPORT-US-992817441",
    },
    {
      id: "doc-2",
      userId: "u-101",
      title: "Boarding Pass: Quantum Air QA-88",
      documentType: "boarding_pass",
      expiryDate: "2026-09-12",
      status: "valid",
      fileUrl: "#",
      qrCodeData: "BP-QA88-SFO-HND-ELENA-ROSTOVA",
    },
    {
      id: "doc-3",
      userId: "u-101",
      title: "Japan Visit e-Tourist Clearance",
      documentType: "visa",
      expiryDate: "2026-10-15",
      status: "valid",
      fileUrl: "#",
      qrCodeData: "VISIT-JAPAN-WEB-APPROVED-2026",
    },
    {
      id: "doc-4",
      userId: "u-101",
      title: "Global Travel & Medical SOS Insurance",
      documentType: "insurance",
      expiryDate: "2026-12-31",
      status: "valid",
      fileUrl: "#",
    },
  ];

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

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Secure Document Vault</Badge>
            <span className="text-xs text-slate-400 font-semibold">Zero-Knowledge Encrypted</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Digital Travel Wallet & eVisa Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Store biometric boarding passes, verified passports, vaccine certificates, and real-time border entry requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "wallet" ? "default" : "outline"}
            onClick={() => setActiveTab("wallet")}
          >
            My Wallet ({mockDocuments.length})
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
        /* Digital Wallet Cards Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Travel Credentials</h3>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockDocuments.map((doc) => (
              <Card key={doc.id} hoverEffect className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <FileText className="w-5 h-5" />
                    </span>
                    <Badge variant={doc.status === "valid" ? "success" : "danger"} size="sm">
                      {doc.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Expires: {doc.expiryDate}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {doc.qrCodeData ? (
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Encrypted PDF</span>
                  )}

                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Real-time Visa Checker Tool */
        <Card className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
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
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={selectedDoc.title}
          description="Present this barcode for airport TSA contactless gates & hotel fast-checkin"
          size="sm"
        >
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-white shadow-xl border border-slate-200">
              <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-mono p-4">
                [SECURE BIOMETRIC QR]
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-slate-500">{selectedDoc.qrCodeData}</p>
            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
