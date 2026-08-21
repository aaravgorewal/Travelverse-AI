import React, { useState } from "react";
import { 
  User, Sparkles, Users, CreditCard, Globe, Bell, Shield, Key, Trash2, 
  Eye, EyeOff, Save, CheckCircle2, AlertTriangle, ShieldCheck, Plus
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { authService } from "../../services";
import { Button, Card, Badge, Input, Modal } from "../../components/ui";

interface Companion {
  id: string;
  name: string;
  relationship: string;
  dob: string;
}

export const ProfileView: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { setModule } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<
    "personal" | "preferences" | "travelers" | "payments" | "language" | "notifications" | "privacy" | "security"
  >("personal");

  // Personal Info Form State
  const [name, setName] = useState(user?.name || "Elena Rostova");
  const [phone, setPhone] = useState("+1 (415) 892-3310");
  const [passport, setPassport] = useState(user?.passportNumber || "US-992817441");
  const [revealPassport, setRevealPassport] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Preferences Form State
  const [seat, setSeat] = useState(user?.seatPreference || "Window");
  const [cabin, setCabin] = useState(user?.preferredCabin || "Business / First");
  const [dietary, setDietary] = useState(user?.dietary || "Pescatarian");
  const [hotelPref, setHotelPref] = useState("Boutique & 5-Star Resorts");

  // Saved Travelers State
  const [companions, setCompanions] = useState<Companion[]>([
    { id: "c1", name: "Dmitry Rostov", relationship: "Spouse", dob: "1988-04-12" },
    { id: "c2", name: "Sofia Rostova", relationship: "Child", dob: "2018-09-24" }
  ]);
  const [newCompName, setNewCompName] = useState("");
  const [newCompRel, setNewCompRel] = useState("Spouse");
  const [newCompDob, setNewCompDob] = useState("");

  // Payment Preferences
  const [cards, setCards] = useState([
    { id: "card-1", type: "Visa", number: "•••• •••• •••• 4242", expiry: "12/28", label: "Primary Personal" }
  ]);

  // Language & Toggles
  const [lang, setLang] = useState("English");
  
  // Notification Toggles
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  // Privacy Settings
  const [zeroKnowledge, setZeroKnowledge] = useState(true);
  const [shareData, setShareData] = useState(false);

  // Security Toggles & Delete
  const [passWord, setPassWord] = useState("••••••••");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const savePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      // Direct store update
      updateUser({
        name,
        passportNumber: passport
      });
      alert("Personal Info updated successfully.");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const savePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      seatPreference: seat,
      preferredCabin: cabin,
      dietary
    });
    alert("Travel preferences saved successfully.");
  };

  const handleAddCompanion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim() || !newCompDob) return;
    const newComp: Companion = {
      id: `comp-${Date.now()}`,
      name: newCompName,
      relationship: newCompRel,
      dob: newCompDob
    };
    setCompanions(prev => [...prev, newComp]);
    setNewCompName("");
    setNewCompDob("");
  };

  const handleRemoveCompanion = (id: string) => {
    setCompanions(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Please type 'DELETE' exactly to confirm deletion.");
      return;
    }
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      logout();
      setModule("home");
      alert("Your account has been deleted permanently.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const tabsList = [
    { id: "personal", name: "Personal Info", icon: <User className="w-4 h-4" /> },
    { id: "preferences", name: "Travel Preferences", icon: <Sparkles className="w-4 h-4" /> },
    { id: "travelers", name: "Saved Travelers", icon: <Users className="w-4 h-4" /> },
    { id: "payments", name: "Payment Details", icon: <CreditCard className="w-4 h-4" /> },
    { id: "language", name: "Language / Regional", icon: <Globe className="w-4 h-4" /> },
    { id: "notifications", name: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "privacy", name: "Privacy", icon: <Shield className="w-4 h-4" /> },
    { id: "security", name: "Security & Account", icon: <Key className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in">
      
      {/* Profile Header */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
            alt={user?.name || "User avatar"}
            className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/10 shadow-2xl"
          />

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <Badge variant="purple">Diamond VIP</Badge>
            </div>
            <p className="text-xs text-blue-200">{user?.email} • Session ID Active</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-350 font-bold">
              <span>⭐ {(user?.loyaltyPoints || 0).toLocaleString()} Miles</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Verified Zero-Carbon Travel DNA</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Settings Body */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1 pb-2 md:pb-0 scrollbar-none">
          {tabsList.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Workspace panel */}
        <div className="flex-1 min-w-0">
          
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" /> Personal Information
              </h3>
              <form onSubmit={savePersonalInfo} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Full Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Mobile Number</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Passport Number (Sensitive)</label>
                    <div className="flex gap-2">
                      <Input 
                        type={revealPassport ? "text" : "password"} 
                        value={passport} 
                        onChange={(e) => setPassport(e.target.value)} 
                        className="font-mono flex-1"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setRevealPassport(!revealPassport)}
                        className="px-3"
                      >
                        {revealPassport ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5" isLoading={isSavingPersonal}>
                    <Save className="w-4 h-4" />
                    <span>Save Contact Details</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Travel Preferences Tab */}
          {activeTab === "preferences" && (
            <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" /> Travel Preferences (AI Calibrated)
              </h3>
              <form onSubmit={savePreferences} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Preferred Seat Selection</label>
                    <select value={seat} onChange={(e) => setSeat(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none">
                      <option value="Window">Window Seat</option>
                      <option value="Aisle">Aisle Seat</option>
                      <option value="Extra Legroom">Extra Legroom Exit Row</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Preferred Cabin Class</label>
                    <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none">
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business / First">Business / First Class VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Dietary Profile</label>
                    <Input value={dietary} onChange={(e) => setDietary(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Hotel Style Prefs</label>
                    <Input value={hotelPref} onChange={(e) => setHotelPref(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                    <Save className="w-4 h-4" />
                    <span>Save Travel DNA</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Saved Travelers Tab */}
          {activeTab === "travelers" && (
            <Card className="p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Saved Travel Companions
              </h3>

              <div className="space-y-3">
                {companions.map(comp => (
                  <div key={comp.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{comp.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{comp.relationship} • DOB: {comp.dob}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveCompanion(comp.id)}
                      className="p-1.5 text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Remove Companion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Companion Form */}
              <form onSubmit={handleAddCompanion} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-extrabold text-xs text-slate-750 dark:text-slate-250 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-indigo-500" /> Add Companion
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name</label>
                    <Input value={newCompName} onChange={(e) => setNewCompName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Relationship</label>
                    <select value={newCompRel} onChange={(e) => setNewCompRel(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none">
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend / Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Date of Birth</label>
                    <Input type="date" value={newCompDob} onChange={(e) => setNewCompDob(e.target.value)} required />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-750">Add Companion</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Payment Preferences */}
          {activeTab === "payments" && (
            <Card className="p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" /> Secure Payment Profiles
                </h3>
                <Badge variant="success" className="gap-1"><ShieldCheck className="w-3.5 h-3.5" /> PCI Encrypted</Badge>
              </div>

              <div className="space-y-3">
                {cards.map(card => (
                  <div key={card.id} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-300">💳 {card.type}</span>
                        <Badge variant="outline" size="sm">{card.label}</Badge>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">{card.number}</p>
                      <p className="text-[10px] text-slate-450">Expires: {card.expiry}</p>
                    </div>
                    <button 
                      onClick={() => setCards(cards.filter(c => c.id !== card.id))}
                      className="p-1.5 text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Language Selection */}
          {activeTab === "language" && (
            <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> Language & Regional Settings
              </h3>
              <div className="space-y-4 text-xs max-w-sm">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Preferred Language</label>
                  <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-bold">
                    <option value="English">English (United States)</option>
                    <option value="Japanese">日本語 (Japan)</option>
                    <option value="French">Français (France)</option>
                    <option value="Spanish">Español (Spain)</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> Notification Channels
              </h3>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">Email Alerts</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Send gate changes and booking invoices via email.</p>
                  </div>
                  <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">SMS Updates</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Receive immediate disruption notifications on mobile.</p>
                  </div>
                  <input type="checkbox" checked={notifSms} onChange={(e) => setNotifSms(e.target.checked)} className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">Web Push Broadcasts</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Enable browser notifications for active itineraries.</p>
                  </div>
                  <input type="checkbox" checked={notifPush} onChange={(e) => setNotifPush(e.target.checked)} className="w-4 h-4" />
                </div>
              </div>
            </Card>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> Data Privacy Control
              </h3>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">Zero-Knowledge Document Encrypt</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Keep boarding passes and passport images encrypted client-side.</p>
                  </div>
                  <input type="checkbox" checked={zeroKnowledge} onChange={(e) => setZeroKnowledge(e.target.checked)} className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">Share preferences with partners</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Allow seat and meal preferences to sync automatically with airlines.</p>
                  </div>
                  <input type="checkbox" checked={shareData} onChange={(e) => setShareData(e.target.checked)} className="w-4 h-4" />
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab (Includes Delete Account) */}
          {activeTab === "security" && (
            <Card className="p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" /> Password & Credential Security
              </h3>

              <div className="space-y-4 text-xs max-w-sm">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Account Password</label>
                  <div className="flex gap-2">
                    <Input type="password" value={passWord} onChange={(e) => setPassWord(e.target.value)} className="flex-1" />
                    <Button variant="outline">Modify</Button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-red-100 dark:border-red-950/40 space-y-4">
                <h4 className="text-sm font-extrabold text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h4>
                <p className="text-xs text-slate-500">Permanently delete your profile, booking ledger, saved credentials, and loyalty points. This action is irreversible.</p>
                <Button 
                  type="button" 
                  onClick={() => setShowDeleteModal(true)} 
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs"
                >
                  Delete My TravelVerse Account
                </Button>
              </div>
            </Card>
          )}

        </div>

      </div>

      {/* Account Deletion Confirmation Dialog Modal */}
      {showDeleteModal && (
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => !isDeleting && setShowDeleteModal(false)}
          title="Permanently Delete Account"
          description="Are you absolutely sure you want to delete your profile? All credits, GDS tickets, and travel history will be wiped."
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
              To proceed, please type <strong className="font-extrabold text-red-900 dark:text-red-200">DELETE</strong> in the box below to authorize wiping the DB.
            </div>
            
            <Input 
              value={deleteConfirmText} 
              onChange={(e) => setDeleteConfirmText(e.target.value)} 
              placeholder="Type DELETE here" 
              className="text-center font-bold"
            />

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
              <Button 
                onClick={handleDeleteAccount} 
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold"
              >
                Confirm Permanent Wipe
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
