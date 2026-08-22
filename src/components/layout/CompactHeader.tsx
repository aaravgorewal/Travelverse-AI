import React from "react";
import { Menu, Search, Bell, User, Zap } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";

interface CompactHeaderProps {
  onMenuToggle: () => void;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({ onMenuToggle }) => {
  const { currentModule } = useUIStore();
  
  // Format the module name nicely
  const title = currentModule.charAt(0).toUpperCase() + currentModule.slice(1);

  return (
    <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30 transition-colors duration-200">
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 md:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>
        </div>
      </div>

      <div className="flex flex-1 max-w-md mx-4 hidden sm:flex">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Workspace (Cmd+K)"
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
          <Zap className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        <button className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-xs border border-indigo-200 dark:border-indigo-700 ml-1 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-800">
          ER
        </button>
      </div>

    </header>
  );
};
