import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Grid, Image as ImageIcon } from "lucide-react";
import { Modal } from "../../../components/ui";

interface HotelPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  images: string[];
}

export const HotelPhotosModal: React.FC<HotelPhotosModalProps> = ({
  isOpen,
  onClose,
  hotelName,
  images,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${hotelName} - High-Resolution Gallery`}
      description={`Viewing image ${activeIndex + 1} of ${images.length}`}
      size="full"
    >
      <div className="space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("carousel")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "carousel"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Full Viewer</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Photos Grid ({images.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Photo {activeIndex + 1} / {images.length}
          </span>
        </div>

        {viewMode === "carousel" ? (
          <div className="space-y-4">
            {/* Big Carousel View */}
            <div className="relative h-[65vh] w-full rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center group">
              <img
                src={images[activeIndex]}
                alt={`${hotelName} photo ${activeIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next Buttons */}
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === activeIndex
                      ? "border-blue-600 scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  setViewMode("carousel");
                }}
                className="relative h-44 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                <img
                  src={img}
                  alt={`photo ${idx}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
