import React, { useState, useMemo } from 'react';
import { CartItem, Product, Store, CartInflationAnalysis, StorePriceInfo } from '../types.ts';
import {
  PiggyBank,
  Sparkles,
  TrendingDown,
  Calendar,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info,
  ArrowDownRight,
  ShoppingBag,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react';

interface ProjectedMonthEndSavingsCardProps {
  analysis: CartInflationAnalysis;
  cart: CartItem[];
  products: Product[];
  stores: Store[];
}

export const ProjectedMonthEndSavingsCard: React.FC<ProjectedMonthEndSavingsCardProps> = ({
  analysis,
  cart,
  products,
  stores,
}) => {
  // عادات الشراء: عدد مرات التسوق شهرياً (الافتراضي 4 مرات: تسوق أسبوعي عائلي)
  const [monthlyTrips, setMonthlyTrips] = useState<number>(4);
  const [habitPreset, setHabitPreset] = useState<'weekly' | 'biweekly' | 'monthly' | 'custom'>('weekly');

  const handlePresetChange = (preset: 'weekly' | 'biweekly' | 'monthly') => {
    setHabitPreset(preset);
    if (preset === 'weekly') setMonthlyTrips(4);
    if (preset === 'biweekly') setMonthlyTrips(2);
    if (preset === 'monthly') setMonthlyTrips(1);
  };

  // نقطة الأسبوع الحالي
  const currentPoint = useMemo(() => {
    return analysis.historicalPoints.find(p => p.weekKey === 'current') || analysis.historicalPoints[analysis.historicalPoints.length - 1];
  }, [analysis.historicalPoints]);

  // الحسابات المالية الدقيقة للسلة الواحدة
  const singleBasketSmartTotal = currentPoint.smartSplitTotal;
  const singleBasketMarketAvg = currentPoint.marketAvgTotal;
  const singleBasketHighest = currentPoint.highestStoreTotal;

  // الوفر في السلة الواحدة مقارنة بمتوسط السوق
  const singleBasketSavingVsMarket = Math.max(0, singleBasketMarketAvg - singleBasketSmartTotal);
  // الوفر في السلة الواحدة مقارنة بأعلى متجر
  const singleBasketSavingVsHighest = Math.max(0, singleBasketHighest - singleBasketSmartTotal);

  // التوفير المتوقع بنهاية الشهر (بناءً على عادات الشراء المختارة)
  const projectedMonthEndSaving = Number((singleBasketSavingVsMarket * monthlyTrips).toFixed(2));
  const projectedMonthEndSavingVsHighest = Number((singleBasketSavingVsHighest * monthlyTrips).toFixed(2));

  // إجمالي الإنفاق المتوقع بنهاية الشهر
  const projectedSmartSpending = Number((singleBasketSmartTotal * monthlyTrips).toFixed(2));
  const projectedMarketAvgSpending = Number((singleBasketMarketAvg * monthlyTrips).toFixed(2));
  const projectedHighestSpending = Number((singleBasketHighest * monthlyTrips).toFixed(2));

  // نسبة التوفير من إجمالي الميزانية
  const savingsRate = singleBasketMarketAvg > 0
    ? Number(((singleBasketSavingVsMarket / singleBasketMarketAvg) * 100).toFixed(1))
    : 0;

  // الوفر التراكمي السنوي المقدر
  const projectedYearlySaving = Number((projectedMonthEndSaving * 12).toFixed(2));

  // معادل القوة الشرائية في السوق السعودي
  const purchasingPowerEquivalent = useMemo(() => {
    if (projectedMonthEndSaving >= 600) {
      return {
        badge: 'وفر استثنائي فائق',
        text: 'يغطي قسط تأمين سيارة سنوي أو كسوة موسمية كاملة لعائلة أو اشتراك ألياف بصرية منزلي لمدة شهرين!',
        icon: '💎',
      };
    } else if (projectedMonthEndSaving >= 350) {
      return {
        badge: 'توفير عائلي ممتاز',
        text: 'يغطي تكلفة وقود سيارة لشهر كامل (بنزين 91) بالإضافة إلى تموين لحوم ودواجن طازجة لمدة أسبوعين.',
        icon: '🚗',
      };
    } else if (projectedMonthEndSaving >= 180) {
      return {
        badge: 'توفير ملموس في الفواتير',
        text: 'يغطي كامل فاتورة الكهرباء والمياه الشهرية لشقة سكنية بمتوسط 180 - 240 ريال سعودي.',
        icon: '⚡',
      };
    } else {
      return {
        badge: 'توفير مصاريف دورية',
        text: 'يغطي قيمة باقة بيانات جوال شهرية أو قهوة وتناول وجبات خفيفة أسبوعية.',
        icon: '☕',
      };
    }
  }, [projectedMonthEndSaving]);

  // استخراج أعلى السلع مساهمة في التوفير الشهري
  const topSavingItems = useMemo(() => {
    const validItems = cart
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        const storePrices = (Object.values(product.prices) as StorePriceInfo[])
          .filter(p => p && p.inStock)
          .map(p => p.priceInclVat);

        if (!storePrices.length) return null;

        const minPrice = Math.min(...storePrices);
        const avgPrice = storePrices.reduce((a, b) => a + b, 0) / storePrices.length;
        const savingPerItem = Math.max(0, avgPrice - minPrice) * item.quantity;
        const monthlySavingForItem = Number((savingPerItem * monthlyTrips).toFixed(2));

        return {
          product,
          quantity: item.quantity,
          minPrice,
          avgPrice,
          monthlySavingForItem,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null && entry.monthlySavingForItem > 0);

    // ترتيب تنازلي حسب الوفر الشهري
    return validItems
      .sort((a, b) => b.monthlySavingForItem - a.monthlySavingForItem)
      .slice(0, 3);
  }, [cart, products, monthlyTrips]);

  return (
    <div
      className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden"
      id="projected-savings-card"
    >
      {/* رأس البطاقة الترويجي الأنيق */}
      <div className="bg-gradient-to-l from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative overflow-hidden">
        {/* خلفية جمالية خفيفة */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                <PiggyBank className="w-3.5 h-3.5 text-emerald-300" />
                <span>كمية التوفير المتوقع بنهاية الشهر</span>
              </span>
              <span className="text-[11px] text-emerald-200/90 font-medium">
                مقارنة بمتوسط أسعار السوق وضريبة 15%
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              توفير شهري متوقع يبلغ{' '}
              <span className="text-amber-300 font-mono underline decoration-amber-300/60 decoration-wavy underline-offset-8">
                {projectedMonthEndSaving.toFixed(2)} ر.س
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              وفقاً لعادات الشراء المحددة وحجم سلتك الحالية، يؤدي الالتزام بالسلة المقسمة الذكية إلى توفير ما نسبته{' '}
              <strong className="text-white font-black">{savingsRate}%</strong> من ميزانية مقاضيك بنهاية هذا الشهر.
            </p>
          </div>

          {/* محدد عادات الشراء الشهري (Shopping Habits Selector) */}
          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-700/60 shrink-0 backdrop-blur-xs text-right space-y-2.5 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-200 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>عادات وتكرار التسوق:</span>
              </span>
              <span className="font-mono font-bold text-amber-300 text-xs">
                {monthlyTrips} {monthlyTrips === 1 ? 'مرة' : 'مرات'} / شهر
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5" id="shopping-frequency-presets">
              <button
                id="habit-preset-weekly"
                onClick={() => handlePresetChange('weekly')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  habitPreset === 'weekly' && monthlyTrips === 4
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80'
                }`}
              >
                أسبوعي (4)
              </button>
              <button
                id="habit-preset-biweekly"
                onClick={() => handlePresetChange('biweekly')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  habitPreset === 'biweekly' && monthlyTrips === 2
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80'
                }`}
              >
                كل أسبوعين (2)
              </button>
              <button
                id="habit-preset-monthly"
                onClick={() => handlePresetChange('monthly')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  habitPreset === 'monthly' && monthlyTrips === 1
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80'
                }`}
              >
                شهري (1)
              </button>
            </div>

            {/* شريط تعديل مخصص للرحلات */}
            <div className="pt-1 flex items-center gap-2">
              <input
                id="monthly-trips-slider"
                type="range"
                min="1"
                max="6"
                step="1"
                value={monthlyTrips}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMonthlyTrips(val);
                  setHabitPreset('custom');
                }}
                className="w-full h-1.5 bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-emerald-300 font-mono font-bold shrink-0">
                {monthlyTrips}×
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الداخلي: مقارنة الأرقام ومحطات الشهر */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* بطاقات مقارنة إجمالي الإنفاق بنهاية الشهر */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="projected-totals-comparison">
          {/* خيار السلة الذكية */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border-2 border-emerald-500/60 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>إنفاقك بالسلة الذكية</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                الأوفر بنهاية الشهر
              </span>
            </div>
            <div className="font-mono text-2xl font-black text-emerald-950">
              {projectedSmartSpending.toFixed(2)}{' '}
              <span className="text-xs font-bold text-emerald-800">ر.س</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              مجموع {monthlyTrips} سلات مشتريات بتوزيع السلع على المتاجر الأرخص
            </p>
          </div>

          {/* متوسط أسعار السوق */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">لو اشتريت بمتوسط السوق</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                المعتاد بالمملكة
              </span>
            </div>
            <div className="font-mono text-2xl font-black text-slate-800">
              {projectedMarketAvgSpending.toFixed(2)}{' '}
              <span className="text-xs font-bold text-slate-500">ر.س</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>الفارق عن السلة الذكية:</span>
              <strong className="text-emerald-700 font-mono font-bold">
                +{projectedMonthEndSaving.toFixed(2)} ر.س وفر
              </strong>
            </div>
          </div>

          {/* أعلى متجر (التسوق التقليدي العشوائي) */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800">لو اشتريت من متجر واحد أعلى</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                تسوق تقليدي
              </span>
            </div>
            <div className="font-mono text-2xl font-black text-rose-900">
              {projectedHighestSpending.toFixed(2)}{' '}
              <span className="text-xs font-bold text-rose-600">ر.س</span>
            </div>
            <div className="text-[11px] text-rose-700 mt-1 flex items-center gap-1">
              <span>تتجنب خسارة محتملة:</span>
              <strong className="text-rose-800 font-mono font-bold">
                +{projectedMonthEndSavingVsHighest.toFixed(2)} ر.س
              </strong>
            </div>
          </div>
        </div>

        {/* مراحل ومحطات تراكم التوفير خلال أسابيع الشهر (Month Milestones Progress) */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                مسار تراكم التوفير المتوقع عبر أسابيع الشهر
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              مقسم على {monthlyTrips} دورات تسوق منتظمة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* الأسبوع 1 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-right shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 mb-0.5">الأسبوع الأول</div>
              <div className="font-mono text-sm font-black text-slate-800">
                {(projectedMonthEndSaving * 0.25).toFixed(2)} <span className="text-[10px]">ر.س</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-1/4 rounded-full" />
              </div>
            </div>

            {/* الأسبوع 2 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-right shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 mb-0.5">منتصف الشهر (أسبوع 2)</div>
              <div className="font-mono text-sm font-black text-slate-800">
                {(projectedMonthEndSaving * 0.5).toFixed(2)} <span className="text-[10px]">ر.س</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-2/4 rounded-full" />
              </div>
            </div>

            {/* الأسبوع 3 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-right shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 mb-0.5">الأسبوع الثالث</div>
              <div className="font-mono text-sm font-black text-slate-800">
                {(projectedMonthEndSaving * 0.75).toFixed(2)} <span className="text-[10px]">ر.س</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-3/4 rounded-full" />
              </div>
            </div>

            {/* نهاية الشهر */}
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 text-right shadow-2xs">
              <div className="text-[11px] font-black text-emerald-900 mb-0.5 flex items-center justify-between">
                <span>نهاية الشهر 🎯</span>
                <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-sm font-bold">100%</span>
              </div>
              <div className="font-mono text-sm font-black text-emerald-800">
                {projectedMonthEndSaving.toFixed(2)} <span className="text-[10px]">ر.س</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* شبكة القوة الشرائية وأعلى السلع مساهمة بالتوفير */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* بطاقة القوة الشرائية السعودية المكافئة */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
            <span className="text-2xl p-2 bg-amber-100 rounded-xl shrink-0">
              {purchasingPowerEquivalent.icon}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900">
                  ماذا يمثل هذا التوفير في ميزانيتك؟
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {purchasingPowerEquivalent.badge}
                </span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                {purchasingPowerEquivalent.text}
              </p>
              <div className="pt-1 text-[11px] text-amber-800 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>على مدار السنة، قد يتجاوز وفرك التراكمي: {projectedYearlySaving.toFixed(2)} ر.س!</span>
              </div>
            </div>
          </div>

          {/* أعلى 3 أصناف في سلتك مساهمة في التوفير الشهري */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>أعلى أصناف سلتك صناعة للتوفير الشهري:</span>
              </span>
              <span className="text-[10px] text-slate-400">بحسب فارق المتجر الأرخص</span>
            </div>

            {topSavingItems.length > 0 ? (
              <div className="space-y-1.5">
                {topSavingItems.map(({ product, quantity, monthlySavingForItem }) => (
                  <div
                    key={product.id}
                    className="bg-white p-2 rounded-lg border border-slate-200/90 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{product.imageUrl}</span>
                      <div>
                        <span className="font-bold text-slate-800">{product.nameAr}</span>
                        <span className="text-[10px] text-slate-400 block">
                          الكمية: {quantity} {product.unit} في كل جولة
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="font-black text-emerald-700">
                        +{monthlySavingForItem.toFixed(2)} ر.س
                      </span>
                      <span className="text-[10px] text-slate-400 block font-sans">شهرياً</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                جميع الأسعار متقاربة أو السلة تحتوي على صنف واحد.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
