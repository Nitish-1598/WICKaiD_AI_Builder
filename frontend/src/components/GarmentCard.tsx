import React, { useState } from 'react';
import { Trash2, Tag, Award, Edit2, Check, X, Sparkles } from 'lucide-react';

interface GarmentCardProps {
  garment: any;
  onRemove: (id: string) => void;
  onUpdate?: (updated: any) => void;
}

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'];

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onRemove,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(garment.name);
  const [category, setCategory] = useState(garment.category);
  const [formality, setFormality] = useState(garment.formality || 6);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...garment,
        name,
        category,
        formality: Number(formality),
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="relative glass-panel-card rounded-2xl overflow-hidden border border-slate-800/80 group transition-all hover:border-slate-700">
      
      {/* Garment Image */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        {garment.imageUrl ? (
          <img
            src={garment.imageUrl}
            alt={garment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
            No Preview
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-white backdrop-blur-md"
            title="Edit Attributes"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onRemove(garment.id)}
            className="p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-rose-400 backdrop-blur-md"
            title="Remove from Closet"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
          {garment.category}
        </div>
      </div>

      {/* Attributes */}
      <div className="p-3.5 space-y-2">
        <h4 className="font-semibold text-xs md:text-sm text-white truncate" title={garment.name}>
          {garment.name}
        </h4>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          {/* Color Swatch */}
          <div className="flex items-center space-x-1.5">
            <span
              className="h-3 w-3 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: garment.colorHex || '#888' }}
            ></span>
            <span className="truncate max-w-[80px]">{garment.primaryColor || garment.color}</span>
          </div>

          {/* Formality Rating */}
          <div className="flex items-center space-x-1 font-mono text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
            <Award className="h-3 w-3" />
            <span>{garment.formality}/10</span>
          </div>
        </div>

        {/* Fabric or Style archetype tag */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800/60">
          <span className="truncate">{garment.fabric || garment.styleArchetype || 'Wardrobe Staple'}</span>
          {garment.season && <span className="text-slate-400 shrink-0 ml-1">{garment.season}</span>}
        </div>
      </div>

      {/* Quick In-Place Edit Modal */}
      {isEditing && (
        <div className="absolute inset-0 z-20 bg-slate-950/95 p-3 flex flex-col justify-between text-xs animate-in fade-in">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-white font-semibold pb-1 border-b border-slate-800">
              <span>Edit Garment</span>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs mt-0.5"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs mt-0.5"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Formality ({formality}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formality}
                onChange={(e) => setFormality(Number(e.target.value))}
                className="w-full accent-rose-500 mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-1 rounded btn-luxury-primary text-white text-[11px] font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
