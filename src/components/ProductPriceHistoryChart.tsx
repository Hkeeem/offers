import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { Product, Store, PriceHistoryPoint } from '../types.ts';
import { generateMonthlyPriceHistory } from '../data/priceHistoryHelper.ts';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  Sparkles,
  ShoppingBag,
  Info,
  CheckCircle,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface ProductPriceHistoryChartProps {
  product: Product;
  stores: Store[];
  onAddToCart?: (productId: string) => void;
  isAlreadyInCart?: boolean;
}

export const ProductPriceHistoryChart: React.FC<ProductPriceHistoryChartProps> = ({
  product,
  stores,
  onAddToCart,
  isAlreadyInCart = false,
}) => {
  const [viewMode, setViewMode] = useState<'all-stores' | 'range' | 'lowest'>('all-stores');
  const [activeStoreFilters, setActiveStoreFilters] = useState<Record<string, boolean>>({
    panda: true,
    othaim: true,
    danube: true,
    carrefour: true,
    amazon: true,
    lulu: false,
  });

  // توليد بيانات تاريخ الأسعار خلال الشهر الحالي
  const historyData: PriceHistoryPoint[] = useMemo(() => {
    return product.priceHistory || generateMonthlyPriceHistory(product);
  }, [product]);

  // حساب التحليلات الإحصائية لمؤشرات اتخاذ القرار
  const stats = useMemo(() => {
    if (!historyData.length) return null;
    const startPoint = historyData[0];
    const currentPoint = historyData[historyData.length - 1];

    // أقل وأعلى سعر تاريخي في الشهر
    const allMonthlyPrices = historyData.flatMap(h => [
      h.panda,
      h.othaim,
      h.danube,
      h.carrefour,
      h.amazon,
      h.lulu,
    ]).filter((p): p is number => typeof p === 'number');

    const lowestEverMonth = Math.min(...allMonthlyPrices);
    const highestEverMonth = Math.max(...allMonthlyPrices);
    const currentLowest = currentPoint.lowestPrice;

    // نسبة التغير مقارنة ببداية الشهر
    const startLowest = startPoint.lowestPrice;
    const changePercentage = Number((((currentLowest - startLowest) / startLowest) * 100).toFixed(1));

    // تقييم توقيت الشراء (Buy Decision Signal)
    let decision: {
      type: 'buy-now' | 'wait' | 'fair';
      title: string;
      desc: string;
      color: string;
      bgColor: string;
      borderColor: string;
      badge: string;
    };

    // إذا كان السعر الحالي هو الأدنى أو قريب جداً من أدنى سعر شهري (ضمن 3%)
    if (currentLowest <= lowestEverMonth * 1.03) {
      decision = {
        type: 'buy-now',
        title: 'فرصة شراء ممتازة الآن! (أدنى سعر في سبتمبر)',
        desc: `السعر الحالي (${currentLowest.toFixed(2)} ر.س) وصل إلى القاع الشهري أو قريب جداً منه بفارق خصم كبير عن أعلى سعر سجل (${highestEverMonth.toFixed(2)} ر.س). ننصح بإضافته للسلة فوراً.`,
        color: 'text-emerald-800',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        badge: 'توقيت شراء ممتاز 🟢',
      };
    } else if (currentLowest >= highestEverMonth * 0.95) {
      decision = {
        type: 'wait',
        title: 'السعر مرتفع حالياً - قد يكون الانتظار أفضل',
        desc: `السلعة تباع حالياً بأسعار قريبة من ذروة الشهر (${highestEverMonth.toFixed(2)} ر.س). مع عروض بروشورات الأربعاء والخميس القادمة غالباً سينخفض السعر بما يقارب 10-15%.`,
        color: 'text-amber-800',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        badge: 'انتظر العروض 🟡',
      };
    } else {
      decision = {
        type: 'fair',
        title: 'سعر عادل ومتوسط خلال الشهر',
        desc: `السعر الحالي يتطابق مع المعدل المتوسط للشهر الحالي (${currentPoint.avgPrice.toFixed(2)} ر.س). يعتبر خياراً متوازناً للشراء إذا كانت السلعة من الاحتياجات الضرورية.`,
        color: 'text-blue-800',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        badge: 'سعر معتدل 🔵',
      };
    }

    return {
      currentLowest,
      lowestEverMonth,
      highestEverMonth,
      changePercentage,
      decision,
      currentAvg: currentPoint.avgPrice,
    };
  }, [historyData]);

  // خريطة ألوان المتاجر للمخطط
  const storeColorMap: Record<string, string> = {
    panda: '#008752', // أخضر بنده
    othaim: '#e02b20', // أحمر العثيم
    danube: '#7b1c3e', // عنابي الدانوب
    carrefour: '#0c5da5', // أزرق كارفور
    amazon: '#ff9900', // برتقالي أمازون
    lulu: '#006837', // أخضر لولو
  };

  const toggleStore = (storeId: string) => {
    setActiveStoreFilters(prev => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  // تخصيص صندوق التلميح (Tooltip)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = historyData.find(d => d.day === label);
      return (
        <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-right min-w-[200px] dir-rtl">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-black text-xs text-emerald-400">{label}</span>
            <span className="text-[10px] text-slate-400">شامل الضريبة 15%</span>
          </div>

          {point?.event && (
            <div className="mb-2 px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{point.event}</span>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            {payload.map((entry: any, index: number) => {
              const storeObj = stores.find(s => s.id === entry.dataKey);
              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 text-[11px]">
                      {storeObj ? storeObj.name : entry.name}:
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {Number(entry.value).toFixed(2)} <span className="text-[10px] text-slate-400">ر.س</span>
                  </span>
                </div>
              );
            })}
          </div>

          {point && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>أقل سعر: <strong className="text-emerald-400 font-mono">{point.lowestPrice.toFixed(2)}</strong></span>
              <span>المتوسط: <strong className="text-slate-200 font-mono">{point.avgPrice.toFixed(2)}</strong></span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5" id="product-price-history-card">
      {/* رأس المخطط: تفاصيل المنتج وبياناته */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="text-4xl p-2 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
            {product.imageUrl}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                {product.nameAr}
              </h3>
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                {product.category}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono text-[11px]">{product.unit}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                باركود: {product.barcode}
              </span>
            </div>
          </div>
        </div>

        {/* زر الإضافة السريعة للسلة */}
        {onAddToCart && (
          <button
            id={`chart-add-cart-${product.id}`}
            onClick={() => onAddToCart(product.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
              isAlreadyInCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isAlreadyInCart ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>موجود في السلة (+1)</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>إضافة إلى السلة الذكية</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* بطاقة تقييم قرار الشراء (Decision Intelligence Banner) */}
      {stats && (
        <div
          className={`p-4 rounded-xl border ${stats.decision.bgColor} ${stats.decision.borderColor} transition-all`}
          id="buy-decision-banner"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white shadow-xs border border-slate-200/60">
                  {stats.decision.badge}
                </span>
                <h4 className={`text-sm font-black ${stats.decision.color}`}>
                  {stats.decision.title}
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium pt-0.5">
                {stats.decision.desc}
              </p>
            </div>

            {/* إحصائيات سريعة للأسعار في سبتمبر */}
            <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200/60 shrink-0 text-center">
              <div className="px-2">
                <span className="text-[10px] text-slate-400 block font-bold">أدنى سعر بالشهر</span>
                <span className="text-sm font-black font-mono text-emerald-700">
                  {stats.lowestEverMonth.toFixed(2)} <span className="text-[9px]">ر.س</span>
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="px-2">
                <span className="text-[10px] text-slate-400 block font-bold">أعلى سعر بالشهر</span>
                <span className="text-sm font-black font-mono text-rose-600">
                  {stats.highestEverMonth.toFixed(2)} <span className="text-[9px]">ر.س</span>
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="px-2">
                <span className="text-[10px] text-slate-400 block font-bold">تغير الشهر</span>
                <span
                  className={`text-xs font-black font-mono flex items-center justify-center gap-0.5 ${
                    stats.changePercentage <= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {stats.changePercentage <= 0 ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(stats.changePercentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* أزرار أوضاع العرض وفلاتر المتاجر */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* تبديل وضع المخطط */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('all-stores')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'all-stores'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مقارنة خطوط المتاجر
          </button>
          <button
            onClick={() => setViewMode('range')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'range'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نطاق السعر (أدنى وأعلى)
          </button>
          <button
            onClick={() => setViewMode('lowest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'lowest'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مسار السعر الأوفر فقط
          </button>
        </div>

        {/* فلاتر إظهار وإخفاء المتاجر في وضع المقارنة */}
        {viewMode === 'all-stores' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] text-slate-400 font-bold shrink-0">إظهار:</span>
            {stores.map(store => {
              const isStoreActive = activeStoreFilters[store.id] ?? false;
              const storeColor = storeColorMap[store.id] || '#64748b';
              return (
                <button
                  key={store.id}
                  onClick={() => toggleStore(store.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                    isStoreActive
                      ? 'bg-slate-50 text-slate-900 border-slate-300 shadow-xs'
                      : 'bg-white text-slate-400 border-slate-200 opacity-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: storeColor }}
                  />
                  <span>{store.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* منطقة الرسم البياني باستخدام Recharts */}
      <div className="h-[300px] w-full pt-2" id="recharts-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'all-stores' ? (
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                unit=" ر.س"
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', direction: 'rtl' }}
                formatter={(value: string) => {
                  const s = stores.find(st => st.id === value);
                  return s ? s.name : value;
                }}
              />

              {/* خطوط المتاجر المختارة */}
              {activeStoreFilters.panda && (
                <Line
                  type="monotone"
                  dataKey="panda"
                  name="panda"
                  stroke={storeColorMap.panda}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeStoreFilters.othaim && (
                <Line
                  type="monotone"
                  dataKey="othaim"
                  name="othaim"
                  stroke={storeColorMap.othaim}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeStoreFilters.danube && (
                <Line
                  type="monotone"
                  dataKey="danube"
                  name="danube"
                  stroke={storeColorMap.danube}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeStoreFilters.carrefour && (
                <Line
                  type="monotone"
                  dataKey="carrefour"
                  name="carrefour"
                  stroke={storeColorMap.carrefour}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeStoreFilters.amazon && (
                <Line
                  type="monotone"
                  dataKey="amazon"
                  name="amazon"
                  stroke={storeColorMap.amazon}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeStoreFilters.lulu && (
                <Line
                  type="monotone"
                  dataKey="lulu"
                  name="lulu"
                  stroke={storeColorMap.lulu}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          ) : viewMode === 'range' ? (
            /* مخطط المساحة المظللة بين أعلى سعر وأدنى سعر */
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                unit=" ر.س"
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="highestPrice"
                name="أعلى سعر بالسوق"
                stroke="#e11d48"
                strokeWidth={2}
                fillOpacity={0}
                dot={{ r: 3, fill: '#e11d48' }}
              />
              <Area
                type="monotone"
                dataKey="avgPrice"
                name="متوسط السوق"
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="lowestPrice"
                name="أدنى سعر متاح"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#colorRange)"
                dot={{ r: 3.5, fill: '#059669' }}
              />
            </AreaChart>
          ) : (
            /* وضع السعر الأوفر فقط */
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                unit=" ر.س"
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={stats?.lowestEverMonth}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: `قاع الشهر: ${stats?.lowestEverMonth.toFixed(2)} ر.س`,
                  fill: '#059669',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Line
                type="monotone"
                dataKey="lowestPrice"
                name="أوفر سعر معروض"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* تذييل المخطط وملاحظات ZATCA */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>يتم تحديث سجل الأسعار أوتوماتيكياً كل 24 ساعة مع إطلاق بروشورات المتاجر الأسبوعية.</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-700 font-bold">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>تخضع الأسعار لضريبة القيمة المضافة 15% (ZATCA)</span>
        </div>
      </div>
    </div>
  );
};
