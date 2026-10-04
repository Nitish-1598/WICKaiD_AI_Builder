import React from 'react';
import { X, Printer, Copy, Check, Sparkles, BookOpen } from 'lucide-react';

interface LookbookExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfits: any[];
  occasion: string;
  userGarments: any[];
}

export const LookbookExportModal: React.FC<LookbookExportModalProps> = ({
  isOpen,
  onClose,
  outfits,
  occasion,
  userGarments,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const text = `# Capsule Wardrobe Lookbook: ${occasion}
Curated by Aura AI Stylist • Google Cloud AI Builder Cup 2026

Total Wardrobe Pieces: ${userGarments.length}
Capsule Looks Curated: ${outfits.length}

${outfits
  .map(
    (o, idx) => `
## Look ${idx + 1}: ${o.name}
- **Vibe**: ${o.vibe}
- **Styling Advice**: ${o.stylingNotes}
- **Garments**:
${o.items?.map((item: any) => `  * ${item.name} (${item.category}, ${item.color || item.primaryColor})`).join('\n')}
`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-4xl glass-panel-luxury rounded-3xl p-6 md:p-8 border border-rose-900/40 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">
                Editorial Capsule Lookbook
              </h3>
              <p className="text-xs text-slate-400">
                Personalized Style Guide for: <span className="text-rose-300 font-semibold">{occasion}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl glass-panel-card text-xs text-slate-300 hover:text-white border border-slate-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-rose-400" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl btn-luxury-primary text-xs font-semibold text-white shadow-md shadow-rose-900/30"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Lookbook Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {outfits.map((outfit, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                    LOOK #{idx + 1} • {outfit.occasion}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                    {outfit.name}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 rounded-xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800">
                  <img
                    src={outfit.previewImageUrl}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-8 space-y-3">
                  <p className="text-xs text-slate-300 italic">"{outfit.vibe}"</p>
                  
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                    <span className="font-bold text-amber-300">Styling Directive:</span>{' '}
                    {outfit.stylingNotes}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Curated Garments:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {outfit.items?.map((item: any, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {item.name} ({item.category})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
