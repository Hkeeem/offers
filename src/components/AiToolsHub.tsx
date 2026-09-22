import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Brain, 
  Globe, 
  Zap, 
  Search, 
  Rocket, 
  Star, 
  ExternalLink, 
  Terminal,
  Github,
  Triangle,
  Bot,
  Cpu,
  Users,
  Play,
  Workflow
} from 'lucide-react';

// ==========================================
// 1. أدوات الذكاء الاصطناعي العالمية (أيقونات فقط)
// ==========================================
const globalAiTools = [
  {
    name: 'Alhkmy.app',
    url: 'https://alhkmy.app',
    color: 'from-amber-400 via-yellow-400 to-amber-500',
    icon: <Rocket className="w-10 h-10" />,
    isFeatured: true,
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: 'from-blue-500 to-purple-500',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    color: 'from-emerald-500 to-teal-500',
    icon: <MessageSquare className="w-8 h-8" />,
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: 'from-orange-500 to-amber-500',
    icon: <Brain className="w-8 h-8" />,
  },
  {
    name: 'Meta AI',
    url: 'https://www.meta.ai',
    color: 'from-blue-600 to-indigo-600',
    icon: <Globe className="w-8 h-8" />,
  },
  {
    name: 'Grok',
    url: 'https://grok.com',
    color: 'from-slate-700 to-slate-900',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    name: 'Genspark',
    url: 'https://www.genspark.ai',
    color: 'from-pink-500 to-rose-500',
    icon: <Search className="w-8 h-8" />,
  },
  {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    color: 'from-cyan-500 to-blue-500',
    icon: <Search className="w-8 h-8" />,
  },
  {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com',
    color: 'from-amber-500 to-orange-500',
    icon: <Terminal className="w-8 h-8" />,
  },
];

// ==========================================
// 2. قائمة المساهمين (بدون "حكيم AI")
// ==========================================
const contributors = [
  { name: 'Gemini', icon: <Sparkles className="w-5 h-5" />, color: 'text-blue-600' },
  { name: 'ChatGPT', icon: <MessageSquare className="w-5 h-5" />, color: 'text-emerald-600' },
  { name: 'Claude', icon: <Brain className="w-5 h-5" />, color: 'text-orange-600' },
  { name: 'Meta AI', icon: <Globe className="w-5 h-5" />, color: 'text-blue-700' },
  { name: 'Grok', icon: <Zap className="w-5 h-5" />, color: 'text-slate-700' },
  { name: 'Genspark', icon: <Search className="w-5 h-5" />, color: 'text-pink-600' },
  { name: 'Perplexity', icon: <Search className="w-5 h-5" />, color: 'text-cyan-600' },
  { name: 'Google AI Studio', icon: <Terminal className="w-5 h-5" />, color: 'text-amber-600' },
  { name: 'Manus', icon: <Cpu className="w-5 h-5" />, color: 'text-purple-600' },
  { name: 'GitHub', icon: <Github className="w-5 h-5" />, color: 'text-slate-800' },
  { name: 'Vercel', icon: <Triangle className="w-5 h-5" />, color: 'text-slate-900' },
  { name: 'المساعد الذكي', icon: <Workflow className="w-5 h-5" />, color: 'text-indigo-600' },
];

// ==========================================
// 3. المكون الرئيسي
// ==========================================
export default function AiToolsHub() {
  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-emerald-50/30 py-16 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* ============================================ */}
        {/* ========== القسم العلوي: فريق البناء ========= */}
        {/* ============================================ */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 shadow-2xl mb-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          {/* العنوان فقط بدون النص الطويل */}
          <div className="relative z-10 text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-6 py-2 rounded-full mb-4 shadow-lg">
              <Users className="w-5 h-5" />
              <span className="font-black">فريق البناء</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              شارك في بناء منصة حكيم AI العصرية
            </h2>
          </div>

          <div className="relative z-10 flex flex-wrap justify-center gap-3 md:gap-4">
            {contributors.map((contributor, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-md border-2 border-white/50 hover:border-amber-400 hover:shadow-xl hover:scale-105 transition-all"
              >
                <span className={contributor.color}>{contributor.icon}</span>
                <span className="font-bold text-slate-800 text-sm md:text-base">
                  {contributor.name}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-emerald-500/30 text-center">
            <p className="text-emerald-100 text-sm font-semibold">
              بإدارة <span className="text-amber-300 font-black">حكيم AI</span> ونائبه <span className="text-amber-300 font-black">Gemini</span>
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* ========== قسم أدوات الذكاء الاصطناعي ======== */}
        {/* ============================================ */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">مركز الأدوات الذكية</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              أدوات الذكاء الاصطناعي العالمية
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              اضغط على أي أيقونة للدخول إلى الأداة مباشرة
            </p>
          </div>

          {/* شبكة الأيقونات فقط */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {globalAiTools.map((tool, index) => (
              <a
                key={index}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                title={tool.name}
                className={`
                  group relative flex items-center justify-center p-8 rounded-2xl bg-white shadow-sm 
                  transition-all duration-300 transform hover:-translate-y-2 cursor-pointer
                  ${tool.isFeatured 
                    ? 'col-span-2 row-span-2 border-4 border-amber-400 shadow-xl shadow-amber-100 ring-4 ring-amber-200/50' 
                    : 'border-2 border-transparent hover:border-emerald-400 hover:shadow-xl'
                  }
                `}
              >
                {tool.isFeatured && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-current" />
                    <span>تطبيقنا</span>
                  </div>
                )}

                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* ========== القسم السفلي: إخراج وتنفيذ ======== */}
        {/* ============================================ */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-emerald-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-2 rounded-full mb-4">
              <Play className="w-5 h-5 fill-current" />
              <span className="font-bold">إخراج وتنفيذ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              المشاريع الجاهزة للاستخدام
            </h2>
            <p className="text-emerald-200 text-lg max-w-2xl mx-auto">
              يمكنك الوصول إلى المشاريع المنفذة مباشرة من الروابط التالية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <a
              href="https://alhkmy.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm border-2 border-amber-400/50 rounded-2xl p-6 hover:bg-white/20 hover:border-amber-400 transition-all transform hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg">
                  <Rocket className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">Alhkmy.app</h3>
                  <p className="text-emerald-200 text-sm">التطبيق الرئيسي</p>
                </div>
              </div>
              <p className="text-slate-200 text-sm mb-4 leading-relaxed">
                منصة حكيم AI الذكية - عروض، مقارنة أسعار، سيارات، عقارات، وأدوات ذكاء اصطناعي
              </p>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:gap-3 transition-all">
                <span>زيارة التطبيق</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            <a
              href="https://offers-e2jkt3k49-alhkmy11project.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm border-2 border-emerald-400/50 rounded-2xl p-6 hover:bg-white/20 hover:border-emerald-400 transition-all transform hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">مساعد حكيم</h3>
                  <p className="text-emerald-200 text-sm">المساعد الذكي</p>
                </div>
              </div>
              <p className="text-slate-200 text-sm mb-4 leading-relaxed">
                المساعد الذكي الخاص بمنصة حكيم AI - إجابات فورية عن أسعار السوق السعودي والعروض
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:gap-3 transition-all">
                <span>افتح المساعد</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
