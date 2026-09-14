import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { CartInflationAnalysis, Store } from '../types.ts';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Coins,
} from 'lucide-react';

interface CartInflationTrendChartProps {
  analysis: CartInflationAnalysis;
  stores: Store[];
}

export const CartInflationTrendChart: React.FC<CartInflationTrendChartProps> = ({
  analysis,
  stores,
}) => {
  const [chartMode, setChartMode] = useState<'basket-evolution' | 'store-bars' | 'items-impact'>('basket-evolution');

  const storeColorMap: Record<string, string> = {
    panda: '#008752', // أخضر بنده
    othaim: '#e02b20', // أحمر العثيم
    danube: '#7b1c3e', // عنابي الدانوب
    carrefour: '#0c5da5', // أزرق كارفور
    amazon: '#ff9900', // برتقالي أمازون
    lulu: '#006837', // أخضر لولو
  };

  // مخصص التلميح لمخطط التطور الإجمالي
  const BasketEvolutionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = analysis.historicalPoints.find(p => p.shortLabel === label || p.label === label);
      return (
        <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-right min-w-[220px] dir-rtl">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-black text-xs text-emerald-400">{point?.label || label}</span>
            <span className="text-[10px] text-slate-400">ضريبة 15% مشمولة</span>
          </div>

          {point?.eventNote && (
            <div className="mb-2 px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{point.eventNote}</span>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-300 text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {Number(entry.value).toFixed(2)}{' '}
                  <span className="text-[10px] text-slate-400">ر.س</span>
                </span>
              </div>
            ))}
          </div>

          {point && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">وفر السلة الذكية عن المتوسط:</span>
              <strong className="text-emerald-400 font-mono font-bold">
                {(point.marketAvgTotal - point.smartSplitTotal).toFixed(2)} ر.س
              </strong>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // مخصص التلميح لمخطط الأعمدة بين المتاجر
  const StoresBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = analysis.historicalPoints.find(p => p.shortLabel === label);
      return (
        <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-right min-w-[210px] dir-rtl">
          <div className="border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-black text-xs text-emerald-400">{point?.label || label}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {payload.map((entry: any, idx: number) => {
              const storeObj = stores.find(s => s.id === entry.dataKey);
              return (
                <div key={idx} className="flex items-center justify-between gap-3">
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
                    {Number(entry.value).toFixed(2)}{' '}
                    <span className="text-[10px] text-slate-400">ر.س</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6" id="cart-inflation-chart-component">
      {/* البطاقة العلوية لمؤشر التضخم والتوفير */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          analysis.trend === 'saving'
            ? 'bg-emerald-50/70 border-emerald-300'
            : analysis.trend === 'inflation'
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-blue-50/70 border-blue-300'
        }`}
        id="inflation-trend-summary-banner"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1.5 ${
                  analysis.trend === 'saving'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : analysis.trend === 'inflation'
                    ? 'bg-rose-600 text-white border-rose-700'
                    : 'bg-blue-600 text-white border-blue-700'
                }`}
              >
                {analysis.trend === 'saving' ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>اتجاه توفير مستمر (Deflation / Promo Savings)</span>
                  </>
                ) : analysis.trend === 'inflation' ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>ضغوط تضخم طفيفة (Inflation)</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3.5 h-3.5" />
                    <span>استقرار أسعار متوازن (Stable)</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                تحليل السلة الحالية على مدار 3 أسابيع (22 أغسطس - 12 سبتمبر)
              </span>
            </div>

            <h3
              className={`text-base sm:text-lg font-black ${
                analysis.trend === 'saving'
                  ? 'text-emerald-950'
                  : analysis.trend === 'inflation'
                  ? 'text-rose-950'
                  : 'text-slate-900'
              }`}
            >
              {analysis.headline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              {analysis.explanation}
            </p>
          </div>

          {/* بطاقات المؤشرات الأربعة (KPIs) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 block">قبل 3 أسابيع</span>
              <span className="text-sm font-black font-mono text-slate-700">
                {analysis.threeWeeksAgoTotal.toFixed(2)}{' '}
                <span className="text-[10px] font-normal">ر.س</span>
              </span>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 block">الأسبوع الحالي</span>
              <span className="text-sm font-black font-mono text-emerald-700">
                {analysis.currentTotal.toFixed(2)}{' '}
                <span className="text-[10px] font-normal">ر.س</span>
              </span>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-center shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-500 block">نسبة التغير (3 أسابيع)</span>
              <div
                className={`text-sm font-black font-mono flex items-center justify-center gap-0.5 ${
                  analysis.netChangePercent <= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {analysis.netChangePercent <= 0 ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                <span>{Math.abs(analysis.netChangePercent)}%</span>
                <span className="text-[10px] font-normal">
                  ({analysis.netChangeSar <= 0 ? '-' : '+'}{Math.abs(analysis.netChangeSar)} ر.س)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار التبديل بين أوضاع الرسم البياني Recharts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-bold text-sm text-slate-900">
            تغير تكلفة السلة الحالية عبر الأسابيع الثلاثة الماضية
          </h4>
          <p className="text-[11px] text-slate-500">
            مبني على الأصناف والكميات المضافة حالياً في سلتك عبر كبرى سلاسل الهايبرماركت
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setChartMode('basket-evolution')}
            id="chart-mode-evolution"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartMode === 'basket-evolution'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>تطور إجمالي السلة</span>
          </button>
          <button
            onClick={() => setChartMode('store-bars')}
            id="chart-mode-stores"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartMode === 'store-bars'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>مقارنة المتاجر الستة</span>
          </button>
          <button
            onClick={() => setChartMode('items-impact')}
            id="chart-mode-items"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartMode === 'items-impact'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>تأثير السلع الفردية</span>
          </button>
        </div>
      </div>

      {/* مساحة الرسم البياني Recharts */}
      {chartMode === 'basket-evolution' && (
        <div className="space-y-3" id="basket-evolution-chart-container">
          <div className="h-[320px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analysis.historicalPoints}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSmartSplit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorMarketAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" ر.س"
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<BasketEvolutionTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '14px', fontSize: '11px', direction: 'rtl' }}
                />

                {/* خط أعلى متجر */}
                <Area
                  type="monotone"
                  dataKey="highestStoreTotal"
                  name="أعلى تكلفة متجر فردي"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={0}
                  dot={{ r: 3, fill: '#f43f5e' }}
                />

                {/* مساحة ومتوسط السوق */}
                <Area
                  type="monotone"
                  dataKey="marketAvgTotal"
                  name="متوسط تكلفة السوق العام"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#colorMarketAvg)"
                  dot={{ r: 4, fill: '#64748b' }}
                />

                {/* أوفر متجر منفرد */}
                <Line
                  type="monotone"
                  dataKey="cheapestStoreTotal"
                  name="أوفر متجر منفرد"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7' }}
                />

                {/* السلة المقسمة الذكية (الأوفر مطلقاً) */}
                <Area
                  type="monotone"
                  dataKey="smartSplitTotal"
                  name="السلة المقسمة الذكية (الأوفر دائماً)"
                  stroke="#059669"
                  strokeWidth={3.5}
                  fill="url(#colorSmartSplit)"
                  dot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            {analysis.historicalPoints.map(point => (
              <div
                key={point.weekKey}
                className={`p-3 rounded-xl border text-right text-xs transition-colors ${
                  point.weekKey === 'current'
                    ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{point.shortLabel}</span>
                  {point.weekKey === 'current' && (
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                      اليوم
                    </span>
                  )}
                </div>
                <div className="font-mono text-sm font-black text-emerald-800">
                  {point.smartSplitTotal.toFixed(2)} <span className="text-[10px]">ر.س</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate" title={point.eventNote}>
                  {point.eventNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartMode === 'store-bars' && (
        <div className="space-y-3" id="store-bars-chart-container">
          <div className="h-[320px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analysis.historicalPoints}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" ر.س"
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<StoresBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '14px', fontSize: '11px', direction: 'rtl' }}
                  formatter={(value: string) => {
                    const storeMap: Record<string, string> = {
                      pandaTotal: 'بنده',
                      othaimTotal: 'العثيم',
                      danubeTotal: 'الدانوب',
                      carrefourTotal: 'كارفور',
                      amazonTotal: 'أمازون',
                      luluTotal: 'لولو',
                    };
                    return storeMap[value] || value;
                  }}
                />

                <Bar dataKey="pandaTotal" name="pandaTotal" fill={storeColorMap.panda} radius={[4, 4, 0, 0]} />
                <Bar dataKey="othaimTotal" name="othaimTotal" fill={storeColorMap.othaim} radius={[4, 4, 0, 0]} />
                <Bar dataKey="danubeTotal" name="danubeTotal" fill={storeColorMap.danube} radius={[4, 4, 0, 0]} />
                <Bar dataKey="carrefourTotal" name="carrefourTotal" fill={storeColorMap.carrefour} radius={[4, 4, 0, 0]} />
                <Bar dataKey="amazonTotal" name="amazonTotal" fill={storeColorMap.amazon} radius={[4, 4, 0, 0]} />
                <Bar dataKey="luluTotal" name="luluTotal" fill={storeColorMap.lulu} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            توضح الأعمدة المجمعة كيف تغيرت تكلفة سلتك في كل متجر عبر الأسابيع الأربعة استجابةً للحملات والبروشورات الترويجية
          </p>
        </div>
      )}

      {chartMode === 'items-impact' && (
        <div className="space-y-3" id="items-impact-container">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs" id="inflation-item-changes-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                  <th className="py-3 px-4">الصنف والكمية بالسلة</th>
                  <th className="py-3 px-3 text-center">السعر قبل 3 أسابيع</th>
                  <th className="py-3 px-3 text-center">السعر الحالي (أوفر خيار)</th>
                  <th className="py-3 px-3 text-center">فارق التكلفة</th>
                  <th className="py-3 px-4">ملاحظة حركة السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.itemChanges.map(item => (
                  <tr key={item.productId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-slate-100 rounded-lg">{item.imageUrl}</span>
                        <div>
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-400">
                            الكمية: {item.quantity} × {item.unit}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                      {item.pastTotalPrice.toFixed(2)} ر.س
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ({item.pastUnitPrice.toFixed(2)} للوحدة)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {item.currentTotalPrice.toFixed(2)} ر.س
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ({item.currentUnitPrice.toFixed(2)} للوحدة)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          item.deltaPercent < 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.deltaPercent > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.deltaPercent < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : item.deltaPercent > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {item.deltaPercent < 0 ? '' : '+'}
                          {item.deltaPercent}% ({item.deltaSar < 0 ? '' : '+'}
                          {item.deltaSar.toFixed(2)} ر.س)
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* التذييل التوضيحي وضمانات ZATCA */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            يتم تحديث مقارنة الأسابيع دورياً بربط سجلات التخفيضات ومواعيد إصدار البروشورات الأسبوعية في المملكة.
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-700 font-bold shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>جميع الأسعار والتكاليف التاريخية شاملة ضريبة القيمة المضافة 15%</span>
        </div>
      </div>
    </div>
  );
};
