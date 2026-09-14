import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface VoiceFloatingTriggerProps {
  onClick: () => void;
  isListening?: boolean;
}

export const VoiceFloatingTrigger: React.FC<VoiceFloatingTriggerProps> = ({
  onClick,
  isListening = false,
}) => {
  return (
    <aside
      aria-label="أمر صوتي"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 group select-none"
    >
      {/* تلميح أنيق يظهر عند التمرير أو في البداية */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-amber-500/30 backdrop-blur-xs opacity-90 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>أمر صوتي ذكي</span>
      </div>

      {/* الزر العائم الرئيسي */}
      <button
        type="button"
        id="voice-command-fab"
        onClick={onClick}
        aria-label="المساعد الصوتي بالذكاء الاصطناعي"
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl touch-manipulation cursor-pointer active:scale-95 ${
          isListening
            ? 'bg-amber-500 text-slate-950 shadow-amber-500/50 ring-4 ring-amber-300/60 animate-pulse'
            : 'bg-gradient-to-tr from-[#2a1d06] via-[#1a1204] to-amber-600 text-amber-300 hover:text-white hover:scale-105 border-2 border-amber-400/50 shadow-amber-950/40'
        }`}
        title="تحدث مع حكيم (Web Speech API) لإضافة السلع والبحث الصوتي"
      >
        {/* حلقة تموج ضوئية مستمرة للدلالة على توفر الميزة */}
        <span className="absolute -inset-1 rounded-full bg-amber-400/20 blur-xs group-hover:bg-amber-400/40 transition-all pointer-events-none" />

        <Mic className="w-6 h-6 relative z-10" />

        {/* وسام صغير */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-xs ring-2 ring-white">
          AI
        </span>
      </button>
    </aside>
  );
};
