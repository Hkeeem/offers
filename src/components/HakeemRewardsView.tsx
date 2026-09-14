import React from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  Gift,
  Target,
  Flame,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface HakeemRewardsViewProps {
  currentCartSavings: number;
  totalItemsInCart: number;
  onNavigateTab: (tab: 'cart' | 'matrix' | 'coupons' | 'chat') => void;
}

export const HakeemRewardsView: React.FC<HakeemRewardsViewProps> = ({
  currentCartSavings,
  totalItemsInCart,
  onNavigateTab,
}) => {
  // حساب الرصيد التراكمي ونقاط حكيم التقديرية
  const estimatedTotalSaved = Math.max(128.5, currentCartSavings + 75);
  const hakeemPoints = Math.round(estimatedTotalSaved * 10);

  const tiers = [
    {
      id: 'bronze',
      name: 'الوضع البرونزي',
      target: '0 - 100 ر.س',
      isReached: true,
      color: 'from-amber-700 to-amber-900',
      textColor: 'text-amber-700',
      badge: '🥉',
      desc: 'بداية مشوار التوفير الذكي مع حكيم AI',
    },
    {
      id: 'silver',
      name: 'المتسوق الفضي',
      target: '101 - 300 ر.س',
      isReached: estimatedTotalSaved >= 101,
      color: 'from-slate-400 to-slate-600',
      textColor: 'text-slate-600',
      badge: '🥈',
      desc: 'خبرة في صيد العروض الأسبوعية ومقارنة السلع',
    },
    {
      id: 'gold',
      name: 'حكيم التوفير الذهبي',
      target: '+300 ر.س',
      isReached: estimatedTotalSaved >= 300,
      color: 'from-yellow-400 to-amber-500',
      textColor: 'text-amber-500',
      badge: '👑',
      desc: 'القمة! وفرت مئات الريالات باستخدام السلال المقسمة والكوبونات',
    },
  ];

  const badges = [
    {
      id: 'b1',
      title: 'قارن أول سلة',
      desc: 'مقارنة الأسعار بين بنده والعثيم والدانوب',
      icon: '🛒',
      earned: true,
      date: 'اليوم',
    },
    {
      id: 'b2',
      title: 'خبير الكوبونات',
      desc: 'تصفح ونسخ كود خصم فعّال من رادار الكوبونات',
      icon: '🎟️',
      earned: true,
      date: 'نشط',
    },
    {
      id: 'b3',
      title: 'مستشار حكيم AI',
      desc: 'طرح استفسار ذكي عن مقاضي الشهر والبدائل الأوفر',
      icon: '🤖',
      earned: true,
      date: 'نشط',
    },
    {
      id: 'b4',
      title: 'صياد السلة المقسمة',
      desc: 'اختبار خوارزمية تقسيم السلة لتوفير التوصيل',
      icon: '⚡',
      earned: totalItemsInCart > 0,
      date: totalItemsInCart > 0 ? 'مكتمل' : 'قيد التقدم',
    },
    {
      id: 'b5',
      title: 'وفرت +100 ريال',
      desc: 'تحقيق وفر تراكمي يتجاوز 100 ر.س في ميزانيتك',
      icon: '💰',
      earned: estimatedTotalSaved >= 100,
      date: estimatedTotalSaved >= 100 ? 'مكتمل' : 'قيد التقدم',
    },
  ];

  return (
    <div className="space-y-6" id="hakeem-rewards-view">
      {/* البانر التفاعلي لجوائز ومستويات Hkeeem Rewards */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white rounded-3xl p-6 sm:p-10 border border-amber-400/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/30">
              <Trophy className="w-4 h-4 text-amber-200" />
              <span>نادي حكيم للتوفير والجوائز (Hkeeem Rewards) 🇸🇦</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black">
              وفرت حتى الآن: <span className="font-mono text-white underline decoration-amber-300">{estimatedTotalSaved.toFixed(2)}</span> ر.س
            </h2>

            <p className="text-amber-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              كل ريال توفره عبر مقارنة الأسعار، أكواد الخصم، وتقسيم السلة الذكي يمنحك نقاطاً ترفع مستواك في حكيم AI.
            </p>
          </div>

          <div className="bg-amber-950/60 backdrop-blur-md rounded-2xl p-5 border border-amber-400/30 text-center min-w-[200px] shrink-0">
            <div className="text-amber-300 text-xs font-bold mb-1">رصيد نقاط حكيم:</div>
            <div className="text-4xl font-black font-mono text-white">{hakeemPoints}</div>
            <div className="text-[11px] text-amber-200 mt-1">نقطة توفير نشطة ⭐</div>
          </div>
        </div>
      </div>

      {/* مستويات العضوية (البرونزي، الفضي، الذهبي) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={`p-5 rounded-2xl border transition-all ${
              t.isReached
                ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/30'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{t.badge}</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  t.isReached ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {t.isReached ? 'محقّق ✓' : 'المستوى القادم'}
              </span>
            </div>

            <h3 className="font-black text-slate-900 text-base">{t.name}</h3>
            <div className="text-xs font-bold text-slate-500 font-mono mt-0.5">{t.target}</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* شارات الإنجاز (Achievements Badges) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-base">شارات إنجازاتك في المنصة</h3>
          </div>
          <span className="text-xs text-slate-500">5 إنجازات رئيسية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                b.earned
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-2xl p-2 bg-white rounded-xl border border-slate-100 shadow-2xs shrink-0">
                {b.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">{b.title}</h4>
                  {b.earned && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{b.desc}</p>
                <div className="text-[10px] text-emerald-700 font-bold mt-1.5">{b.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نصائح حكيم الذهبية للتوفير في السعودية */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 rounded-2xl p-5 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-sm">نصيحة حكيم الأسبوعية للتوفير في المقاضي</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            شراء الأرز والزيوت ومساحيق الغسيل بأحجام عائلية كبيرة (10 كجم) يوفر ما بين 35% إلى 45% مقارنة بالعبوات الصغيرة شهرياً.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('chat')}
          className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 touch-manipulation shadow-xs"
        >
          اسأل حكيم AI الآن ←
        </button>
      </div>
    </div>
  );
};
