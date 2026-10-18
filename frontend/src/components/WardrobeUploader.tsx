import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Sparkles, Loader2, X, RefreshCw, Layers } from 'lucide-react';

interface WardrobeUploaderProps {
  onGarmentAnalyzed: (garment: any) => void;
  isLoading: boolean;
}

const SAMPLE_WARDROBE_PRESETS = [
  {
    name: 'Camel Merino Wool Overcoat',
    category: 'Outerwear',
    color: 'Camel',
    colorHex: '#C19A6B',
    styleArchetype: 'Minimalist Classic',
    formality: 8,
    fabric: '100% Merino Wool Blend',
    description: 'Double-breasted tailored longline coat in heavyweight wool blend.',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Cream Turtleneck', 'Pleated Trousers', 'Leather Boots'],
  },
  {
    name: 'Cream Ribbed Turtleneck',
    category: 'Tops',
    color: 'Cream',
    colorHex: '#FAF9F6',
    styleArchetype: 'Quiet Luxury',
    formality: 6,
    fabric: 'Heavyweight Cotton Knit',
    description: 'Chunky knit 100% organic cotton mockneck sweater with ribbed cuffs.',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Charcoal Trousers', 'Camel Overcoat', 'White Sneakers'],
  },
  {
    name: 'Charcoal Pleated Trousers',
    category: 'Bottoms',
    color: 'Charcoal Grey',
    colorHex: '#36454F',
    styleArchetype: 'Business Casual',
    formality: 7,
    fabric: 'Virgin Wool Twill',
    description: 'Relaxed tailored trousers with single front pleats and tapered ankle.',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Cream Turtleneck', 'Chelsea Boots', 'Leather Tote'],
  },
  {
    name: 'Cognac Leather Chelsea Boots',
    category: 'Footwear',
    color: 'Cognac Brown',
    colorHex: '#834333',
    styleArchetype: 'Classic Everyday',
    formality: 7,
    fabric: 'Full-Grain Calfskin',
    description: 'Hand-buffed calfskin leather boots with durable Goodyear welt sole.',
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Wool Overcoat', 'Charcoal Trousers'],
  },
  {
    name: 'Minimalist Leather Carryall Tote',
    category: 'Accessories',
    color: 'Midnight Black',
    colorHex: '#101720',
    styleArchetype: 'Executive Minimalist',
    formality: 8,
    fabric: 'Structured Italian Leather',
    description: 'Architectural leather tote fitting laptop and travel essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Camel Coat', 'Charcoal Trousers'],
  },
  {
    name: 'Structured Slate Blue Linen-Blend Blazer',
    category: 'Outerwear',
    color: 'Slate Blue',
    colorHex: '#6A7F96',
    styleArchetype: 'Smart Casual',
    formality: 8,
    fabric: 'Breathable Linen-Tencel Blend',
    description: 'Unstructured soft-shoulder tailored blazer with notch lapels.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['White Poplin Shirt', 'Indigo Selvedge Denim', 'White Sneakers'],
  },
  {
    name: 'Crisp Poplin White Oversized Shirt',
    category: 'Tops',
    color: 'Optic White',
    colorHex: '#FFFFFF',
    styleArchetype: 'Capsule Essential',
    formality: 6,
    fabric: '100% Long-Staple Egyptian Cotton',
    description: 'Classic button-down collar shirt with clean tailored cuffs.',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Slate Blue Blazer', 'Selvedge Denim', 'Leather Loafers'],
  },
  {
    name: 'Japanese Selvedge Raw Indigo Denim',
    category: 'Bottoms',
    color: 'Deep Indigo',
    colorHex: '#1F2D42',
    styleArchetype: 'Modern Heritage',
    formality: 5,
    fabric: '13.5oz Shuttle-Loom Denim',
    description: 'Selvedge denim with classic straight leg cut and clean chainstitch hem.',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['White Oversized Shirt', 'White Sneakers', 'Camel Overcoat'],
  },
  {
    name: 'Minimalist White Leather Low-Top Sneakers',
    category: 'Footwear',
    color: 'Monochrome White',
    colorHex: '#F5F5F5',
    styleArchetype: 'Clean Streetwear',
    formality: 5,
    fabric: 'Italian Nappa Leather',
    description: 'Minimalist leather low-top trainer with stitched margom cupsole.',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
    recommendedPairings: ['Selvedge Denim', 'Poplin Shirt', 'Slate Blue Blazer'],
  },
];

export const WardrobeUploader: React.FC<WardrobeUploaderProps> = ({
  onGarmentAnalyzed,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Process a single file to base64 and call API
  const processFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const res = await fetch('/api/analyze-garment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type || 'image/jpeg',
              previewUrl: URL.createObjectURL(file),
            }),
          });
          const garment = await res.json();
          garment.imageUrl = URL.createObjectURL(file);
          onGarmentAnalyzed(garment);
        } catch (err) {
          console.error('Upload Error:', err);
        } finally {
          resolve();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle batch file upload
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setUploadingCount(files.length);

    for (const file of files) {
      await processFile(file);
    }
    setUploadingCount(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddPreset = (preset: any) => {
    const item = {
      ...preset,
      id: `PRESET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    onGarmentAnalyzed(item);
  };

  // Webcam capture modal controls
  const startCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert('Camera access denied or unavailable on this device.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    stopCamera();
    setUploadingCount(1);

    try {
      const res = await fetch('/api/analyze-garment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          previewUrl: base64,
        }),
      });
      const garment = await res.json();
      garment.imageUrl = base64;
      onGarmentAnalyzed(garment);
    } catch (err) {
      console.error('Camera snap error:', err);
    } finally {
      setUploadingCount(0);
    }
  };

  const isBusy = isLoading || uploadingCount > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative glass-panel-card rounded-2xl p-6 md:p-8 text-center cursor-pointer border-2 border-dashed transition-all ${
          dragActive
            ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-rose-500/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {isBusy ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7" />
            )}
          </div>

          <div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-white">
              {isBusy
                ? `Gemini Multimodal Vision Analyzing ${uploadingCount > 1 ? `${uploadingCount} Garments` : 'Garment'}...`
                : 'Upload or Snap Closet Garments'}
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Select or drop multiple clothing photos (jackets, trousers, shoes, shirts). Gemini extracts fabric composition, color hexes, and formality scores.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl btn-luxury-primary text-xs font-semibold text-white shadow-md shadow-rose-900/30"
            >
              <Layers className="h-4 w-4" />
              <span>Select Photos (Multi-Upload)</span>
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl btn-luxury-secondary text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Camera className="h-4 w-4 text-rose-400" />
              <span>Live Camera Snap</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Preset Wardrobe Chips */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span>Quick 1-Click Wardrobe Presets (Click to add to your closet):</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {SAMPLE_WARDROBE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAddPreset(preset)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-panel-card text-xs text-slate-300 hover:text-white shrink-0 border border-slate-800 hover:border-rose-500/40 transition-colors"
            >
              <img
                src={preset.imageUrl}
                alt={preset.name}
                className="w-6 h-6 rounded-md object-cover"
              />
              <span>+ Add {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Camera Capture Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel-luxury rounded-3xl p-6 border border-rose-900/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-rose-400" />
                <h4 className="font-serif font-bold text-white text-base">Live Garment Scanner</h4>
              </div>
              <button
                onClick={stopCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-rose-500/40 m-4 rounded-xl flex items-center justify-center">
                <span className="text-[10px] uppercase font-mono text-rose-300 bg-black/60 px-2 py-1 rounded">
                  Center Garment in Frame
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={captureSnapshot}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl btn-luxury-primary text-xs font-semibold text-white shadow-lg shadow-rose-900/40"
              >
                <Camera className="h-4 w-4" />
                <span>Capture & Analyze</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
