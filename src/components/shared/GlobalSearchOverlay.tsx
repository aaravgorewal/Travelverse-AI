import React, { useState, useEffect, useRef } from "react";
import { 
  Search, X, Sparkles, Plane, Building2, Package, Globe, Compass, Clock, ArrowRight 
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { universalSearchService, UniversalSearchResultItem } from "../../features/search/universalSearchService";
import { formatCurrency } from "../../lib/utils";
import { useTravelStore } from "../../stores/useTravelStore";

export const GlobalSearchOverlay: React.FC = () => {
  const { 
    isGlobalSearchOpen, setGlobalSearchOpen, openAIWithPrompt, setModule 
  } = useUIStore();
  const { currency } = useTravelStore();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<UniversalSearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute Search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const response = universalSearchService.search({ query: debouncedQuery, itemsPerPage: 6 });
    setResults(response.items);
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // Load Recents
  useEffect(() => {
    const saved = localStorage.getItem("travelverse_recent_searches");
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch {}
    }
  }, [isGlobalSearchOpen]);

  // Global Hotkey registration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen(!isGlobalSearchOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSearchOpen, setGlobalSearchOpen]);

  // Focus input on open
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isGlobalSearchOpen]);

  // Keyboard navigation within palette
  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setGlobalSearchOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectItem(results[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: UniversalSearchResultItem) => {
    // Add to recents
    const queryTerm = query.trim();
    if (queryTerm) {
      const updated = [queryTerm, ...recentSearches.filter(s => s !== queryTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("travelverse_recent_searches", JSON.stringify(updated));
    }

    setGlobalSearchOpen(false);
    // Route to appropriate view
    if (item.category === "flight") setModule("flights");
    else if (item.category === "hotel") setModule("hotels");
    else if (item.category === "package") setModule("packages");
    else setModule("experiences");
  };

  const handlePopularSearch = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  // Natural language query detector (e.g. sentences or conversational words)
  const isNaturalLanguage = (str: string): boolean => {
    const triggers = ["plan", "find me", "trip to", "under", "family", "vacation", "how to", "suggest", "where", "cheapest"];
    const words = str.toLowerCase().split(/\s+/);
    return words.length >= 3 && triggers.some(t => str.toLowerCase().includes(t));
  };

  const handleAskAI = () => {
    const savedPrompt = query;
    setGlobalSearchOpen(false);
    openAIWithPrompt(savedPrompt);
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-sm p-4 pt-16 sm:pt-28 animate-in fade-in"
      onClick={(e) => e.target === overlayRef.current && setGlobalSearchOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[500px]"
        onKeyDown={handleKeyNav}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flights, hotels, experiences, packages, or ask AI..."
            className="flex-1 bg-transparent border-0 text-sm focus:outline-none text-slate-900 dark:text-white"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
            <span>ESC</span>
          </kbd>
          <button 
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
          
          {/* Natural Language Trigger Overlay */}
          {query.trim() && isNaturalLanguage(query) && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 rounded-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span className="font-bold text-indigo-900 dark:text-indigo-200">Looks like a natural language prompt!</span>
              </div>
              <button 
                onClick={handleAskAI}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all text-[11px]"
              >
                <span>Ask AI instead</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Results list */}
          {query.trim() ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Results</span>
              {results.map((item, idx) => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    selectedIndex === idx 
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/10" 
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {item.category === "flight" ? "✈️" : item.category === "hotel" ? "🏨" : item.category === "package" ? "📦" : "🎡"}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.price, currency)}
                  </span>
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-slate-400 text-center py-6">No matching hotels or travel options found.</p>
              )}
            </div>
          ) : (
            // Seed state (Recents & Popular)
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Column: Recents */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent Searches</span>
                <div className="space-y-1.5">
                  {recentSearches.map((term, i) => (
                    <button 
                      key={i} 
                      onClick={() => handlePopularSearch(term)}
                      className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 flex items-center gap-2 font-medium"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                  {recentSearches.length === 0 && (
                    <p className="text-slate-400 italic text-[11px] px-2.5">No recent queries.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Popular & AI Suggestions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Popular Sights</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Tokyo", "Amalfi Coast", "Dubai Suite", "Kyoto Temples"].map((term) => (
                      <button 
                        key={term} 
                        onClick={() => handlePopularSearch(term)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold hover:border-slate-300 dark:hover:border-slate-600"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Recommended Query Options
                  </span>
                  <div className="space-y-1">
                    {[
                      "Plan a family vacation in Dubai",
                      "Find 5-star hotels in Tokyo",
                      "Cheap flights under $500"
                    ].map((term) => (
                      <button 
                        key={term} 
                        onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                        className="w-full text-left py-1 px-2 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        {term} →
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
