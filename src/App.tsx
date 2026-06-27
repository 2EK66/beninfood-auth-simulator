import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  Smartphone, 
  FileCode, 
  Cpu, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Utensils,
  Bike,
  Trash2,
  UserPlus,
  Coins,
  ShieldCheck,
  PlusCircle,
  Check,
  MapPin,
  Lock,
  Phone,
  ShieldAlert,
  Building2
} from "lucide-react";
import { CustomizationOptions, UserRole } from "./types";
import { 
  INITIAL_EXPO_CODE_BOTH, 
  INITIAL_EXPO_CODE_LOGIN, 
  INITIAL_EXPO_CODE_SIGNUP,
  INITIAL_EXPO_CODE_HOME,
  PRESET_THEMES 
} from "./data";
import PhoneSimulator, { bf_etablissements } from "./components/PhoneSimulator";
import ConfigurationPanel from "./components/ConfigurationPanel";
import CodeViewer from "./components/CodeViewer";

export default function App() {
  // 1. Core Customization Options
  const [options, setOptions] = useState<CustomizationOptions>({
    screenType: "both",
    themeColor: "bg-[#fcd116]",
    themeColorHex: "#fcd116",
    language: "Français (Bénin)",
    customInstructions: ""
  });

  // Shared state for Mobile Money reversement requests between phone simulator and back-office
  const [versementRequests, setVersementRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem("bf_versement_requests");
    return saved ? JSON.parse(saved) : [
      { id: "V-102", restaurantName: "Chez Maman Bénin", amount: 45000, status: "En cours...", date: "Aujourd'hui à 11:20", phone: "61000000", operator: "MTN MoMo" },
      { id: "V-101", restaurantName: "Chez Maman Bénin", amount: 30000, status: "Validé", date: "Hier à 21:45", phone: "61000000", operator: "Moov Flooz" },
      { id: "V-100", restaurantName: "Choukouya National", amount: 25000, status: "Validé", date: "24 Juin, 18:30", phone: "97123456", operator: "MTN MoMo" }
    ];
  });

  // Shared database of restaurants / maquis (bf_etablissements)
  const [etablissements, setEtablissements] = useState<any[]>(() => {
    const saved = localStorage.getItem("bf_etablissements");
    return saved ? JSON.parse(saved) : bf_etablissements;
  });

  // Shared database of users (for registration and admin validation of delivery drivers)
  const [usersDb, setUsersDb] = useState<{ [phone: string]: { name: string; role: UserRole } }>(() => {
    const saved = localStorage.getItem("bf_users_db");
    return saved ? JSON.parse(saved) : {
      "61000000": { name: "M. Sylvain Kodjo", role: "Gérant de Restaurant/Maquis" },
      "62000000": { name: "Mme. Sika Sessi", role: "Client" },
      "63000000": { name: "Léon le Rapide", role: "Livreur" },
    };
  });

  // Admin Panel states
  const [adminTab, setAdminTab] = useState<"restaurants" | "deliverers" | "finances" | "keystroke">("restaurants");
  
  // Create Restaurant states
  const [newRestName, setNewRestName] = useState("");
  const [newRestCategory, setNewRestCategory] = useState("Maquis 🇧🇯");
  const [newRestDesc, setNewRestDesc] = useState("");
  const [newRestImage, setNewRestImage] = useState("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60");

  // Create Deliverer states
  const [newDelName, setNewDelName] = useState("");
  const [newDelPhone, setNewDelPhone] = useState("");
  const [newDelPassword, setNewDelPassword] = useState("");

  // Keystroke dynamics simulated logs for security monitoring
  const [keystrokeLogs, setKeystrokeLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("bf_keystroke_logs");
    return saved ? JSON.parse(saved) : [
      { id: "K-501", user: "Léon le Rapide (Livreur)", dwellTime: "85ms (Normal)", flightTime: "112ms (Normal)", similarity: "98.4%", status: "Authentifié ✅", time: "Il y a 3 min" },
      { id: "K-500", user: "Inconnu (Tentative d'usurpation)", dwellTime: "142ms (Anormal)", flightTime: "245ms (Anormal)", similarity: "42.1%", status: "Bloqué (Alerte OTP) ⚠️", time: "Il y a 25 min" }
    ];
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem("bf_versement_requests", JSON.stringify(versementRequests));
  }, [versementRequests]);

  useEffect(() => {
    localStorage.setItem("bf_etablissements", JSON.stringify(etablissements));
  }, [etablissements]);

  useEffect(() => {
    localStorage.setItem("bf_users_db", JSON.stringify(usersDb));
  }, [usersDb]);

  useEffect(() => {
    localStorage.setItem("bf_keystroke_logs", JSON.stringify(keystrokeLogs));
  }, [keystrokeLogs]);

  // 2. State for the generated code
  const [generatedCode, setGeneratedCode] = useState<string>(INITIAL_EXPO_CODE_BOTH);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Will be verified on mount
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // 3. Keep initial code updated when screen type changes before any AI generation
  useEffect(() => {
    // Only update if the user hasn't run a custom AI generation yet, or if they reset
    if (!options.customInstructions) {
      if (options.screenType === "both") {
        setGeneratedCode(INITIAL_EXPO_CODE_BOTH);
      } else if (options.screenType === "login") {
        setGeneratedCode(INITIAL_EXPO_CODE_LOGIN);
      } else if (options.screenType === "signup") {
        setGeneratedCode(INITIAL_EXPO_CODE_SIGNUP);
      } else if (options.screenType === "home") {
        setGeneratedCode(INITIAL_EXPO_CODE_HOME);
      }
    }
  }, [options.screenType]);

  // Check if Gemini API key is available
  useEffect(() => {
    // Since we are running on our custom Express full-stack backend, we can query a simple health or key status
    // Or we can assume it's available, but let's do a fast validation check
    fetch("/api/generate-component", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkOnly: true })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error && data.error.includes("clé API")) {
        setHasApiKey(false);
      } else {
        setHasApiKey(true);
      }
    })
    .catch(() => {
      // Offline fallback
      setHasApiKey(false);
    });
  }, []);

  // 4. Function to call Gemini for Custom Code Generation
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setErrorBanner(null);

    try {
      const response = await fetch("/api/generate-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenType: options.screenType,
          themeColor: options.themeColorHex,
          language: options.language,
          customInstructions: options.customInstructions
        })
      });

      const data = await response.json();
      setIsGenerating(false);

      if (data.success && data.code) {
        setGeneratedCode(data.code);
      } else {
        setErrorBanner(data.error || "Échec de la génération de code avec l'IA.");
      }
    } catch (err: any) {
      setIsGenerating(false);
      setErrorBanner("Erreur réseau: Impossible de joindre le serveur de génération.");
    }
  };

  // 5. Function to simulate submitting from the phone
  const handleSimulateAuthSubmit = async (action: "login" | "register", data: any) => {
    const response = await fetch("/api/mock-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await response.json();
  };

  return (
    <div className="min-h-screen bg-[#004d31] flex flex-col text-white antialiased selection:bg-[#fcd116] selection:text-[#004d31] relative overflow-hidden">
      
      {/* 🇧🇯 Cultural Ribbon at the absolute top */}
      <div className="h-1.5 w-full flex relative z-50">
        <div className="bg-emerald-600 flex-1" />
        <div className="bg-[#fcd116] flex-1" />
        <div className="bg-red-600 flex-1" />
      </div>

      {/* Dynamic Background Glass Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#fcd116] rounded-full blur-[130px] opacity-15 pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[#e8112d] rounded-full blur-[150px] opacity-15 pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[60%] w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[120px] opacity-10 pointer-events-none z-0" />

      {/* TOP DESKTOP HEADER BAR */}
      <header className="bg-[#004d31]/40 backdrop-blur-md border-b border-white/10 px-6 py-4 md:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-50 shadow-lg text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#fcd116] rounded-xl flex items-center justify-center text-[#004d31] shadow-md shadow-[#fcd116]/20">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                BeninFood <span className="text-xs font-bold bg-[#fcd116]/10 text-[#fcd116] border border-[#fcd116]/20 px-2 py-0.5 rounded-full">Expo Studio</span>
              </h1>
            </div>
            <p className="text-[11px] text-white/50 font-semibold uppercase tracking-wider">
              Générateur d'Authentification Expo &amp; NativeWind (Tailwind)
            </p>
          </div>
        </div>

        {/* STATUS BAR WITH RECON / KEY INFO */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full">
            <Cpu size={13} className="text-[#fcd116] animate-pulse" />
            <span>Simulateur : </span>
            <span className="text-emerald-400">En ligne</span>
          </div>

          <div className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
            hasApiKey ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" : "bg-white/5 border border-white/10 text-white/50"
          }`}>
            <Sparkles size={13} className={hasApiKey ? "text-purple-400 animate-spin-slow" : "text-white/40"} />
            <span>Assistant IA : </span>
            <span className={hasApiKey ? "text-purple-300" : "text-white/60"}>
              {hasApiKey ? "Prêt (Gemini)" : "Standard (Presets)"}
            </span>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID CONTENT */}
      <main className="flex-1 px-4 py-8 md:px-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* LEFT COLUMN: CONTROL & CONFIGURATION (SPAN 4) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Quick Context Intro */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-xl">
            <h3 className="text-xs font-extrabold text-[#fcd116] uppercase tracking-widest mb-2">Instructions initiales</h3>
            <p className="text-xs text-white/85 leading-relaxed font-medium">
              Générez le code d'inscription et de connexion pour l'application béninoise <strong className="text-white">BeninFood</strong>. L'inscription comprend le Nom, le Téléphone, et un sélecteur stylisé pour les rôles : <strong>'Client'</strong>, <strong>'Gérant de Restaurant/Maquis'</strong> ou <strong>'Livreur'</strong>.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
              <div className="text-center p-2 bg-[#fcd116]/10 border border-[#fcd116]/20 rounded-2xl">
                <div className="text-[#fcd116] font-extrabold text-xs">Client</div>
                <div className="text-[9px] text-white/50 mt-0.5">Commande</div>
              </div>
              <div className="text-center p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="text-emerald-300 font-extrabold text-xs">Gérant</div>
                <div className="text-[9px] text-white/50 mt-0.5">Maquis</div>
              </div>
              <div className="text-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <div className="text-blue-300 font-extrabold text-xs">Livreur</div>
                <div className="text-[9px] text-white/50 mt-0.5">Motos (+229)</div>
              </div>
            </div>
          </div>

          <ConfigurationPanel 
            options={options}
            onChangeOptions={setOptions}
            onGenerate={handleGenerateCode}
            isGenerating={isGenerating}
            hasApiKey={hasApiKey}
          />

          {/* BACK-OFFICE ADMIN COMPLETE PANEL */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-[#fcd116]/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div>
                <span className="text-[9px] font-black text-[#fcd116] uppercase tracking-widest block">Double Écosystème BéninFood</span>
                <h3 className="text-xs font-black text-white flex items-center mt-0.5">
                  🖥️ Site d'Administration BéninFood
                </h3>
              </div>
              <span className="text-[8px] font-black bg-red-500/20 text-red-300 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                ADMIN SECURE • BENINFOOD
              </span>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed font-semibold">
              Pilotez l'écosystème en temps réel. Vos modifications (retrait de restaurants, création de livreurs) se répercutent instantanément sur le simulateur mobile.
            </p>

            {/* Admin Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-xl text-center text-[10px] font-extrabold text-white/60">
              <button
                type="button"
                onClick={() => setAdminTab("restaurants")}
                className={`py-2 rounded-lg cursor-pointer transition ${adminTab === "restaurants" ? "bg-[#fcd116] text-[#001f13]" : "hover:text-white"}`}
              >
                🏢 Restos
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("deliverers")}
                className={`py-2 rounded-lg cursor-pointer transition ${adminTab === "deliverers" ? "bg-[#fcd116] text-[#001f13]" : "hover:text-white"}`}
              >
                🏍️ Livreurs
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("finances")}
                className={`py-2 rounded-lg cursor-pointer transition ${adminTab === "finances" ? "bg-[#fcd116] text-[#001f13]" : "hover:text-white"}`}
              >
                💰 Finances
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("keystroke")}
                className={`py-2 rounded-lg cursor-pointer transition ${adminTab === "keystroke" ? "bg-[#fcd116] text-[#001f13]" : "hover:text-white"}`}
              >
                🔒 Sécurité
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="space-y-3 pt-1">
              
              {/* TAB 1: RESTAURANTS */}
              {adminTab === "restaurants" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block">
                      Maquis actifs ({etablissements.length})
                    </span>
                    <span className="text-[9px] text-[#fcd116] font-bold">Table: bf_etablissements</span>
                  </div>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {etablissements.map((etab) => (
                      <div key={etab.id} className="bg-black/30 border border-white/5 p-2.5 rounded-xl flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <img src={etab.image} alt={etab.name} className="w-8 h-8 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold text-xs text-white">{etab.name}</div>
                            <div className="text-[9px] text-white/50">{etab.category} • {etab.rating} ⭐</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Voulez-vous vraiment retirer le restaurant "${etab.name}" ? Il sera supprimé de la base de données BéninFood.`)) {
                              setEtablissements(prev => prev.filter(e => e.id !== etab.id));
                            }
                          }}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                          title="Retirer ce restaurant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {etablissements.length === 0 && (
                      <div className="text-center py-6 bg-white/5 rounded-xl text-white/40 text-[10px]">
                        ⚠️ Aucun restaurant enregistré. Utilisez le formulaire ci-dessous pour en ajouter.
                      </div>
                    )}
                  </div>

                  {/* Add Restaurant Form */}
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-2">
                    <span className="text-[9px] font-black text-[#fcd116] uppercase tracking-widest block">
                      ➕ Ajouter un Maquis / Restaurant
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nom du restaurant"
                        value={newRestName}
                        onChange={(e) => setNewRestName(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#fcd116]"
                      />
                      <select
                        value={newRestCategory}
                        onChange={(e) => setNewRestCategory(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#fcd116]"
                      >
                        <option value="Maquis 🇧🇯" className="bg-[#002A1A]">Maquis 🇧🇯</option>
                        <option value="Grillades/Choukouya" className="bg-[#002A1A]">Grillades/Choukouya</option>
                        <option value="Pâtisseries" className="bg-[#002A1A]">Pâtisseries</option>
                        <option value="Fast-Food" className="bg-[#002A1A]">Fast-Food</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Description des plats (ex: Atassi royal, poisson frit)"
                      value={newRestDesc}
                      onChange={(e) => setNewRestDesc(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#fcd116]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRestName.trim() || !newRestDesc.trim()) {
                          alert("Veuillez remplir le nom et la description du restaurant !");
                          return;
                        }
                        const newEtab = {
                          id: Date.now().toString(),
                          name: newRestName,
                          category: newRestCategory,
                          rating: 5.0,
                          image: newRestImage,
                          description: newRestDesc
                        };
                        setEtablissements(prev => [newEtab, ...prev]);
                        setNewRestName("");
                        setNewRestDesc("");
                        alert(`Le restaurant "${newRestName}" a été inséré avec succès dans la table bf_etablissements ! Vous pouvez le voir directement dans la liste d'établissements du simulateur.`);
                      }}
                      className="w-full bg-[#fcd116] hover:bg-[#e4be12] text-[#001f13] font-bold py-1.5 rounded-lg text-[10px] uppercase cursor-pointer transition flex items-center justify-center space-x-1"
                    >
                      <PlusCircle size={12} />
                      <span>Ajouter à la base de données</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DELIVERERS */}
              {adminTab === "deliverers" && (
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-[9px] text-red-200 leading-normal font-semibold flex items-start space-x-1.5">
                    <ShieldAlert size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
                    <span>
                      SÉCURITÉ : Les livreurs de BéninFood ne s'inscrivent pas eux-mêmes sur le mobile. Leurs comptes sont enregistrés exclusivement depuis ce back-office.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Add Deliverer Form */}
                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1.5">
                      <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-widest block">
                        👤 Créer un Compte Livreur
                      </span>
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Nom (ex: Sèna l'Express)"
                          value={newDelName}
                          onChange={(e) => setNewDelName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white focus:outline-none"
                        />
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px]">
                          <span className="text-white/40 font-bold mr-1">+229</span>
                          <input
                            type="text"
                            placeholder="Numéro béninois"
                            value={newDelPhone}
                            onChange={(e) => setNewDelPhone(e.target.value)}
                            className="bg-transparent flex-1 text-white focus:outline-none"
                          />
                        </div>
                        <input
                          type="password"
                          placeholder="Mot de passe"
                          value={newDelPassword}
                          onChange={(e) => setNewDelPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newDelName.trim() || !newDelPhone.trim() || !newDelPassword.trim()) {
                            alert("Veuillez remplir toutes les informations du livreur !");
                            return;
                          }
                          const sanitizedPhone = newDelPhone.replace(/\s+/g, "");
                          if (sanitizedPhone.length < 8) {
                            alert("Le numéro de téléphone béninois doit faire au moins 8 chiffres !");
                            return;
                          }
                          setUsersDb(prev => ({
                            ...prev,
                            [sanitizedPhone]: { name: newDelName, role: "Livreur" }
                          }));
                          setNewDelName("");
                          setNewDelPhone("");
                          setNewDelPassword("");
                          alert(`Compte Livreur "${newDelName}" créé avec succès ! Il peut se connecter à l'instant sur le Smartphone avec le numéro +229 ${sanitizedPhone} et son mot de passe !`);
                        }}
                        className="w-full bg-[#fcd116] hover:bg-[#e4be12] text-[#001f13] font-bold py-1 rounded-lg text-[8px] uppercase transition flex items-center justify-center space-x-1"
                      >
                        <UserPlus size={10} />
                        <span>Enregistrer le Livreur</span>
                      </button>
                    </div>

                    {/* Users list */}
                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest block mb-1">
                        📋 Comptes Système ({Object.keys(usersDb).length})
                      </span>
                      <div className="space-y-1 overflow-y-auto max-h-[115px] flex-1 pr-1">
                        {Object.entries(usersDb).map(([phone, user]: any) => (
                          <div key={phone} className="bg-black/20 p-1 rounded border border-white/5 flex flex-col">
                            <span className="font-extrabold text-[9px] text-white truncate">{user.name}</span>
                            <div className="flex justify-between items-center text-[7px] text-white/40 mt-0.5">
                              <span>+229 {phone}</span>
                              <span className={`px-1 py-0.2 rounded font-black uppercase text-[6px] ${
                                user.role === "Livreur" ? "bg-blue-500/20 text-blue-300" :
                                user.role === "Gérant de Restaurant/Maquis" ? "bg-emerald-500/20 text-emerald-300" : "bg-purple-500/20 text-purple-300"
                              }`}>{user.role.split(" ")[0]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCES */}
              {adminTab === "finances" && (
                <div className="space-y-3">
                  {/* Financial Stats */}
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-black/30 border border-white/5 p-1.5 rounded-xl">
                      <div className="text-[7px] font-bold text-white/50 uppercase">C.A. total</div>
                      <div className="text-[10px] font-black text-[#fcd116] mt-0.5">245 000 F</div>
                    </div>
                    <div className="bg-black/30 border border-white/5 p-1.5 rounded-xl">
                      <div className="text-[7px] font-bold text-white/50 uppercase">Restos (75%)</div>
                      <div className="text-[10px] font-black text-emerald-400 mt-0.5">183 750 F</div>
                    </div>
                    <div className="bg-black/30 border border-white/5 p-1.5 rounded-xl">
                      <div className="text-[7px] font-bold text-white/50 uppercase">Livreurs (15%)</div>
                      <div className="text-[10px] font-black text-blue-400 mt-0.5">36 750 F</div>
                    </div>
                    <div className="bg-black/30 border border-white/5 p-1.5 rounded-xl">
                      <div className="text-[7px] font-bold text-[#fcd116] uppercase">Com (10%)</div>
                      <div className="text-[10px] font-black text-amber-500 mt-0.5">24 500 F</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block">
                      Demandes de reversement MoMo en attente
                    </span>

                    {versementRequests.filter(r => r.status === "En cours...").length > 0 ? (
                      <div className="space-y-2">
                        {versementRequests.filter(r => r.status === "En cours...").map((req) => (
                          <div key={req.id} className="bg-black/40 border border-[#fcd116]/20 p-2.5 rounded-xl flex flex-col space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-extrabold text-xs text-white">{req.restaurantName}</div>
                                <div className="text-[9px] text-white/50 font-bold mt-0.5">Mobile : +229 {req.phone}</div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-[#fcd116] block">{req.amount.toLocaleString()} FCFA</span>
                                <span className="text-[8px] text-[#fcd116] font-bold uppercase">{req.operator}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                              <span className="text-[8px] text-amber-400 font-bold animate-pulse flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 animate-ping" />
                                <span>Demande de reversement</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setVersementRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Validé" } : r));
                                  alert(`Félicitations ! Le transfert Mobile Money de ${req.amount.toLocaleString()} FCFA a été exécuté avec succès vers le compte de ${req.restaurantName} via l'API KKiaPay !`);
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-0.5 px-2 rounded text-[8px] uppercase cursor-pointer transition"
                              >
                                ⚡ Valider le transfert
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-white/5 border border-dashed border-white/10 rounded-xl">
                        <p className="text-[10px] text-white/50 font-medium">✅ Aucun reversement en cours.</p>
                        <p className="text-[9px] text-white/30 mt-0.5 font-bold">Tous les comptes des Gérants sont équilibrés !</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY (KEYSTROKE) */}
              {adminTab === "keystroke" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold text-white/70">
                    <span className="flex items-center text-[#fcd116]">
                      <ShieldCheck size={14} className="mr-1 text-emerald-400" /> Biométrie Comportementale Active
                    </span>
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-1 py-0.2 rounded uppercase">
                      IA active
                    </span>
                  </div>

                  <p className="text-[10px] text-white/60 leading-relaxed font-semibold">
                    Analyse scientifique de la vitesse de frappe au clavier (Dwell Time & Flight Time) pour sécuriser l'accès et identifier les livreurs.
                  </p>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {keystrokeLogs.map((log) => (
                      <div key={log.id} className="bg-black/30 p-2 rounded-lg border border-white/5 space-y-1">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className="text-white">{log.user}</span>
                          <span className={log.status.includes("Bloqué") ? "text-red-400" : "text-emerald-400"}>{log.status}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[8px] text-white/40 font-mono">
                          <div>Appui: {log.dwellTime}</div>
                          <div>Vol: {log.flightTime}</div>
                          <div>Score: {log.similarity}</div>
                        </div>
                        <div className="text-[8px] text-white/30 text-right">{log.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Mini info section about NativeWind */}
          <div className="bg-white/5 backdrop-blur-md text-white/70 rounded-3xl p-5 border border-white/10 text-xs space-y-2.5 shadow-lg">
            <h4 className="font-extrabold text-white text-xs uppercase flex items-center">
              <FileCode size={13} className="mr-1.5 text-[#fcd116]" /> Guide d'intégration NativeWind
            </h4>
            <p className="leading-relaxed opacity-85">
              NativeWind traduit vos classes Tailwind utilitaires en feuilles de style React Native en temps réel.
            </p>
            <div className="bg-black/40 p-2.5 rounded-xl font-mono text-[10px] text-slate-300 border border-white/5">
              className="flex-row items-center p-4 rounded-2xl border-2"
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE PHONE SIMULATOR (SPAN 4) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center justify-center">
              <Smartphone size={12} className="mr-1 text-[#fcd116]" /> Smartphone Virtuel
            </span>
            <span className="text-[11px] text-white/70">Testez la saisie et les sélections ci-dessous</span>
          </div>

          {/* The Phone Simulator */}
          <PhoneSimulator 
            customization={options}
            onSimulateSubmit={handleSimulateAuthSubmit}
            versementRequests={versementRequests}
            setVersementRequests={setVersementRequests}
            usersDb={usersDb}
            setUsersDb={setUsersDb}
            etablissements={etablissements}
            setEtablissements={setEtablissements}
            keystrokeLogs={keystrokeLogs}
            setKeystrokeLogs={setKeystrokeLogs}
          />
        </div>

        {/* RIGHT COLUMN: CODE VIEWER (SPAN 4 ON WIDE, EXPANDED LAYOUT) */}
        <div className="lg:col-span-4 flex flex-col justify-stretch">
          <div className="text-center lg:text-left mb-4">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center justify-center lg:justify-start">
              <FileCode size={12} className="mr-1 text-[#fcd116]" /> Composant Expo généré
            </span>
            <span className="text-[11px] text-white/70">Copiez ou exportez directement vers votre projet</span>
          </div>

          {errorBanner && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-2.5 text-xs text-red-200">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Code Viewer Panel */}
          <div className="flex-1">
            <CodeViewer 
              code={generatedCode}
              screenType={options.screenType}
            />
          </div>
        </div>

      </main>

      {/* FOOTER METADATA */}
      <footer className="bg-[#004d31]/50 border-t border-white/10 py-6 text-center text-xs text-white/40 mt-12 backdrop-blur-sm relative z-10">
        <p className="font-semibold text-white/60">BeninFood Auth Simulator &copy; 2026</p>
        <p className="mt-1 leading-relaxed px-6 text-white/50">
          Conçu pour aider les développeurs béninois à prototyper rapidement leurs applications Expo (React Native) avec de magnifiques interfaces d'authentification.
        </p>
      </footer>

    </div>
  );
}
