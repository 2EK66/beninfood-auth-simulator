import React, { useState } from "react";
import { 
  Copy, 
  Check, 
  Download, 
  Search, 
  FileCode,
  Info,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface CodeViewerProps {
  code: string;
  screenType: string;
}

export default function CodeViewer({ code, screenType }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Échec de la copie", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    let filename = "BeninFoodAuth.tsx";
    if (screenType === "login") filename = "BeninFoodLogin.tsx";
    if (screenType === "signup") filename = "BeninFoodSignup.tsx";

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to highlight simple search matches or format basic layout
  const getCodeWithHighlights = () => {
    if (!searchQuery) return code;
    
    // Simple sanitization for HTML display
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const regex = new RegExp(`(${searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    return escapedCode.replace(regex, `<mark class="bg-yellow-200 text-slate-900 rounded px-0.5 font-bold">$1</mark>`);
  };

  // Deduce components or features used to present a neat summary
  const getDetectedFeatures = () => {
    const features = [];
    if (code.includes("lucide-react-native")) features.push("Icônes Lucide");
    if (code.includes("useState")) features.push("Hooks d'État React");
    if (code.includes("KeyboardAvoidingView")) features.push("Support Clavier iOS/Android");
    if (code.includes("role") || code.includes("Role")) features.push("Sélecteur de Rôle (Gérant, Client, Livreur)");
    if (code.includes("validateForm") || code.includes("errors")) features.push("Validation des champs béninois");
    if (code.includes("Alert.alert")) features.push("Feedback Natif Alert");
    if (code.includes("className")) features.push("Style NativeWind (Tailwind)");
    return features;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col h-full min-h-[500px]">
      
      {/* CARD TOP ACTIONS HEADER */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#fcd116]">
            <FileCode size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Code Source Expo (React Native)
            </h3>
            <p className="text-[10px] text-white/60">Prêt pour NativeWind / Tailwind CSS</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 w-36 sm:w-44 font-semibold"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              copied 
                ? "bg-emerald-600 text-white" 
                : "bg-white/10 text-white/90 hover:bg-white/15 hover:text-white border border-white/10"
            }`}
            title="Copier le code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden md:inline">{copied ? "Copié !" : "Copier"}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/15 hover:text-white border border-white/10 transition-all text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            title="Télécharger le fichier .tsx"
          >
            <Download size={14} />
            <span className="hidden md:inline">Télécharger</span>
          </button>
        </div>
      </div>

      {/* QUICK STATS / DETECTED STUFF */}
      <div className="px-6 py-2.5 bg-white/5 border-b border-white/10 flex flex-wrap gap-1.5 items-center">
        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider mr-1 flex items-center">
          <Layers size={10} className="mr-1" /> Fonctionnalités détectées :
        </span>
        {getDetectedFeatures().map((f, idx) => (
          <span 
            key={idx} 
            className="bg-white/5 text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10"
          >
            {f}
          </span>
        ))}
      </div>

      {/* RENDERED CODE BLOCK */}
      <div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-300 leading-relaxed bg-black/25 select-text">
        {searchQuery ? (
          <pre 
            className="whitespace-pre overflow-x-auto text-left"
            dangerouslySetInnerHTML={{ __html: getCodeWithHighlights() }} 
          />
        ) : (
          <pre className="whitespace-pre overflow-x-auto text-left">
            <code>{code}</code>
          </pre>
        )}
      </div>

      {/* CONSOLE / FOOTER BAR */}
      <div className="px-6 py-3.5 bg-white/5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <span className="flex items-center">
          <Info size={11} className="mr-1.5 text-[#fcd116]" />
          NativeWind v4 supporté. Utilisez la directive "withWith" ou configurez babel.
        </span>
        <a 
          href="https://docs.expo.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white text-[#fcd116] flex items-center font-bold"
        >
          Docs Expo <ArrowUpRight size={10} className="ml-0.5" />
        </a>
      </div>

    </div>
  );
}
