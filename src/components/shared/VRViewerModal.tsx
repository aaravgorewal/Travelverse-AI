import React, { useState, useRef, useEffect } from "react";
import { X, Volume2, VolumeX, Compass, Sparkles, MapPin, Eye } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { aiAPI } from "../../lib/api/ai";
import { Button, Badge } from "../ui";
import { useToast } from "../ui/Toast";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

export const VRViewerModal: React.FC = () => {
  const { activeVRScene, isVRModalOpen, closeVR } = useUIStore();
  const { showToast } = useToast();
  const [activeHotspot, setActiveHotspot] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [aiNarration, setAiNarration] = useState<string | null>(null);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeVRScene) {
      setActiveHotspot(null);
      setAiNarration(null);
      analyticsService.trackEvent("vr_opened", { sceneId: activeVRScene.id, sceneTitle: activeVRScene.title });
    }
  }, [activeVRScene]);

  if (!isVRModalOpen || !activeVRScene) return null;

  const handleGenerateVoiceNarration = async (hotspotContext?: any) => {
    setIsGeneratingNarration(true);
    const contextTitle = hotspotContext ? hotspotContext.title : activeVRScene.title;
    const contextDesc = hotspotContext ? hotspotContext.description : activeVRScene.destination;

    try {
      const result = await aiAPI.chat(
        activeVRScene.id,
        contextTitle,
        contextDesc
      );
      setAiNarration(result.message);
    } catch {
      setAiNarration(
        `Welcome to ${contextTitle}. You are currently gazing across pristine views of ${contextDesc}. Notice the extraordinary light reflections and natural architectural harmony. Enjoy this immersive preview of your next great journey.`
      );
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const handleHotspotAction = (action: string) => {
    if (action === "ai") {
      handleGenerateVoiceNarration(activeHotspot);
    } else if (action === "trip") {
      showToast({
        title: "Added to Trip",
        message: `${activeHotspot?.title} added to your active itinerary.`,
        type: "success",
      });
    } else {
      showToast({
        title: "View Details",
        message: `Opening details for ${activeHotspot?.title}...`,
        type: "info",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 md:p-6 select-none animate-in fade-in duration-200">
      {/* VR Viewport Frame */}
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl h-full md:h-[85vh] md:rounded-3xl overflow-hidden shadow-2xl md:border border-slate-700 bg-slate-950 flex flex-col justify-between touch-none"
      >
        {/* Real 360 Viewer */}
        <div className="absolute inset-0 z-0">
          <ReactPhotoSphereViewer
            src={activeVRScene.panoramaUrl}
            height="100%"
            width="100%"
            littlePlanet={false}
            plugins={[
              [
                MarkersPlugin,
                {
                  markers: activeVRScene.hotspots.map((hotspot) => ({
                    id: hotspot.id,
                    // Roughly map percentage x,y to yaw and pitch
                    yaw: `${(hotspot.x / 100) * 360}deg`,
                    pitch: `${90 - (hotspot.y / 100) * 180}deg`,
                    html: `<div style="width: 28px; height: 28px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59,130,246,0.8); cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>`,
                    tooltip: hotspot.title,
                    data: hotspot,
                  })),
                },
              ],
            ]}
            onReady={(instance) => {
              const markersPlugin = instance.getPlugin(MarkersPlugin as any);
              if (markersPlugin) {
                markersPlugin.addEventListener("select-marker", (e: any) => {
                  setActiveHotspot(e.marker.data);
                });
              }
            }}
          />
        </div>

        {/* Top HUD Controls */}
        <div className="relative z-30 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/80 text-white backdrop-blur-md border border-blue-400/30 shadow-lg">
              <Compass className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{activeVRScene.title}</h2>
                <Badge variant="info">WebGL 360° VR</Badge>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeVRScene.destination}, {activeVRScene.country}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateVoiceNarration()}
              isLoading={isGeneratingNarration}
              className="bg-black/40 text-white border-white/20 hover:bg-black/60 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI Audio Guide</span>
            </Button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-black/40 text-white border border-white/20 hover:bg-black/60 backdrop-blur-md transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={closeVR}
              className="p-2.5 rounded-xl bg-rose-600/80 text-white hover:bg-rose-700 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hotspot Detail Card Popover */}
        {activeHotspot && (
          <div className="absolute z-30 mx-6 top-24 self-start max-w-sm rounded-2xl bg-slate-900/95 text-white p-5 border border-slate-700 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">{activeHotspot.tag}</span>
              <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-base font-bold mt-2 text-white">{activeHotspot.title}</h4>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeHotspot.description}</p>
            
            <div className="mt-5 flex flex-col gap-2.5">
              <Button size="sm" onClick={() => handleHotspotAction("details")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                View Details
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button size="sm" variant="outline" onClick={() => handleHotspotAction("trip")} className="text-slate-200 border-slate-600 hover:bg-slate-800">
                  Add to Trip
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleHotspotAction("ai")} className="text-slate-200 border-slate-600 hover:bg-slate-800">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" /> Ask AI
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom AI Narration Banner & Controls */}
        <div className="relative z-30 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
          {aiNarration && (
            <div className="mb-4 max-w-2xl mx-auto rounded-2xl bg-blue-950/90 text-blue-100 p-4 border border-blue-700/50 backdrop-blur-md text-sm leading-relaxed animate-in slide-in-from-bottom-2 shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-2 text-blue-300 font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Spatial Audio Script</span>
                </div>
                <button onClick={() => setAiNarration(null)} className="text-blue-400 hover:text-blue-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p>{aiNarration}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Drag screen to pan • Scroll to zoom • Click markers to explore</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
