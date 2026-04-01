"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";

// ==================== TYPES ====================
interface RadarItem {
  title: string;
  highlight: string;
  description: string;
  whyItMatters: string;
  impact: number;
  status: "disponible" | "beta" | "próximamente";
  sourceUrl: string;
  sourceName: string;
}
interface PromptItem {
  title: string;
  category: string;
  prompt: string;
  explanation: string;
}
interface OpportunityItem {
  title: string;
  market: string;
  play: string;
  pricing: string;
}
interface StrategyItem {
  period: string;
  title: string;
  actions: string[];
}
interface BriefingData {
  radar: RadarItem[];
  prompts: PromptItem[];
  opportunities: OpportunityItem[];
  strategy: StrategyItem[];
}

// ==================== CONSTANTS ====================
const INDUSTRIES = [
  "Retail y Comercio",
  "Inmobiliaria y Construcción",
  "Legal y Abogados",
  "Salud y Clínicas",
  "Minería",
  "Finanzas y Banca",
  "Alimentos y Restaurantes",
  "Educación",
  "Servicios Profesionales",
  "Tecnología",
  "Manufactura",
  "Transporte y Logística",
  "Agricultura",
  "Energía",
  "Turismo y Hotelería",
];

const INTERESTS = [
  "Reducir costos operacionales",
  "Automatizar procesos repetitivos",
  "Mejorar ventas y conversión",
  "Crear contenido y marketing",
  "Analizar datos y tomar decisiones",
  "Atención al cliente con IA",
  "Gestión de equipos y productividad",
  "Cumplimiento legal y regulatorio",
  "Innovar productos/servicios",
  "Capacitación y entrenamiento",
];

// ==================== MAIN COMPONENT ====================
export default function Home() {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [activeTab, setActiveTab] = useState("radar");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const finalIndustry = customIndustry || industry;

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: { industry: finalIndustry, interests: selectedInterests },
    }),
    messages: [
      {
        id: "welcome",
        role: "assistant" as const,
        parts: [{ type: "text" as const, text: `Hola! Soy tu asistente de IA especializado en ${finalIndustry || "negocios"}. Pregúntame lo que quieras sobre cómo aplicar inteligencia artificial en tu empresa.` }],
      },
    ] as Array<{ id: string; role: "assistant" | "user"; parts: Array<{ type: "text"; text: string }> }>,
  });

  const chatLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    sendMessage({ text: chatInput });
    setChatInput("");
  };

  const fetchBriefing = async () => {
    setStep(3);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: finalIndustry, interests: selectedInterests }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBriefing(data);
      setStep(4);
    } catch {
      alert("Error generando el briefing. Intenta de nuevo.");
      setStep(2);
    }
  };

  const copyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
        ? [...prev, interest]
        : prev
    );
  };

  // ==================== RENDER: WELCOME ====================
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F0FDFA] flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#1B4D3E] mb-2">
              Para los JODA
            </h1>
            <p className="text-lg text-[#4A5568] mb-2">
              AI Briefing Pro
            </p>
            <p className="text-[#4A5568] leading-relaxed">
              Descubre qué puede hacer la inteligencia artificial por tu negocio <strong>hoy</strong>.
              No teoría, no hype — solo lo que funciona y está disponible ahora mismo.
            </p>
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full py-4 px-8 bg-[#0D9488] text-white rounded-xl font-semibold text-lg hover:bg-[#14B8A6] transition-all duration-300 hover:shadow-lg hover:shadow-[#0D9488]/20"
          >
            Empezar
          </button>
          <p className="text-sm text-[#4A5568] mt-4">
            2 minutos · 100% personalizado a tu industria
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER: INDUSTRY SELECT ====================
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-3 flex items-center gap-3">
            <button onClick={() => setStep(0)} className="text-[#0D9488] hover:text-[#1B4D3E] text-sm">← Volver</button>
            <div className="flex gap-2">
              <div className="w-8 h-1.5 rounded-full bg-[#0D9488]"></div>
              <div className="w-8 h-1.5 rounded-full bg-[#E2E8F0]"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#1B4D3E] mb-2">¿En qué sector trabajas?</h2>
          <p className="text-[#4A5568] mb-8">Selecciona tu industria para personalizar el briefing a tu realidad.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => { setIndustry(ind); setCustomIndustry(""); }}
                className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${
                  industry === ind && !customIndustry
                    ? "bg-[#F0FDFA] border-[#0D9488] text-[#1B4D3E]"
                    : "bg-white border-[#E2E8F0] text-[#4A5568] hover:border-[#14B8A6] hover:bg-[#F0FDFA]"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#4A5568] mb-2">¿Otro sector? Escríbelo:</label>
            <input
              type="text"
              value={customIndustry}
              onChange={(e) => { setCustomIndustry(e.target.value); setIndustry(""); }}
              placeholder="Ej: Ganadería, Farmacéutica, Medios..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] text-[#2D3748] placeholder-[#CBD5E0] focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488] transition-all"
            />
          </div>

          <button
            onClick={() => finalIndustry && setStep(2)}
            disabled={!finalIndustry}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              finalIndustry
                ? "bg-[#0D9488] text-white hover:bg-[#14B8A6] hover:shadow-lg"
                : "bg-[#E2E8F0] text-[#CBD5E0] cursor-not-allowed"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER: INTERESTS SELECT ====================
  if (step === 2) {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-3 flex items-center gap-3">
            <button onClick={() => setStep(1)} className="text-[#0D9488] hover:text-[#1B4D3E] text-sm">← Volver</button>
            <div className="flex gap-2">
              <div className="w-8 h-1.5 rounded-full bg-[#0D9488]"></div>
              <div className="w-8 h-1.5 rounded-full bg-[#0D9488]"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#1B4D3E] mb-2">¿Qué te interesa más?</h2>
          <p className="text-[#4A5568] mb-1">Elige hasta 5 temas para enfocar tu briefing de <strong>{finalIndustry}</strong>.</p>
          <p className="text-sm text-[#0D9488] mb-8">{selectedInterests.length}/5 seleccionados</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`p-4 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${
                  selectedInterests.includes(interest)
                    ? "bg-[#F0FDFA] border-[#0D9488] text-[#1B4D3E]"
                    : "bg-white border-[#E2E8F0] text-[#4A5568] hover:border-[#14B8A6] hover:bg-[#F0FDFA]"
                }`}
              >
                <span className="mr-2">{selectedInterests.includes(interest) ? "✓" : "○"}</span>
                {interest}
              </button>
            ))}
          </div>

          <button
            onClick={fetchBriefing}
            disabled={selectedInterests.length === 0}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedInterests.length > 0
                ? "bg-[#0D9488] text-white hover:bg-[#14B8A6] hover:shadow-lg"
                : "bg-[#E2E8F0] text-[#CBD5E0] cursor-not-allowed"
            }`}
          >
            Generar mi Briefing AI
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER: LOADING ====================
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <style>{`
          @keyframes jodaWave {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-18px) rotate(-3deg); }
            50% { transform: translateY(0px) rotate(0deg); }
            75% { transform: translateY(8px) rotate(2deg); }
          }
        `}</style>
        <div className="text-center">
          <div className="flex justify-center items-center gap-1 mb-6">
            {"JODA".split("").map((letter, i) => (
              <span
                key={i}
                className="text-[#0D9488] font-black"
                style={{
                  fontSize: "4rem",
                  display: "inline-block",
                  animation: "jodaWave 1.8s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                  textShadow: "0 4px 15px rgba(13, 148, 136, 0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-[#1B4D3E] mb-2">Generando tu briefing...</h2>
          <p className="text-[#4A5568]">
            Analizando avances de IA para <strong>{finalIndustry}</strong>
          </p>
          <p className="text-sm text-[#0D9488] mt-2">Esto toma unos 15-20 segundos</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER: BRIEFING ====================
  if (!briefing) return null;

  const TABS = [
    { id: "radar", label: "Radar AI", icon: "📡" },
    { id: "prompts", label: "Prompts", icon: "⚡" },
    { id: "opportunities", label: "Oportunidades", icon: "💰" },
    { id: "strategy", label: "Estrategia", icon: "🎯" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 bg-white/97 backdrop-blur-md border-b border-[#E2E8F0] z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Top row: logo + industry */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-[#1B4D3E] text-lg">AI Briefing Pro</span>
                <span className="text-xs text-[#0D9488] ml-2 px-2 py-0.5 bg-[#F0FDFA] rounded-full">{finalIndustry}</span>
              </div>
            </div>
            <button
              onClick={() => { setBriefing(null); setStep(0); }}
              className="text-sm text-[#4A5568] hover:text-[#0D9488] transition-colors"
            >
              Nuevo briefing
            </button>
          </div>
          {/* Bottom row: big tabs */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20"
                    : "bg-[#F7F7F8] text-[#4A5568] hover:bg-[#F0FDFA] hover:text-[#0D9488]"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="pt-32 pb-32 px-4 sm:px-6 max-w-6xl mx-auto">

        {/* ===== RADAR ===== */}
        {activeTab === "radar" && (
          <section>
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#1B4D3E] mb-1">RADAR AI</h1>
                <p className="text-[#4A5568]">Avances game-changer para <strong>{finalIndustry}</strong></p>
              </div>
              <span className="text-xs px-3 py-1.5 bg-[#F0FDFA] text-[#0D9488] rounded-lg border border-[#0D9488]">
                Actualizado: {new Date().toLocaleDateString("es-CL")}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {briefing.radar.map((item, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#14B8A6] hover:shadow-lg hover:shadow-[#0D9488]/5 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-[#1B4D3E] text-lg leading-tight flex-1">{item.title}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ml-3 whitespace-nowrap ${
                      item.status === "disponible" ? "bg-[#ECFDF5] text-[#059669]" :
                      item.status === "beta" ? "bg-[#EFF6FF] text-[#2563EB]" :
                      "bg-[#F5F3FF] text-[#7C3AED]"
                    }`}>{item.status === "disponible" ? "Disponible" : item.status === "beta" ? "Beta" : "Próximamente"}</span>
                  </div>
                  <div className="bg-[#F0FDFA] p-3 rounded-r-lg mb-3 text-sm text-[#1B4D3E]" style={{ borderLeftWidth: '3px', borderLeftColor: '#0D9488' }}>
                    {item.highlight}
                  </div>
                  <p className="text-[#2D3748] text-sm mb-3 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= item.impact ? "text-amber-400" : "text-[#E2E8F0]"}`}>★</span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-[#E2E8F0]">
                    <p className="text-sm text-[#4A5568]"><strong className="text-[#1B4D3E]">Por qué te importa:</strong> {item.whyItMatters}</p>
                  </div>
                  {item.sourceUrl && (
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#0D9488] bg-[#F0FDFA] border border-[#CCF0EB] px-3 py-1.5 rounded-md hover:bg-[#CCF0EB] hover:text-[#1B4D3E] transition-all">
                      🔗 {item.sourceName || "Fuente"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== PROMPTS ===== */}
        {activeTab === "prompts" && (
          <section>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1B4D3E] mb-1">TOP PROMPTS</h1>
              <p className="text-[#4A5568]">Los prompts más efectivos para <strong>{finalIndustry}</strong>. Copia, pega y adapta.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {briefing.prompts.map((item, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#14B8A6] hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-[#1B4D3E] text-lg mb-1">{item.title}</h3>
                  <span className="inline-block bg-[#F0FDFA] text-[#0D9488] text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">{item.category}</span>
                  <div className="bg-[#F7F7F8] p-4 rounded-r-lg mb-3 text-sm text-[#2D3748] leading-relaxed" style={{ borderLeftWidth: '3px', borderLeftColor: '#0D9488' }}>
                    {item.prompt}
                  </div>
                  <p className="text-sm text-[#4A5568] mb-4">{item.explanation}</p>
                  <button
                    onClick={() => copyPrompt(item.prompt, i)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      copiedIndex === i
                        ? "bg-[#ECFDF5] text-[#059669] border border-[#059669]"
                        : "bg-[#F0FDFA] text-[#0D9488] border border-[#0D9488] hover:bg-[#0D9488] hover:text-white"
                    }`}
                  >
                    {copiedIndex === i ? "✓ Copiado" : "Copiar prompt"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== OPPORTUNITIES ===== */}
        {activeTab === "opportunities" && (
          <section>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1B4D3E] mb-1">OPORTUNIDADES</h1>
              <p className="text-[#4A5568]">Dónde está el dinero en <strong>{finalIndustry}</strong> con IA en Chile</p>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {briefing.opportunities.map((item, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#14B8A6] hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-[#1B4D3E] text-xl mb-4">{item.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#0D9488] uppercase mb-1">El mercado</p>
                      <p className="text-sm text-[#2D3748] leading-relaxed">{item.market}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0D9488] uppercase mb-1">Tu jugada</p>
                      <p className="text-sm text-[#2D3748] leading-relaxed">{item.play}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0D9488] uppercase mb-1">Modelo de pricing</p>
                      <p className="text-sm text-[#2D3748] leading-relaxed">{item.pricing}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== STRATEGY ===== */}
        {activeTab === "strategy" && (
          <section>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1B4D3E] mb-1">ESTRATEGIA 90 DÍAS</h1>
              <p className="text-[#4A5568]">Plan de acción para implementar IA en <strong>{finalIndustry}</strong></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {briefing.strategy.map((item, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#14B8A6] hover:shadow-lg transition-all duration-300">
                  <div className="font-bold text-2xl mb-1" style={{ backgroundImage: 'linear-gradient(135deg, #1B4D3E, #0D9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {item.period}
                  </div>
                  <h3 className="font-bold text-[#1B4D3E] text-lg mb-4">{item.title}</h3>
                  <ul className="space-y-3">
                    {item.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[#2D3748] leading-relaxed">
                        <span className="text-[#0D9488] font-bold mt-0.5">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ===== FLOATING CHAT ===== */}
      {!chatOpen && (
        <>
          <style>{`
            @keyframes chatPulse {
              0%, 100% { box-shadow: 0 0 15px rgba(234, 88, 12, 0.5), 0 0 30px rgba(234, 88, 12, 0.3), 0 10px 25px rgba(234, 88, 12, 0.4); }
              50% { box-shadow: 0 0 25px rgba(234, 88, 12, 0.7), 0 0 50px rgba(234, 88, 12, 0.4), 0 10px 35px rgba(234, 88, 12, 0.5); }
            }
          `}</style>
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-[#EA580C] text-white rounded-full hover:bg-[#F97316] hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
            style={{ animation: "chatPulse 2s ease-in-out infinite" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </>
      )}

      {chatOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-[70vh] sm:h-[550px] bg-white border border-[#E2E8F0] sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F0FDFA]">
            <div>
              <h3 className="font-bold text-[#1B4D3E] text-sm">Chat con IA</h3>
              <p className="text-xs text-[#0D9488]">Pregunta lo que quieras sobre IA + {finalIndustry}</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center text-[#4A5568] transition-all">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const text = m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") || "";
              return (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#0D9488] text-white rounded-br-md"
                      : "bg-[#F7F7F8] text-[#2D3748] rounded-bl-md border border-[#E2E8F0]"
                  }`}>
                    {text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F7F7F8] border border-[#E2E8F0] px-4 py-3 rounded-2xl rounded-bl-md">
                  <style>{`
                    @keyframes jodaWaveSmall {
                      0%, 100% { transform: translateY(0px) rotate(0deg); }
                      25% { transform: translateY(-6px) rotate(-2deg); }
                      50% { transform: translateY(0px) rotate(0deg); }
                      75% { transform: translateY(3px) rotate(1deg); }
                    }
                  `}</style>
                  <div className="flex gap-0.5 items-center">
                    {"JODA".split("").map((letter, i) => (
                      <span
                        key={i}
                        className="text-[#0D9488] font-black text-sm"
                        style={{
                          display: "inline-block",
                          animation: "jodaWaveSmall 1.8s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-[#E2E8F0] flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pregunta sobre IA para tu negocio..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#2D3748] placeholder-[#CBD5E0] focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-4 py-3 bg-[#0D9488] text-white rounded-xl font-semibold text-sm hover:bg-[#14B8A6] transition-all disabled:bg-[#E2E8F0] disabled:text-[#CBD5E0]"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center py-8 border-t border-[#E2E8F0] text-sm text-[#4A5568]">
        <p>AI Briefing Pro — Generado con IA el {new Date().toLocaleDateString("es-CL")}</p>
        <p className="text-xs mt-1 text-[#CBD5E0]">Palette: Coolors.co/1b4d3e-0d9488-14b8a6-5eead4-f7f7f8</p>
      </footer>
    </div>
  );
}
