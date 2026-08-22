import React, { useState } from "react";
import { Glasses, Compass, Eye, Sparkles, MapPin, Volume2 } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { SEED_VR_SCENES } from "../../config/constants";
import { Button, Card, Badge } from "../../components/ui";

export const VRGalleryView: React.FC = () => {
  const { openVR } = useUIStore();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredScenes = SEED_VR_SCENES.filter((s) => {
    if (selectedCategory !== "all") {
      const matchType = s.type?.toLowerCase() || "";
      const matchCat = (s as any).category?.toLowerCase() || "";
      if (!matchType.includes(selectedCategory) && !matchCat.includes(selectedCategory)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* VR Metaverse Showcase Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-white p-8 sm:p-12 shadow-sm border  relative overflow-hidden text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 border border-white/20 text-xs font-bold text-indigo-300">
          <Glasses className="w-3.5 h-3.5 text-indigo-400" />
          <span>Spatial Metaverse & WebGL 360° Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Immersive 360° VR World Explorer</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          Teleport into luxury overwater suites, first-class cabins, and observation decks around the globe. Drag to rotate 360°, inspect hotspots, and listen to AI spatial narration.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All VR Panoramas" },
            { id: "suite", label: "Luxury Resorts & Villas" },
            { id: "landscape", label: "Landmarks & Skylines" },
            { id: "cabin", label: "Aircraft & First Class" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500">{filteredScenes.length} Interactive Scenes</span>
      </div>

      {/* VR Scenes Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredScenes.map((scene) => (
          <Card key={scene.id} hoverEffect className="p-0 overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={scene.thumbnailUrl}
                  alt={scene.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                <div className="absolute top-3 left-3">
                  <Badge variant="purple" size="sm">
                    {scene.type.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="rounded-xl bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md">
                    {scene.hotspots.length} Hotspots
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-base font-bold drop-shadow-md">{scene.title}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" /> {scene.destination}, {scene.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {scene.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> AI Audio Guide Ready
              </span>

              <Button
                size="sm"
                onClick={() => openVR(scene)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                <Glasses className="w-3.5 h-3.5 mr-1" /> Launch 360°
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
