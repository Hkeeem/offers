import React, { useState, useMemo, useEffect } from 'react';
import {
  CartItem,
  Product,
  Store,
  CartOptimizationResponse,
} from '../types.ts';
import {
  Plus,
  Minus,
  Trash2,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Truck,
  Tag,
  AlertCircle,
  Clock,
  HelpCircle,
  FileSpreadsheet,
  LineChart as ChartIcon,
  X,
  History,
  Leaf,
  Calendar,
} from 'lucide-react';
import { ProductPriceHistoryChart } from './ProductPriceHistoryChart.tsx';
import { ProductDetailModal } from './ProductDetailModal.tsx';
import { CartInflationTrendChart } from './CartInflationTrendChart.tsx';
import { ProjectedMonthEndSavingsCard } from './ProjectedMonthEndSavingsCard.tsx';
import { CartComparisonHistoryView } from './CartComparisonHistoryView.tsx';
import { calculateCartHistoricalAnalysis } from '../lib/cartHistoricalAnalysis.ts';
import { StoreRatingBadge } from './StoreRatingBadge.tsx';
import { StoreRatingModal } from './StoreRatingModal.tsx';
import { calculateStoreRatingMetrics } from '../lib/storeRatingEngine.ts';
import {
  getStoreScheduleInfo,
  getOptimalShoppingSlots,
  downloadLocalCalendarReminder,
} from '../lib/optimalShoppingTimeEngine.ts';

interface CartOptimizerViewProps {
  cart: CartItem[];
  products: Product[];
  stores: Store[];
  optimization: CartOptimizationResponse | null;
  isLoading: boolean;
  initialSubTab?: 'comparison' | 'split' | 'analysis' | 'ai' | 'history_compare';
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onLoadPreset: (presetType: 'family' | 'essentials' | 'ramadan') => void;
  onClearCart: () => void;
  onLoadSavedCartToCurrent?: (cartItems: CartItem[]) => void;
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
}

export const CartOptimizerView: React.FC<CartOptimizerViewProps> = ({
  cart,
  products,
  stores,
  optimization,
  isLoading,
  initialSubTab,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  onLoadPreset,
  onClearCart,
  onLoadSavedCartToCurrent,
  onSwapProductInCart,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'comparison' | 'split' | 'analysis' | 'ai' | 'history_compare'>(
    initialSubTab || 'split'
  );
  const [selectedStoreForRating, setSelectedStoreForRating] = useState<Store | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setSelectedSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const cartInflationAnalysis = useMemo(() => {
    return calculateCartHistoricalAnalysis(cart, products, stores);
  }, [cart, products, stores]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedChartProduct, setSelectedChartProduct] = useState<Product | null>(null);

  const getItemCheapestPrice = (product: Product) => {
    if (!product.prices) return null;
    const inStockPrices = Object.values(product.prices)
      .filter(p => p.inStock)
      .map(p => p.priceInclVat);
    return inStockPrices.length > 0 ? Math.min(...inStockPrices) : null;
  };

  const cartProducts = cart
    .map(item => {
      const prod = products.find(p => p.id === item.productId);
      return prod ? { ...prod, quantity: item.quantity } : null;
    })
    .filter(Boolean) as (Product & { quantity: number })[];

  const availableToAdd = products.filter(
    p =>
      !cart.some(c => c.productId === p.id) &&
      (p.nameAr.includes(productSearch) || p.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const bestSingle = optimization?.bestSingleStore;
  const smartSplit = optimization?.smartSplit;
  const splitSavesMore = smartSplit && bestSingle && smartSplit.grandTotal < bestSingle.grandTotal;
  const netSavings = smartSplit && bestSingle ? Math.max(0, bestSingle.grandTotal - smartSplit.grandTotal) : 0;

  return (
    <div className="space-y-6" id="cart-optimizer-container">
      {/* نافذة تفاصيل المنتج والبدائل الصحية وسجل الأسعار */}
      {selectedChartProduct && (
        <ProductDetailModal
          product={selectedChartProduct}
          products={products}
          stores={stores}
          cart={cart}
          onClose={() => setSelectedChartProduct(null)}
          onAddToCart={onAddToCart}
          onSwapProductInCart={onSwapProductInCart}
        />
      )}

      {/* بطاقة الترحيب والتحكم السريع */}
      <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur-xs text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              خوارزمية الذكاء الاصطناعي لمقارنة سلال المتاجر السعودية
            </div>
            <h2 className="text-2xl lg:text-3xl font-black leading-tight">
              محرك التحسين وتوزيع السلة الشرائية الذكي
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              يقوم النظام خوارزمياً بمقارنة أسعار مشترياتك عبر <strong className="text-white">بنده، العثيم، الدانوب، كارفور، وأمازون</strong>، مع حساب ضريبة القيمة المضافة 15%، واختبار ما إذا كان تقسيم السلة يوفر أكثر من رسوم التوصيل المجمعة.
            </p>
          </div>

          {/* نماذج سلال جاهزة للتجربة الفورية */}
          <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-700/50 flex flex-col gap-2.5 min-w-[280px]">
            <span className="text-xs font-bold text-emerald-200">سلال مشتريات سعودية سريعة للتجربة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                id="preset-family-btn"
                onClick={() => onLoadPreset('family')}
                className="text-xs bg-emerald-700/80 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold py-2.5 px-3.5 min-h-[42px] rounded-xl transition-all touch-manipulation active:scale-95 border border-emerald-500/30 flex items-center justify-center shadow-2xs"
              >
                👨‍👩‍👧‍👦 مقاضي عائلية شاملة
              </button>
              <button
                id="preset-essentials-btn"
                onClick={() => onLoadPreset('essentials')}
                className="text-xs bg-emerald-700/80 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold py-2.5 px-3.5 min-h-[42px] rounded-xl transition-all touch-manipulation active:scale-95 border border-emerald-500/30 flex items-center justify-center shadow-2xs"
              >
                🥛 الأساسيات اليومية
              </button>
            </div>
            {cart.length > 0 && (
              <button
                id="clear-cart-btn"
                onClick={onClearCart}
                className="text-xs text-rose-300 hover:text-rose-200 active:text-rose-100 font-bold text-right mt-1 inline-flex items-center gap-1.5 py-2 px-1 min-h-[36px] touch-manipulation active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> إفراغ السلة الحالية
              </button>
            )}
          </div>
        </div>
      </div>

      {/* لوحة النتائج العلوية الفائزة (Winner Recommendation Banner) */}
      {optimization && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="optimization-summary-cards">
          {/* كرت الخيار الأوفر */}
          <div className="md:col-span-2 bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    التوصية المثلى اقتصادياً
                  </span>
                  <span className="text-xs text-slate-500 font-medium">شامل الضريبة 15% والشحن</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {splitSavesMore
                    ? `توزيع السلة الذكي (وفر ${netSavings} ر.س إضافي)`
                    : `الشراء الموحد من ${bestSingle?.store.name}`}
                </h3>
                <p className="text-xs text-slate-600">
                  {splitSavesMore
                    ? `الخوارزمية وزعت السلع على المتاجر الأرخص وتجاوزت حدود الشحن المجاني بنجاح!`
                    : `شراء كل المقاضي من متجر واحد هو الأوفر لأن التوفير في الأسعار الفردية أقل من رسوم التوصيل الإضافية.`}
                </p>

                <div className="pt-1.5">
                  <button
                    id="view-cart-inflation-chart-btn"
                    onClick={() => setSelectedSubTab('analysis')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors border border-emerald-300/60"
                  >
                    <ChartIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>مقارنة تكلفة سلتك بالأسابيع الـ 3 الماضية (Recharts)</span>
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 text-center min-w-[170px]">
                <div className="text-xs text-emerald-800 font-bold">التكلفة الإجمالية للسلة</div>
                <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight mt-0.5">
                  {splitSavesMore ? smartSplit?.grandTotal : bestSingle?.grandTotal}{' '}
                  <span className="text-sm font-bold">ر.س</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  شاملة 15% ضريبة + التوصيل
                </div>
              </div>
            </div>
          </div>

          {/* كرت إحصائية الضريبة والتوفير */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">إجمالي الضريبة والتوفير</span>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">ضريبة القيمة المضافة 15%:</span>
                  <span className="font-bold font-mono text-slate-800">{smartSplit?.totalVat} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">وفورات الكوبونات المطبقة:</span>
                  <span className="font-bold font-mono text-emerald-600">
                    -{smartSplit?.totalCouponSavings} ر.س
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">رسوم التوصيل الصافية:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {smartSplit?.totalDeliveryFees === 0 ? (
                      <span className="text-emerald-600 font-bold">مجاني 🎉</span>
                    ) : (
                      `${smartSplit?.totalDeliveryFees} ر.س`
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>الحد الأدنى للشحن المجاني يُحتسب لكل متجر بشكل منفصل.</span>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي المقسم: قائمة مشتريات السلة + نتائج التحليل */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* العمود الأيمن: إدارة عناصر السلة وإضافة منتجات (5 أعمدة) */}
        <div className="lg:col-span-5 space-y-4" id="cart-management-column">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">محتويات قائمة المشتريات</h3>
                <span className="text-xs text-slate-500">({cartProducts.length} منتجات مضافة)</span>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                تعديل الكميات متاح
              </span>
            </div>

            {cartProducts.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="text-3xl mb-2">🛒</div>
                <p className="text-sm font-bold text-slate-700">سلتك فارغة حالياً</p>
                <p className="text-xs text-slate-500 mt-1">
                  اختر من المنتجات المقترحة بالأسفل أو اضغط على سلة المقاضي السريعة بالأعلى.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] sm:max-h-[380px] overflow-y-auto pr-1">
                {/* شريط توجيه البدائل الصحية الذكية للسلة */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-medium">
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>بدائل صحية لسلتك:</strong> يمكنك تجربة بدائل (سكر أقل 0% أو مكونات طبيعية) ومعرفة أثرها على إجمالي سعر السلة واستبدالها بنقرة واحدة.
                    </span>
                  </div>
                </div>

                {cartProducts.map(item => {
                  const cheapestPrice = getItemCheapestPrice(item);
                  const itemTotal = cheapestPrice ? (cheapestPrice * item.quantity).toFixed(2) : null;
                  const isSingle = item.quantity === 1;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-3 rounded-2xl sm:rounded-xl bg-slate-50/90 border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      {/* السطر العلوي: أيقونة المنتج، اسمه، وحدته، وسعره التقديري */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-3xl p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs shrink-0 flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10">
                            {item.imageUrl}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm sm:text-xs font-black text-slate-900 leading-snug">
                                {item.nameAr}
                              </h4>
                              <button
                                onClick={() => setSelectedChartProduct(item)}
                                id={`cart-chart-btn-${item.id}`}
                                className="p-1.5 rounded-lg text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 transition-colors touch-manipulation active:scale-90"
                                title="عرض تاريخ تغير الأسعار للشهر الحالي"
                                aria-label="عرض تاريخ تغير الأسعار للشهر الحالي"
                              >
                                <ChartIcon className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setSelectedChartProduct(item)}
                                id={`cart-healthy-btn-${item.id}`}
                                className="px-2 py-1 rounded-lg text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors touch-manipulation active:scale-95 cursor-pointer shadow-2xs"
                                title="اقتراح بدائل صحية لسلتك (سكر أقل / مكونات طبيعية أكثر) وتأثير السعر الكلي"
                                aria-label="اقتراح بدائل صحية لسلتك"
                              >
                                <Leaf className="w-3 h-3 text-emerald-600" />
                                <span>بدائل صحية</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>{item.unit}</span>
                              {cheapestPrice !== null && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[11px] text-slate-600">
                                    أوفر سعر: <strong className="text-emerald-700 font-mono font-bold">{cheapestPrice.toFixed(2)}</strong> ر.س
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* إجمالي الصنف على الشاشات الكبيرة */}
                        {itemTotal && (
                          <div className="hidden sm:block text-left shrink-0 pl-1">
                            <div className="text-[10px] text-slate-400 font-bold">المجموع</div>
                            <div className="font-mono font-black text-xs text-emerald-800">
                              {itemTotal} <span className="text-[10px]">ر.س</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* شريط التحكم بالكمية المطور والمخصص للمس على الموبايل (Touch-friendly) */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-3">
                        {/* إجمالي سعر الصنف على الموبايل */}
                        <div className="sm:hidden flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium">إجمالي الصنف:</span>
                          <span className="font-mono font-black text-sm text-emerald-800">
                            {itemTotal ? `${itemTotal} ر.س` : '—'}
                          </span>
                        </div>

                        {/* مجموعة أزرار التحكم بالكمية المحسنة للمس */}
                        <div className="flex items-center gap-2 mr-auto sm:mr-0 sm:w-full sm:justify-end">
                          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs">
                            {/* زر إنقاص الكمية - قياس 44×44px للمس السلس والمريح */}
                            <button
                              id={`qty-minus-${item.id}`}
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className={`w-11 h-11 sm:w-8 sm:h-8 min-w-[44px] sm:min-w-[32px] min-h-[44px] sm:min-h-[32px] rounded-lg flex items-center justify-center transition-all touch-manipulation active:scale-90 select-none ${
                                isSingle
                                  ? 'bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 border border-rose-200/80'
                                  : 'bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200/60 sm:border-0'
                              }`}
                              title={isSingle ? 'حذف المنتج من السلة' : 'إنقاص الكمية (-1)'}
                              aria-label={isSingle ? 'حذف المنتج من السلة' : 'إنقاص الكمية (-1)'}
                            >
                              {isSingle ? (
                                <Trash2 className="w-4 h-4 text-rose-600" />
                              ) : (
                                <Minus className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5]" />
                              )}
                            </button>

                            {/* مؤشر الكمية الواضح مع تمييز رقمي مريح وسهل القراءة */}
                            <div className="min-w-[44px] sm:min-w-[32px] px-2 text-center select-none">
                              <span className="font-black font-mono text-base sm:text-xs text-slate-900 block leading-tight">
                                {item.quantity}
                              </span>
                              <span className="text-[9px] text-slate-400 block leading-none font-bold sm:hidden">
                                عبوة
                              </span>
                            </div>

                            {/* زر زيادة الكمية - قياس 44×44px مريح للمس بالإبهام */}
                            <button
                              id={`qty-plus-${item.id}`}
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-11 h-11 sm:w-8 sm:h-8 min-w-[44px] sm:min-w-[32px] min-h-[44px] sm:min-h-[32px] rounded-lg flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-all touch-manipulation active:scale-90 select-none"
                              title="زيادة الكمية (+1)"
                              aria-label="زيادة الكمية (+1)"
                            >
                              <Plus className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* زر حذف الصنف المستقل مع هدف لمس 44×44px لمنع الضغط بالخطأ */}
                          <button
                            id={`remove-item-${item.id}`}
                            onClick={() => onRemoveItem(item.id)}
                            className="w-11 h-11 sm:w-8 sm:h-8 min-w-[44px] sm:min-w-[32px] min-h-[44px] sm:min-h-[32px] rounded-xl sm:rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-all touch-manipulation active:scale-90 border border-slate-200/50 sm:border-transparent"
                            title="حذف الصنف من السلة"
                            aria-label="حذف الصنف من السلة"
                          >
                            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* إضافة سلع أخرى للسلة */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm">إضافة سلع سعودية أخرى للسلة</h4>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">
                أسعار محدثة 🇸🇦
              </span>
            </div>

            <input
              type="text"
              placeholder="ابحث عن منتج (حليب، أرز، زيت، بيض...)"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 mb-3"
            />

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {availableToAdd.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{product.imageUrl}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{product.nameAr}</div>
                      <div className="text-[10px] text-slate-500">{product.unit}</div>
                    </div>
                  </div>
                  <button
                    id={`add-prod-${product.id}`}
                    onClick={() => onAddToCart(product.id)}
                    className="flex items-center justify-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 min-h-[44px] rounded-xl transition-all touch-manipulation active:scale-95 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* العمود الأيسر: عرض التحليل المقارن والذكاء الاصطناعي (7 أعمدة) */}
        <div className="lg:col-span-7 space-y-4" id="optimization-details-column">
          {/* التبويبات الفرعية للتحليل */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1.5">
            <button
              id="subtab-split"
              onClick={() => setSelectedSubTab('split')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedSubTab === 'split'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>السلة المقسمة الذكية</span>
            </button>

            <button
              id="subtab-comparison"
              onClick={() => setSelectedSubTab('comparison')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedSubTab === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ترتيب المتاجر الفردية</span>
            </button>

            <button
              id="subtab-analysis"
              onClick={() => setSelectedSubTab('analysis')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedSubTab === 'analysis'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChartIcon className="w-4 h-4 text-emerald-300" />
              <span>التحليل (مقارنة 3 أسابيع)</span>
            </button>

            <button
              id="subtab-ai"
              onClick={() => setSelectedSubTab('ai')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedSubTab === 'ai'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>توصيات Gemini AI</span>
            </button>
          </div>

          {/* تبويب 1: السلة المقسمة الذكية (Smart Split) */}
          {selectedSubTab === 'split' && smartSplit && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    توزيع السلع على المتاجر الأرخص
                  </h3>
                  <p className="text-xs text-slate-500">
                    تقوم الخوارزمية بفرز كل صنف لأفضل متجر سعراً مع دمج الكوبونات
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block font-bold">المجموع الإجمالي</span>
                  <span className="text-lg font-black text-emerald-700 font-mono">
                    {smartSplit.grandTotal} ر.س
                  </span>
                </div>
              </div>

              {/* بطاقات المتاجر الموزع عليها */}
              <div className="space-y-4">
                {smartSplit.storeAllocations.map(allocation => (
                  <div
                    key={allocation.store.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{allocation.store.logo}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900">{allocation.store.name}</h4>
                            <StoreRatingBadge
                              metrics={calculateStoreRatingMetrics(allocation.store.id, products)}
                              storeName={allocation.store.name}
                              onClick={() => setSelectedStoreForRating(allocation.store)}
                              size="xs"
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {allocation.items.length} أصناف مخصصة | التوصيل: {allocation.store.deliveryTime}
                          </span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {allocation.storeTotal} ر.س
                        </span>
                        <div className="text-[10px] text-slate-500">
                          شامل {allocation.vatAmount} ر.س ضريبة
                        </div>
                      </div>
                    </div>

                    {/* قائمة المنتجات المشتراة من هذا المتجر */}
                    <div className="space-y-2 mb-3">
                      {allocation.items.map(it => (
                        <div
                          key={it.product.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <span>{it.product.imageUrl}</span>
                            <span className="font-medium text-slate-800">{it.product.nameAr}</span>
                            <span className="text-slate-400 font-mono">×{it.quantity}</span>
                          </div>
                          <span className="font-bold text-slate-900 font-mono">
                            {it.totalItemPriceInclVat} ر.س
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* تفاصيل الشحن والكوبون */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          الشحن:
                          {allocation.deliveryFee === 0 ? (
                            <strong className="text-emerald-600">مجاني (تجاوز {allocation.store.freeDeliveryThreshold} ر.س)</strong>
                          ) : (
                            <strong className="text-slate-800">{allocation.deliveryFee} ر.س</strong>
                          )}
                        </span>

                        {allocation.appliedCoupon && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-sm">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            كوبون {allocation.appliedCoupon.code} (-{allocation.couponDiscount} ر.س)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تبويب 2: مقارنة سلة المتجر الواحد (Single Store Rankings) */}
          {selectedSubTab === 'comparison' && optimization && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  مقارنة تكلفة السلة الكاملة في كل متجر على حدة
                </h3>
                <p className="text-xs text-slate-500">
                  مرتبة من الأوفر للأعلى تكلفة شاملة ضريبة القيمة المضافة 15% وتوصيل الطلب
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {optimization.singleStoreEvaluations.map((evalItem, index) => (
                  <div
                    key={evalItem.store.id}
                    className={`rounded-xl p-4 border transition-all ${
                      evalItem.isCheapestSingleStore
                        ? 'bg-emerald-50/50 border-emerald-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            index === 0
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-2xl">{evalItem.store.logo}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{evalItem.store.name}</h4>
                            <StoreRatingBadge
                              metrics={calculateStoreRatingMetrics(evalItem.store.id, products)}
                              storeName={evalItem.store.name}
                              onClick={() => setSelectedStoreForRating(evalItem.store)}
                              size="xs"
                            />
                            {evalItem.isCheapestSingleStore && (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                الأوفر من متجر واحد
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {evalItem.missingItemsCount > 0 ? (
                              <span className="text-amber-600 font-bold">
                                تنبيه: {evalItem.missingItemsCount} أصناف غير متوفرة حالياً
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium">كل السلع متوفرة في المخزون</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="text-lg font-black text-slate-900 font-mono">
                          {evalItem.grandTotal} <span className="text-xs font-bold">ر.س</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {evalItem.deliveryFee === 0 ? 'شحن مجاني' : `+ ${evalItem.deliveryFee} ر.س شحن`}
                        </div>
                      </div>
                    </div>

                    {/* تفاصيل السعر والضريبة */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
                      <div>
                        المشتريات قبل الضريبة:{' '}
                        <span className="font-mono font-bold text-slate-800">
                          {evalItem.itemsSubtotalExclVat} ر.س
                        </span>{' '}
                        | الضريبة 15%:{' '}
                        <span className="font-mono font-bold text-slate-800">
                          {evalItem.vatAmount} ر.س
                        </span>
                      </div>
                      {evalItem.appliedCoupon && (
                        <span className="text-emerald-700 font-bold">
                          تم تطبيق {evalItem.appliedCoupon.code} (-{evalItem.couponDiscount} ر.س)
                        </span>
                      )}
                    </div>

                    {/* نصيحة وقت التسوق الأمثل وتذكير التقويم */}
                    {(() => {
                      const sched = getStoreScheduleInfo(evalItem.store.id);
                      const slots = getOptimalShoppingSlots(evalItem.store.id, 'الرياض');
                      const bestSlot = slots[0];
                      if (!sched) return null;
                      return (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-sky-50/70 rounded-lg px-3 py-1.5 border border-sky-100">
                          <div className="flex items-center gap-1.5 text-sky-950 font-medium">
                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>
                              <strong>أهدأ وقت للتسوق:</strong> {sched.quietHoursMorning} (ساعات الهدوء)
                            </span>
                          </div>
                          {bestSlot && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadLocalCalendarReminder(bestSlot, {
                                  customNotes: `تسوق سلة المشتريات من ${evalItem.store.name} - الإجمالي: ${evalItem.grandTotal} ر.س`,
                                  cartItemsCount: cart.length,
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-white hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                              title="حفظ تذكير في تقويم هاتفك أو جهازك المحلي"
                            >
                              <Calendar className="w-3 h-3 text-sky-600" />
                              <span>حفظ تذكير بالتقويم</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تبويب 3: التحليل ومقارنة إجمالي تكلفة السلة مقابل الأسابيع الثلاثة الماضية (Recharts) */}
          {selectedSubTab === 'analysis' && (
            cartInflationAnalysis ? (
              <div className="space-y-6">
                {/* بطاقة كمية التوفير المتوقع بنهاية الشهر بناءً على عادات الشراء مقارنة بمتوسط أسعار السوق */}
                <ProjectedMonthEndSavingsCard
                  analysis={cartInflationAnalysis}
                  cart={cart}
                  products={products}
                  stores={stores}
                />
                <CartInflationTrendChart analysis={cartInflationAnalysis} stores={stores} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">السلة فارغة حالياً</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  أضف منتجات إلى سلتك الشرائية لعرض تحليل مقارنة التكاليف خلال الأسابيع الثلاثة الماضية وتتبع التضخم والتوفير.
                </p>
              </div>
            )
          )}

          {/* تبويب 4: تحليلات وتوصيات الذكاء الاصطناعي (Gemini AI Insights) */}
          {selectedSubTab === 'ai' && optimization?.aiInsights && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    رؤى وتحليلات المستشار الذكي (Google Gemini)
                  </h3>
                  <p className="text-xs text-slate-500">
                    توصيات مخصصة لنمط التسوق السعودي وتوفير الميزانية الشهرية
                  </p>
                </div>
              </div>

              {/* ملخص الخطة */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  خطة التوفير المقترحة لسلتك:
                </h4>
                <p className="text-sm text-emerald-950 leading-relaxed font-medium">
                  {optimization.aiInsights.recommendationPlan}
                </p>
              </div>

              {/* بدائل التوفير الذكية (Substitutions) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  اقتراحات استبدال أو أحجام أوفر:
                </h4>
                <div className="space-y-2">
                  {optimization.aiInsights.substitutions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          استبدل: <span className="text-rose-700">{sub.currentProduct}</span> بـ{' '}
                          <span className="text-emerald-700 font-black">{sub.alternativeProduct}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{sub.reason}</div>
                      </div>
                      <div className="text-left shrink-0 font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
                        وفر ~{sub.potentialSavingsSar} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* نصيحة توقيت التسوق بالسعودية */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-900">توقيت التسوق المثالي في المملكة:</h5>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    {optimization.aiInsights.timingTip}
                  </p>
                </div>
              </div>

              {/* تأكيد ضريبة ZATCA */}
              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>{optimization.aiInsights.vatNotice}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* نافذة تفاصيل تقييم المتجر */}
      <StoreRatingModal
        store={selectedStoreForRating}
        products={products}
        isOpen={!!selectedStoreForRating}
        onClose={() => setSelectedStoreForRating(null)}
      />
    </div>
  );
};
