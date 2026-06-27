import React from "react";
import { 
  Sparkles, 
  Settings2, 
  Palette, 
  RefreshCw, 
  HelpCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { CustomizationOptions, PresetTheme } from "../types";
import { PRESET_THEMES, SUGGESTIONS } from "../data";

interface ConfigurationPanelProps {
  options: CustomizationOptions;
  onChangeOptions: (newOptions: CustomizationOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasApiKey: boolean;
}

export default function ConfigurationPanel({ 
  options, 
  onChangeOptions, 
  onGenerate, 
  isGenerating,
  hasApiKey
}: ConfigurationPanelProps) {

  const handlePresetThemeSelect = (theme: PresetTheme) => {
    onChangeOptions({
      ...options,
      themeColor: theme.primary,
      themeColorHex: theme.hex
    });
  };

  const handleScreenTypeSelect = (type: "both" | "login" | "signup" | "home") => {
    onChangeOptions({
      ...options,
      screenType: type
    });
  };

  const handleSuggestionClick = (suggestionText: string) => {
    onChangeOptions({
      ...options,
      customInstructions: suggestionText
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-6 text-white">
      
      {/* HEADER SECTION */}
      <div className="flex items-center space-x-2.5 pb-4 border-b border-white/15">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#fcd116]">
          <Settings2 size={20} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">Personnaliser le Code</h2>
          <p className="text-[11px] text-white/60">Ajustez l'architecture et les styles d'Expo</p>
        </div>
      </div>

      {/* 1. SCREEN ARCHITECTURE */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
          Structure des Écrans
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleScreenTypeSelect("both")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              options.screenType === "both"
                ? "bg-[#fcd116] border-[#fcd116] text-[#004d31] shadow-sm shadow-[#fcd116]/20"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            Les Deux (Auth)
          </button>
          <button
            type="button"
            onClick={() => handleScreenTypeSelect("login")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              options.screenType === "login"
                ? "bg-[#fcd116] border-[#fcd116] text-[#004d31] shadow-sm shadow-[#fcd116]/20"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => handleScreenTypeSelect("signup")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              options.screenType === "signup"
                ? "bg-[#fcd116] border-[#fcd116] text-[#004d31] shadow-sm shadow-[#fcd116]/20"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            Inscription
          </button>
          <button
            type="button"
            onClick={() => handleScreenTypeSelect("home")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              options.screenType === "home"
                ? "bg-[#fcd116] border-[#fcd116] text-[#004d31] shadow-sm shadow-[#fcd116]/20"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            Accueil (Hybrid)
          </button>
        </div>
      </div>

      {/* 2. COLOR THEMES */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center">
            <Palette size={12} className="mr-1 text-[#fcd116]" /> Thème Visuel Béninois
          </label>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {PRESET_THEMES.map((theme) => {
            const isSelected = options.themeColorHex === theme.hex;
            return (
              <div
                key={theme.id}
                onClick={() => handlePresetThemeSelect(theme)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected 
                    ? "border-[#fcd116] bg-white/15" 
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 text-white/95"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded-full ${theme.primary} border border-white/20 shadow-sm`} />
                  <span className="text-xs font-semibold text-white/90">{theme.name}</span>
                </div>
                <div className="text-[10px] text-white/40 font-mono font-bold uppercase">{theme.hex}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. GEMINI INSTRUCTIONS */}
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center">
            <Sparkles size={12} className="mr-1 text-purple-400" /> Instructions Gemini AI
          </label>
          <span className="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            Alimenté par l'IA
          </span>
        </div>
        <textarea
          placeholder="Ex: Ajoute un bouton de connexion avec Facebook, ou ajoute l'authentification par empreinte digitale..."
          value={options.customInstructions}
          onChange={(e) => onChangeOptions({ ...options, customInstructions: e.target.value })}
          className="w-full h-24 p-3 text-xs bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#fcd116] text-white placeholder:text-white/30 resize-none font-medium leading-relaxed transition-colors"
        />

        {/* Short suggestion pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-tight block">Suggestions populaires :</span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(s.instructions)}
                className="text-[10px] font-semibold bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. KEY WARNING OR INFO */}
      {!hasApiKey && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex space-x-2">
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200 leading-normal">
            <strong>Pas de clé API trouvée :</strong> Vous utilisez les configurations d'écrans par défaut. Pour utiliser la génération IA, ajoutez votre clé <strong>GEMINI_API_KEY</strong> dans le menu <strong>Settings &gt; Secrets</strong> de Google AI Studio.
          </p>
        </div>
      )}

      {/* 5. SUBMIT ACTION */}
      <button
        type="button"
        disabled={isGenerating}
        onClick={onGenerate}
        className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer ${
          isGenerating
            ? "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
            : "bg-[#fcd116] text-[#004d31] hover:bg-[#ffd724] active:scale-98 shadow-[#fcd116]/10"
        }`}
      >
        <RefreshCw size={15} className={isGenerating ? "animate-spin" : ""} />
        <span>{isGenerating ? "Génération en cours..." : "Régénérer le Code avec l'IA"}</span>
      </button>

    </div>
  );
}
