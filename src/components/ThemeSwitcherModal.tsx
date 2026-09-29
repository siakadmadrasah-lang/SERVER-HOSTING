import React from 'react';
import { Palette, Check, Sparkles, X, Sun, Moon } from 'lucide-react';
import { AVAILABLE_THEMES, ThemeId, ThemeConfig } from '../utils/theme';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Studio Tema &amp; Suasana Tampilan Server Cloud PRO</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Tampilan utama: <strong>Terang, Modern &amp; Profesional</strong> (4 Tema Terang Enterprise + 4 Tema Gelap Klasik).
            </p>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {AVAILABLE_THEMES.map((theme: ThemeConfig) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                }}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs relative group ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-400 ring-2 ring-sky-500/30 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {/* Visual Preview Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0 -ml-1.5"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span className="font-bold text-white text-xs">
                      {theme.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.mode === 'light' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3 h-3 text-slate-400" />
                    )}
                    {isSelected && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Aktif</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {theme.tagline}
                </p>

                {/* Micro Mockup Preview Bar */}
                <div 
                  className="h-8 rounded-lg border px-2.5 flex items-center justify-between overflow-hidden"
                  style={{
                    backgroundColor: theme.canvasBg,
                    borderColor: theme.borderHex
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: theme.surfaceBg, border: `1px solid ${theme.primaryColor}` }}
                    />
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                    <div 
                      className="w-14 h-1.5 rounded"
                      style={{ backgroundColor: theme.borderHex }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <div 
                      className="px-2 py-0.5 rounded text-[9px] font-mono text-white font-semibold"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      WHM / cPanel
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>* Tema langsung diterapkan ke seluruh modul dan disimpan otomatis.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
