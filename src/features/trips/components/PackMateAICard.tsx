import React, { useState } from "react";
import { Sparkles, Plus, Trash2, CheckCircle, Circle, RefreshCw, Settings2, Loader2, Save } from "lucide-react";
import { useTripStore } from "../../../stores/useTravelStore";
import { tripService } from "../../../services/appServices";
import { aiAPI } from "../../../lib/api/ai";
import { Button, Card, Badge, Input } from "../../../components/ui";
import { useToast } from "../../../components/ui/Toast";

export const PackMateAICard: React.FC = () => {
  const { activeTrip, updateTrip, togglePackingItem } = useTripStore();
  const { showToast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Clothes");

  // PackMate Context State (defaulted from activeTrip)
  const [context, setContext] = useState({
    destination: activeTrip?.destination || "",
    duration_days: activeTrip?.days.length || 7,
    weather: activeTrip?.days[0]?.weatherForecast?.condition || "Sunny",
    activities: "Sightseeing, dining",
    travelerType: "Solo",
  });

  if (!activeTrip) return null;

  const CATEGORIES = [
    "Documents",
    "Clothes",
    "Electronics",
    "Toiletries",
    "Health essentials",
    "Activity gear",
  ];

  // Helper to persist to API and local store
  const persistPackingList = async (newList: any[]) => {
    const updated = { ...activeTrip, packingList: newList };
    updateTrip(updated);
    try {
      await tripService.updateTrip(activeTrip.id, { packingList: newList });
    } catch (err) {
      console.error("Failed to persist packing list", err);
      // We still updated local state, could show error toast here
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await aiAPI.packingList({
        destination: context.destination,
        duration_days: context.duration_days,
        weather: context.weather,
      });

      // Flatten AI response into flat packingList structure
      const newList: any[] = [];
      res.data.packingList.forEach(cat => {
        // Map AI category to our render categories if possible, else use as is
        const mappedCat = CATEGORIES.find(c => c.toLowerCase() === cat.category.toLowerCase()) || cat.category;
        cat.items.forEach(item => {
          newList.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            item: item.name,
            packed: false,
            category: mappedCat,
          });
        });
      });

      // Enforce the requested categories if AI missed them, we just ensure they exist conceptually.
      await persistPackingList(newList);
      showToast({ title: "Packing List Generated", message: "PackMate AI created your checklist.", type: "success" });
      setShowConfig(false);
    } catch (err: any) {
      showToast({ title: "Generation Failed", message: err.message, type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    const newList = activeTrip.packingList.filter(i => i.id !== itemId);
    await persistPackingList(newList);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: `item-${Date.now()}`,
      item: newItemText.trim(),
      packed: false,
      category: selectedCategory,
    };
    await persistPackingList([newItem, ...activeTrip.packingList]);
    setNewItemText("");
  };

  const handleToggle = async (itemId: string) => {
    // Optimistic toggle
    togglePackingItem(activeTrip.id, itemId);
    // Find item and invert for API payload
    const newList = activeTrip.packingList.map(item => 
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    try {
      await tripService.updateTrip(activeTrip.id, { packingList: newList });
    } catch (err) {
      console.error(err);
    }
  };

  // Group items by category
  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = activeTrip.packingList.filter(item => 
      item.category.toLowerCase() === cat.toLowerCase() || 
      (cat === "Activity gear" && !CATEGORIES.slice(0, 5).some(c => c.toLowerCase() === item.category.toLowerCase())) // catch-all
    );
    return acc;
  }, {} as Record<string, any[]>);

  const totalItems = activeTrip.packingList.length;
  const packedItems = activeTrip.packingList.filter(i => i.packed).length;
  const progress = totalItems === 0 ? 0 : (packedItems / totalItems) * 100;

  return (
    <Card className="p-6 space-y-6 flex flex-col h-full border-indigo-100 dark:border-indigo-900 shadow-xl bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            PackMate AI
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart contextual packing checklist</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <Settings2 className="w-4 h-4 mr-2" /> Context
          </Button>
          <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Regenerate
          </Button>
        </div>
      </div>

      {showConfig && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Destination</label>
            <Input value={context.destination} onChange={e => setContext({ ...context, destination: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Weather</label>
            <Input value={context.weather} onChange={e => setContext({ ...context, weather: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Activities</label>
            <Input value={context.activities} onChange={e => setContext({ ...context, activities: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Traveler Type</label>
            <Input value={context.travelerType} onChange={e => setContext({ ...context, travelerType: e.target.value })} />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Packing Progress</span>
          <span className="text-indigo-600">{packedItems} / {totalItems} Packed</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Input 
          value={newItemText} 
          onChange={e => setNewItemText(e.target.value)} 
          placeholder="Add custom item..." 
          className="flex-1"
        />
        <Button type="submit" variant="outline" className="shrink-0"><Plus className="w-4 h-4" /></Button>
      </form>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar max-h-[500px]">
        {CATEGORIES.map(category => {
          const items = groupedItems[category];
          if (!items || items.length === 0) return null;
          
          return (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                      item.packed 
                        ? 'border-transparent bg-slate-50 dark:bg-slate-900/50' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleToggle(item.id)}
                    >
                      {item.packed ? (
                        <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                      <span className={`text-sm font-medium transition-all ${item.packed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {item.item}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {totalItems === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            No items yet. Generate a smart packing list or add items manually!
          </div>
        )}
      </div>
    </Card>
  );
};
