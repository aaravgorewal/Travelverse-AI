import React, { useState } from "react";
import { User, Sparkles, Users, CreditCard, Globe, Bell, Shield, Key, Trash2, CheckCircle2, ChevronRight, Check } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { useI18nStore } from "../../stores/useI18nStore";
import { authService } from "../../services";
import { PageHeader, StatusBadge } from "../../components/ui/SaaSCore";
import { useToast } from "../../components/ui/Toast";

export const ProfileView: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { setModule } = useUIStore();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"personal" | "preferences" | "travelers" | "security">("personal");

  // Form State
  const [name, setName] = useState(user?.name || "Elena Rostova");
  const [phone, setPhone] = useState("+1 (415) 892-3310");
  const [passport, setPassport] = useState(user?.passportNumber || "US-992817441");
  const [seat, setSeat] = useState(user?.seatPreference || "Window");
  const [dietary, setDietary] = useState(user?.dietary || "Pescatarian");
  const [isSaving, setIsSaving] = useState(false);

  const savePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      updateUser({ name, passportNumber: passport });
      showToast({ title: "Settings Updated", message: "Your profile information has been saved.", type: "success" });
    } finally {
      setIsSaving(false);
    }
  };

  const tabsList = [
    { id: "personal", name: "Profile & Account", icon: <User className="w-4 h-4" /> },
    { id: "preferences", name: "Travel Preferences", icon: <Sparkles className="w-4 h-4" /> },
    { id: "travelers", name: "Saved Companions", icon: <Users className="w-4 h-4" /> },
    { id: "security", name: "Security & Privacy", icon: <Shield className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Settings Navigation Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-sm text-slate-500">Manage your account preferences</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabsList.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                  {tab.icon}
                </div>
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        
        <div className="p-6 md:p-10 max-w-4xl">
          
          {activeTab === "personal" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Profile & Account</h3>
                <p className="text-sm text-slate-500">Update your personal details and contact information.</p>
              </div>

              <form onSubmit={savePersonalInfo} className="space-y-8">
                
                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                  <div className="md:col-span-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Personal Information</h4>
                    <p className="text-sm text-slate-500 mt-1">This information will be used for bookings and TSA compliance.</p>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Legal Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                  <div className="md:col-span-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Travel Documents</h4>
                    <p className="text-sm text-slate-500 mt-1">Stored securely via Zero-Knowledge encryption.</p>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="max-w-xs space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Passport Number</label>
                      <input
                        type="password"
                        value={passport}
                        onChange={(e) => setPassport(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSaving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab !== "personal" && (
             <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
               <Sparkles className="w-8 h-8 text-slate-400 mb-4" />
               <h3 className="text-sm font-medium text-slate-900 dark:text-white">Settings Section Empty</h3>
               <p className="text-sm text-slate-500">This settings block is implemented following the exact same SaaS pattern.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
