import React from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Heart,
  Rocket,
  Award,
  Star
} from 'lucide-react';

// ==========================================
// 1. قائمة أدوات الذكاء الاصطناعي العالمية + تطبيقنا
// ==========================================
const globalAiTools = [
  {
    name: 'Alhkmy.app',
    description: 'تطبيقنا الخاص - حكيم AI',
    url: 'https://alhkmy.app',
    color: 'from-amber-400 via-yellow-400 to-amber-500',
    icon: '🇸🇦',
    isFeatured: true, // بطاقة مميزة
  },
  {
    name: 'Gemini',
    description: 'مساعد جوجل الذكي',
    url: 'https://gemini.google.com',
    color: 'from-blue-500 to-purple-500',
    icon: '✨',
  },
  {
    name: 'ChatGPT',
    description: 'مساعد OpenAI',
    url: 'https://chat.openai.com',
    color: 'from-emerald-500 to-teal-500',
    icon: '💬',
  },
  {
    name: 'Claude',
    description: 'مساعد Anthropic',
    url: 'https://claude.ai',
    color: 'from-orange-500 to-amber-500',
    icon: '🧠',
  },
  {
    name: 'Meta AI',
    description: 'مساعد ميتا الذكي',
    url: 'https://www.meta.ai',
    color: 'from-blue-600 to-indigo-600',
    icon: '🌐',
  },
  {
    name: 'Grok',
    description: 'مساعد xAI',
    url: 'https://grok.com',
    color: 'from-slate-700 to-slate-900',
    icon: '🚀',
  },
  {
    name: 'Genspark',
    description: 'محرك بحث ذكي',
    url: 'https://www.genspark.ai',
    color: 'from-pink-500 to-rose-500',
    icon: '🔍',
  },
  {
    name: 'Perplexity',
    description: 'بحث بالذكاء الاصطناعي',
    url: 'https://www.perplexity.ai',
    color: 'from-cyan-500 to-blue-500',
    icon: '🔎',
  },
  {
    name: 'Google AI Studio',
    description: 'استوديو بناء التطبيقات',
    url: 'https://aistudio.google.com',
    color: 'from-amber-500 to-orange-500',
    icon: '🛠️',
  },
];

// ==========================================
// 2. قائمة الجهات التي ساهمت في البناء
// ==========================================
const contributors = [
  { name: 'Google AI Studio', icon: '🛠️' },
  { name: 'Gemini', icon: '✨' },
  { name: 'ChatGPT', icon: '💬' },
  { name: 'Claude', icon: '🧠' },
  { name: 'Meta AI', icon: '🌐' },
  { name: 'Genspark', icon: '🔍' },
  { name: 'Grok', icon: '🚀' },
  { name: 'Vercel', icon: '▲' },
  { name: 'GitHub', icon: '🐙' },
];

// ==========================================
// 3. المكون الرئيسي
// ==========================================
export default function AiToolsHub() {
  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-emerald-50/30 py-16 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* ========== القسم 1: أدوات الذكاء الاصطناعي ========== */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">مركز الأدوات الذكية</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              🌐 أدوات الذكاء الاصطناعي العالمية
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              اختر أداتك المفضلة وابدأ الإبداع مباشرة — كل الأدوات في مكان واحد
            </p>
          </div>

          {/* شبكة البطاقات */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {globalAiTools.map((tool, index) => (
              <a
                key={index}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  group relative bg-white rounded-2xl p-6 shadow-sm 
                  transition-all duration-300 transform hover:-translate-y-2
                  ${tool.isFeatured 
                    ? 'border-2 border-amber-400 shadow-lg shadow-amber-100 ring-2 ring-amber-200/50' 
                    : 'border-2 border-transparent hover:border-emerald-400 hover:shadow-xl'
                  }
                `}
              >
                {/* شارة "تطبيقنا" للمميز */}
                {tool.isFeatured && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>تطبيقنا</span>
                  </div>
                )}

                {/* الأيقونة */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                
                {/* الاسم والوصف */}
                <h3 className={`font-bold text-lg mb-1 ${tool.isFeatured ? 'text-amber-700' : 'text-slate-900'}`}>
                  {tool.name}
                </h3>
                <p className="text-slate-500 text-sm mb-3">
                  {tool.description}
                </p>

                {/* زر الدخول */}
                <div className={`flex items-center gap-1 font-semibold text-sm group-hover:gap-2 transition-all ${tool.isFeatured ? 'text-amber-600' : 'text-emerald-600'}`}>
                  <span>افتح الأداة</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ========== القسم 2: شكر وتقدير ========== */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 rounded-3xl p-8 md:p-12 border-2 border-emerald-100 shadow-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-5 py-2 rounded-full mb-4">
              <Award className="w-5 h-5" />
              <span className="font-bold">شكر وتقدير</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">
              🤝 شكر وتقدير
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              تم إنجاز هذا التطبيق في فترة وجيزة بفضل الله ثم بمساعدة:
            </p>
          </div>

          {/* شبكة المساهمين */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
            {contributors.map((contributor, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all"
              >
                <span className="text-xl">{contributor.icon}</span>
                <span className="font-semibold text-slate-700 text-sm md:text-base">
                  {contributor.name}
                </span>
              </div>
            ))}
          </div>

          {/* تطبيقنا المميز */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-amber-600 transition-colors">
              <Heart className="w-5 h-5 fill-current" />
              <span>وتطبيقنا الخاص:</span>
              <a 
                href="https://alhkmy.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-white/90 transition-colors"
              >
                Alhkmy.app
              </a>
              <Rocket className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
