import React, { useState } from "react";
import { Search, Filter, Plus, ArrowRight, MapPin, Building, Sparkles, Folder, List, Grid, MoreVertical, CheckSquare, Trash2, Heart } from "lucide-react";
import { PageHeader, DataList, DataListItem, ContextPanel, AIActionButton, StatusBadge, SaaSEmptyState } from "../../components/ui/SaaSCore";

const mockSavedPlaces = [
  { id: "1", title: "Kyoto, Japan", type: "Destination", collection: "Asia Trip 2026", added: "2 days ago", match: "98%", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" },
  { id: "2", title: "Aman Tokyo", type: "Hotel", collection: "Asia Trip 2026", added: "3 days ago", match: "95%", image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85" },
  { id: "3", title: "Amalfi Coast", type: "Destination", collection: "Summer Ideas", added: "1 week ago", match: "92%", image: "https://images.unsplash.com/photo-1533682805518-48d1f5a8bb38" },
  { id: "4", title: "Le Meurice, Paris", type: "Hotel", collection: "Europe 2027", added: "2 weeks ago", match: "88%", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791" },
];

export const SavedPlacesView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === mockSavedPlaces.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(mockSavedPlaces.map(p => p.id)));
  };

  const filteredPlaces = mockSavedPlaces.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Sidebar Collections */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Collections</h3>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {['All Saved', 'Asia Trip 2026', 'Summer Ideas', 'Europe 2027'].map((col, i) => (
            <button key={i} className={`w-full flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors ${i === 0 ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <div className="flex items-center gap-2">
                <Folder className={`w-4 h-4 ${i === 0 ? 'text-indigo-500' : 'text-slate-400'}`} />
                {col}
              </div>
              <span className="text-xs text-slate-400 bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {i === 0 ? mockSavedPlaces.length : Math.floor(Math.random() * 5) + 1}
              </span>
            </button>
          ))}
          <button className="w-full flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-4">
            <Plus className="w-4 h-4" /> New Collection
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        
        {/* Header & Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <PageHeader
            title="Saved Places & Destinations"
            description="Organize and manage your bookmarked travel research."
            action={
              <AIActionButton>
                <Sparkles className="w-4 h-4 mr-1" /> Organize with AI
              </AIActionButton>
            }
          />

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search saved places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}><List className="w-4 h-4"/></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}><Grid className="w-4 h-4"/></button>
              </div>
              <button className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Banner */}
        {selectedItems.size > 0 && (
          <div className="bg-indigo-50 border-b border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={selectAll} className="text-indigo-600 dark:text-indigo-400"><CheckSquare className="w-5 h-5" /></button>
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">{selectedItems.size} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-white border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-50 dark:bg-slate-900 dark:border-indigo-500/30 dark:text-indigo-400">Add to Trip</button>
              <button className="px-3 py-1.5 text-xs font-medium bg-white border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-50 dark:bg-slate-900 dark:border-indigo-500/30 dark:text-indigo-400">Move to Collection</button>
              <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded dark:hover:bg-rose-900/20"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPlaces.length === 0 ? (
            <SaaSEmptyState title="No saved places" description="You haven't bookmarked any destinations yet." />
          ) : viewMode === 'list' ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="col-span-1 flex items-center"><button onClick={selectAll}><div className={`w-4 h-4 rounded border ${selectedItems.size === mockSavedPlaces.length ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}/></button></div>
                <div className="col-span-5">Place</div>
                <div className="col-span-2">Collection</div>
                <div className="col-span-2">AI Match</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <DataList className="border-y-0">
                {filteredPlaces.map(place => (
                  <div key={place.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="col-span-1">
                      <button onClick={() => toggleSelect(place.id)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedItems.has(place.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                           {selectedItems.has(place.id) && <CheckSquare className="w-3 h-3"/>}
                        </div>
                      </button>
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={place.image} alt={place.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{place.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          {place.type === 'Hotel' ? <Building className="w-3 h-3"/> : <MapPin className="w-3 h-3"/>}
                          {place.type} • Added {place.added}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status="neutral">{place.collection}</StatusBadge>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                        <Sparkles className="w-3 h-3"/> {place.match}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded dark:bg-indigo-500/10 dark:text-indigo-400">Add</button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </DataList>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map(place => (
                <div key={place.id} className="group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm relative">
                  <div className="absolute top-2 left-2 z-10">
                    <button onClick={() => toggleSelect(place.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedItems.has(place.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/50 border-slate-300 backdrop-blur-sm'}`}>
                         {selectedItems.has(place.id) && <CheckSquare className="w-3 h-3"/>}
                      </div>
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <button className="p-1.5 bg-white/50 backdrop-blur-sm rounded-full text-rose-500 hover:bg-white"><Heart className="w-4 h-4 fill-rose-500"/></button>
                  </div>
                  <div className="h-40 overflow-hidden">
                    <img src={place.image} alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">{place.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-slate-500">{place.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"/>
                      <span className="text-xs text-slate-500">{place.collection}</span>
                    </div>
                    <button className="w-full py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">Add to Trip</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
