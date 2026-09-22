import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Brain, 
  Globe, 
  Zap, 
  Search, 
  Terminal,
  Github,
  Triangle,
  Bot,
  Cpu,
  Users
} from 'lucide-react';

const contributors = [
  { name: 'حكيم AI', icon: <Bot className="w-4 h-4" />, color: 'text-emerald-700' },
  { name: 'Gemini', icon: <Sparkles className="w-4 h-4" />, color: 'text-blue-700' },
  { name: 'ChatGPT', icon: <MessageSquare className="w-4 h-4" />, color: 'text-emerald-700' },
  { name: 'Claude', icon: <Brain className="w-4 h-4" />, color: 'text-orange-700' },
  { name: 'Meta AI', icon: <Globe className="w-4 h-4" />, color: 'text-blue-800' },
  { name: 'Grok', icon: <Zap className="w-4 h-4" />, color: 'text-slate-800' },
  { name: 'Genspark', icon: <Search className="w-4 h-4" />, color: 'text-pink-700' },
  { name: 'Perplexity', icon: <Search className="w-4 h-4" />, color: 'text-cyan-700' },
  { name: 'Google AI Studio', icon: <Terminal className="w-4 h-4" />, color: 'text-amber-700' },
  { name: 'Manus', icon: <Cpu className="w-4 h-4" />, color: 'text-purple-700' },
  { name: 'GitHub', icon: <Github className="w-4 h-4" />, color: 'text-slate-900' },
  { name: 'Vercel', icon: <Triangle className="w-4 h-4" />, color: 'text-slate-900' },
  { name: 'المساعد الذكي', icon: <Bot className="w-4 h-4" />, color: 'text-indigo-700' },
];

export default function BuildTeamBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 py-6 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* العنوان */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg leading-tight">
                شارك في بناء منصة حكيم AI العصرية
              </h3>
              <p className="text-emerald-100 text-xs">
                بإدارة حكيم AI ونائبه Gemini — في فترة وجيزة
              </p>
            </div>
          </div>
        </div>

        {/* قائمة المساهمين */}
        <div className="flex flex-wrap justify-center gap-2">
          {contributors.map((contributor, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/40 hover:border-amber-400 hover:shadow-md transition-all"
            >
              <span className={contributor.color}>{contributor.icon}</span>
              <span className="font-bold text-slate-800 text-xs">
                {contributor.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
