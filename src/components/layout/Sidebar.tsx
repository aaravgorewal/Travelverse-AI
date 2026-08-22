import React from "react";
import { Home, Compass, Map, Activity, Folders, FileText, Settings, X, Search, Sparkles } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentModule, setModule, setAIConciergeOpen } = useUIStore();

  const handleNav = (module: any) => {
    setModule(module);
    onClose(); // Close mobile menu if open
  };

  const navGroups = [
    {
      title: "Workspace",
      items: [
        { id: "home", label: "Overview", icon: Home },
        { id: "trips", label: "My Trips", icon: Folders },
        { id: "itinerary", label: "Active Itinerary", icon: Map },
      ]
    },
    {
      title: "Explore & Plan",
      items: [
        { id: "destinations", label: "Intelligence", icon: Compass },
        { id: "ai", label: "AI Planner", icon: Sparkles },
      ]
    },
    {
      title: "Operations",
      items: [
        { id: "intelligence", label: "TravelPulse", icon: Activity },
        { id: "documents", label: "Documents", icon: FileText },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">TravelVerse</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group, i) => (
            <div key={i}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 flex-shrink-0">
          <button onClick={() => setAIConciergeOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
               <Sparkles className="w-2 h-2 text-white"/>
            </div>
            Agent Copilot
            <span className="ml-auto text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">Cmd+J</span>
          </button>
          <button onClick={() => handleNav('profile')} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};
