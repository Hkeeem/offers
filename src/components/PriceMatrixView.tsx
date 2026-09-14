import React, { useState, useMemo } from 'react';
import { Product, Store, CartItem } from '../types.ts';
import {
  Search,
  Plus,
  Minus,
  Check,
  CheckSquare,
  Square,
  ArrowUpDown,
  Filter,
  Sparkles,
  LineChart as ChartIcon,
  X,
  ShoppingBag,
  Store as StoreIcon,
  Award,
  AlertCircle,
  Truck,
  ArrowRight,
  TrendingDown,
  Layers,
  HelpCircle,
  RotateCcw,
  Leaf,
  Star,
} from 'lucide-react';
import { ProductPriceHistoryChart } from './ProductPriceHistoryChart.tsx';
import { ProductDetailModal } from './ProductDetailModal.tsx';
import { StoreRatingBadge } from './StoreRatingBadge.tsx';
import { StoreRatingModal } from './StoreRatingModal.tsx';
import { calculateStoreRatingMetrics } from '../lib/storeRatingEngine.ts';

interface PriceMatrixViewProps {
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  onAddToCart: (productId: string, quantity?: number) => void;
  onUpdateQuantity?: (productId: string, delta: number) => void;
  onRemoveItem?: (productId: string) => void;
  onLoadPreset?: (preset: 'family' | 'essentials' | 'ramadan') => void;
  onNavigateTab?: (tab: any) => void;
  cartProductIds: string[];
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
}

export const PriceMatrixView: React.FC<PriceMatrixViewProps> = ({
  products,
  stores,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onLoadPreset,
  onNavigateTab,
  cartProductIds,
  onSwapProductInCart,
}) => {
  // وضع العرض: التركيز على مصفوفة سعر السلة الكلي فقط للمنتجات المختارة أو استعراض السلع المفردة
  const [viewMode, setViewMode] = useState<'cart_total_matrix' | 'single_products_matrix'>('cart_total_matrix');

  // مجموعة معرفات المنتجات المختارة من السلة للمقارنة (افتراضياً كافة منتجات السلة محددة)
  const [selectedCartProductIds, setSelectedCartProductIds] = useState<string[]>(() =>
    cart.map(c => c.productId)
  );

  // تحديث التحديد عند تغير عناصر السلة إن لم تكن محددة
  const cartIds = useMemo(() => cart.map(c => c.productId), [cart]);

  // مزامنة حالة التحديد مع السلة
  const effectiveSelectedIds = useMemo(() => {
    // إذا كانت هناك عناصر محددة ضمن السلة الحالية
    const validSelected = selectedCartProductIds.filter(id => cartIds.includes(id));
    // لو لم يتم تحديد أي عنصر مسبقاً، حدد الكل افتراضياً
    if (validSelected.length === 0 && cartIds.length > 0) {
      return cartIds;
    }
    return validSelected;
  }, [selectedCartProductIds, cartIds]);

  // إمكانية تبديل تحديد منتج معين
  const handleToggleProductSelection = (productId: string) => {
    if (effectiveSelectedIds.includes(productId)) {
      setSelectedCartProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedCartProductIds(prev => [...prev, productId]);
    }
  };

  // تحديد الكل
  const handleSelectAll = () => {
    setSelectedCartProductIds(cartIds);
  };

  // إلغاء تحديد الكل
  const handleDeselectAll = () => {
    setSelectedCartProductIds([]);
  };

  // للمنتجات الفردية
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [activeChartProduct, setActiveChartProduct] = useState<Product | null>(null);

  // نظام تقييم المتاجر: المتجر المختار لعرض تفاصيل التقييم أو تقييمه
  const [selectedStoreForRating, setSelectedStoreForRating] = useState<Store | null>(null);
  const [ratingsRefreshTick, setRatingsRefreshTick] = useState(0);

  // الاستماع لتحديثات تقييمات المستخدمين لإعادة الحساب فورياً
  React.useEffect(() => {
    const handleUpdate = () => {
      setRatingsRefreshTick(prev => prev + 1);
    };
    window.addEventListener('store-ratings-updated', handleUpdate);
    return () => window.removeEventListener('store-ratings-updated', handleUpdate);
  }, []);

  // حساب مقاييس التقييم لكل متجر (سرعة التوصيل وتوفر المنتجات)
  const storeRatingMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateStoreRatingMetrics>> = {};
    stores.forEach(s => {
      map[s.id] = calculateStoreRatingMetrics(s.id, products);
    });
    return map;
  }, [stores, products, ratingsRefreshTick]);

  const getStoreRating = (storeId: string) => {
    return (
      storeRatingMap[storeId] ||
      calculateStoreRatingMetrics(storeId, products)
    );
  };

  // خيار تضمين رسوم التوصيل في سعر السلة الكلي أم الاكتفاء بسعر السلع فقط
  const [includeDeliveryInTotal, setIncludeDeliveryInTotal] = useState(false);

  // قائمة عناصر السلة مع تفاصيل المنتج
  const cartProductsDetailed = useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product,
        isSelected: effectiveSelectedIds.includes(item.productId),
      };
    });
  }, [cart, products, effectiveSelectedIds]);

  // العناصر المختارة حالياً للمقارنة
  const selectedCartItems = useMemo(() => {
    return cartProductsDetailed.filter(item => item.isSelected && item.product);
  }, [cartProductsDetailed]);

  // حساب سعر السلة الكلي لكل متجر للمنتجات المختارة فقط
  const storeEvaluations = useMemo(() => {
    if (selectedCartItems.length === 0) return [];

    return stores.map(store => {
      let totalCartPrice = 0;
      let availableItemsCount = 0;
      let missingItems: string[] = [];

      selectedCartItems.forEach(item => {
        if (!item.product) return;
        const priceInfo = item.product.prices[store.id];
        if (priceInfo && priceInfo.inStock) {
          totalCartPrice += priceInfo.priceInclVat * item.quantity;
          availableItemsCount++;
        } else {
          missingItems.push(item.product.nameAr);
        }
      });

      const isComplete = availableItemsCount === selectedCartItems.length;
      const isEligibleFreeDelivery = totalCartPrice >= store.freeDeliveryThreshold;
      const deliveryFee = isEligibleFreeDelivery ? 0 : store.deliveryFee;
      const finalGrandTotal = includeDeliveryInTotal ? totalCartPrice + deliveryFee : totalCartPrice;

      return {
        store,
        totalCartPrice: parseFloat(totalCartPrice.toFixed(2)),
        deliveryFee,
        isEligibleFreeDelivery,
        finalGrandTotal: parseFloat(finalGrandTotal.toFixed(2)),
        availableItemsCount,
        totalSelectedCount: selectedCartItems.length,
        missingItems,
        isComplete,
      };
    });
  }, [stores, selectedCartItems, includeDeliveryInTotal]);

  // ترتيب المتاجر من الأرخص إلى الأغلى في سعر السلة الكلي
  const sortedStoreEvaluations = useMemo(() => {
    if (storeEvaluations.length === 0) return [];

    const sorted = [...storeEvaluations].sort((a, b) => {
      // نفضل المتاجر ذات التوفر الكامل ثم الأقل سعراً
      if (a.isComplete && !b.isComplete) return -1;
      if (!a.isComplete && b.isComplete) return 1;
      return a.finalGrandTotal - b.finalGrandTotal;
    });

    const cheapestPrice = sorted[0]?.finalGrandTotal || 0;
    const highestPrice = sorted[sorted.length - 1]?.finalGrandTotal || 0;

    return sorted.map((ev, index) => {
      const diffFromCheapest = parseFloat((ev.finalGrandTotal - cheapestPrice).toFixed(2));
      const savingsVsHighest = parseFloat((highestPrice - ev.finalGrandTotal).toFixed(2));
      const rank = index + 1;

      return {
        ...ev,
        rank,
        diffFromCheapest,
        savingsVsHighest,
        isCheapest: rank === 1 && ev.isComplete,
      };
    });
  }, [storeEvaluations]);

  // إحصائيات عامة للمقارنة
  const bestStore = sortedStoreEvaluations[0];
  const worstStore = sortedStoreEvaluations[sortedStoreEvaluations.length - 1];
  const maxSavings = bestStore && worstStore ? worstStore.finalGrandTotal - bestStore.finalGrandTotal : 0;

  // للمصفوفة المفردة
  const categories = ['الكل', 'ألبان وأجبان', 'مؤن وحبوب', 'زيوت ودهون', 'لحوم ودواجن', 'عناية ومنظفات', 'مشروبات وقهوة', 'تمور ومكسرات'];
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesSearch =
      p.nameAr.includes(searchQuery) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6" id="price-matrix-container" dir="rtl">
      {/* نافذة تفاصيل المنتج والبدائل الصحية وسجل الأسعار */}
      {activeChartProduct && (
        <ProductDetailModal
          product={activeChartProduct}
          products={products}
          stores={stores}
          cart={cart}
          onClose={() => setActiveChartProduct(null)}
          onAddToCart={onAddToCart}
          onSwapProductInCart={onSwapProductInCart}
        />
      )}

      {/* رأس الواجهة وأزرار التبديل */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>مصفوفة مقارنة الأسعار في المتاجر السعودية الكبرى</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              مقارنة سعر السلة الكلي بين المتاجر (Matrix)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              اختر السلع المحددة من سلتك بالأسفل لمقارنة التكلفة الإجمالية الكلية للسلة فقط بين مختلف المتاجر السعودية
              واكتشاف المتجر الأرخص لسلتك كاملةً مع نظام تقييم المتاجر المعتمد على سرعة التوصيل وتوفر المنتجات.
            </p>

            {/* شريط معلومات نظام تقييم المتاجر */}
            <div className="mt-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 sm:px-3.5 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                </span>
                <span>
                  <strong className="text-slate-900">نظام تقييم المتاجر:</strong> يُحتسب متوسط التقييم المعروض بجانب كل متجر بناءً على <span className="text-sky-700 font-bold">سرعة التوصيل (50%)</span> و <span className="text-emerald-700 font-bold">توفر المنتجات في المخزون (50%)</span>.
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                💡 انقر على تقييم أي متجر لعرض تفاصيله أو تقييمه بنفسك
              </span>
            </div>
          </div>

          {/* تبديل وضع العرض */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start md:self-center">
            <button
              onClick={() => setViewMode('cart_total_matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cart_total_matrix'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>مقارنة سعر السلة الكلي فقط</span>
            </button>
            <button
              onClick={() => setViewMode('single_products_matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'single_products_matrix'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مصفوفة المنتجات المفردة</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. وضع مقارنة سعر السلة الكلي فقط (الوضع المطلوب أساسياً) */}
      {/* ============================================================== */}
      {viewMode === 'cart_total_matrix' && (
        <div className="space-y-6">
          {/* قسم اختيار السلع المحددة من السلة */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-700" />
                  <span>تحديد منتجات السلة للمقارنة</span>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {effectiveSelectedIds.length} من {cart.length} سلع محددة
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  حدد أو استبعد سلعاً معينة من سلتك؛ سيتم فورياً إعادة حساب سعر السلة الكلي لكل متجر.
                </p>
              </div>

              {cart.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    disabled={effectiveSelectedIds.length === cart.length}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer"
                  >
                    تحديد الكل
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    disabled={effectiveSelectedIds.length === 0}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              )}
            </div>

            {/* في حال كانت السلة فارغة */}
            {cart.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
                  🛒
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">سلة التسوق فارغة حالياً</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    لم تقم بإضافة منتجات للسلة بعد. يمكنك بنقرة واحدة تحميل سلة مقاضي نموذجية للمقارنة الفورية
                    بين المتاجر، أو اختيار منتجات من القائمة.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
                  {onLoadPreset && (
                    <>
                      <button
                        onClick={() => onLoadPreset('family')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>تحميل سلة العائلة التوفيرية</span>
                      </button>
                      <button
                        onClick={() => onLoadPreset('essentials')}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>تحميل سلة الأساسيات اليومية</span>
                      </button>
                    </>
                  )}
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('home')}
                      className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      تصفح المنتجات وإضافتها
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* قائمة كروت المنتجات لاختيار المحدد منها */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {cartProductsDetailed.map(item => {
                  if (!item.product) return null;
                  return (
                    <div
                      key={item.productId}
                      onClick={() => handleToggleProductSelection(item.productId)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                        item.isSelected
                          ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            item.isSelected ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {item.isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <span className="text-2xl shrink-0">{item.product.imageUrl}</span>

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {item.product.nameAr}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>الكمية: {item.quantity}</span>
                            <span>•</span>
                            <span>{item.product.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* أزرار تعديل الكمية مباشرة إن وجدت الدالة */}
                      {onUpdateQuantity && (
                        <div
                          className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-slate-200 shrink-0"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-mono font-bold text-xs text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* في حال لم يتم تحديد أي عنصر */}
          {cart.length > 0 && selectedCartItems.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center text-amber-900">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold">لم تختر أي سلعة للمقارنة</h3>
              <p className="text-xs text-amber-700 mt-1">
                يرجى تحديد سلعة واحدة على الأقل من القائمة بالأعلى لعرض جدول مصفوفة سعر السلة الكلي بين المتاجر.
              </p>
              <button
                onClick={handleSelectAll}
                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                تحديد جميع منتجات السلة
              </button>
            </div>
          ) : selectedCartItems.length > 0 ? (
            <>
              {/* بطاقة ملخص المتجر الفائز والأرقام الإجمالية */}
              {bestStore && (
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>المتجر الأرخص إجمالياً للمنتجات المحددة</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{bestStore.store.logo}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-2xl font-black text-white">
                              {bestStore.store.name}
                            </h3>
                            {/* شارة متوسط التقييم بجانب اسم المتجر */}
                            <StoreRatingBadge
                              metrics={getStoreRating(bestStore.store.id)}
                              storeName={bestStore.store.name}
                              onClick={() => setSelectedStoreForRating(bestStore.store)}
                              variant="dark"
                              size="md"
                            />
                            <span className="text-amber-400 text-sm font-mono font-normal">
                              (المركز الأول 🥇)
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                            <span>سعر السلة الكلي فقط:</span>
                            <span className="font-mono font-black text-emerald-400 text-lg">
                              {bestStore.finalGrandTotal.toFixed(2)} ر.س
                            </span>
                            <span className="text-[11px] text-slate-400">
                              (شامل الضريبة 15%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap bg-white/5 border border-white/10 rounded-2xl p-4">
                      {maxSavings > 0 && (
                        <div>
                          <div className="text-[11px] text-slate-400">وفر مالي محقق لسلتك</div>
                          <div className="text-xl font-mono font-black text-emerald-400">
                            {maxSavings.toFixed(2)} ر.س
                          </div>
                          <div className="text-[10px] text-emerald-300">
                            مقارنة بأعلى متجر ({worstStore?.store.name})
                          </div>
                        </div>
                      )}

                      <div className="h-10 w-px bg-white/10 hidden sm:block" />

                      <div>
                        <div className="text-[11px] text-slate-400">السلع المختارة</div>
                        <div className="text-xl font-mono font-black text-white">
                          {selectedCartItems.length} <span className="text-xs text-slate-400 font-normal">سلع</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {bestStore.isComplete ? 'جميعها متوفرة 100%' : `${bestStore.availableItemsCount} متوفرة`}
                        </div>
                      </div>

                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('cart')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer whitespace-nowrap"
                        >
                          اعتماد والشراء من السلة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* خيارات وتفضيلات المقارنة */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">خيارات الحساب:</span>
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={includeDeliveryInTotal}
                      onChange={e => setIncludeDeliveryInTotal(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span>تضمين رسوم التوصيل إن وجدت في السعر الكلي</span>
                  </label>
                </div>

                <div className="text-slate-500">
                  💡 يقارن الجدول أدناه بين المتاجر في <span className="font-bold text-slate-800">سعر السلة الكلي فقط</span> لـ ({selectedCartItems.length}) سلع محددة.
                </div>
              </div>

              {/* جدول مصفوفة مقارنة المتاجر في سعر السلة الكلي فقط */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-black text-slate-900">
                      جدول مصفوفة مقارنة المتاجر في سعر السلة الكلي فقط
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    مرتبة من الأرخص إلى الأغلى في التكلفة الإجمالية
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs" id="cart-total-matrix-table">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-black">
                        <th className="py-4 px-4 text-center w-16">الترتيب</th>
                        <th className="py-4 px-4 min-w-[180px]">المتجر</th>
                        <th className="py-4 px-4 text-center min-w-[160px]">
                          سعر السلة الكلي فقط
                        </th>
                        <th className="py-4 px-4 text-center min-w-[140px]">
                          فرق السعر عن الأرخص
                        </th>
                        <th className="py-4 px-4 text-center min-w-[130px]">
                          توفر السلع ({selectedCartItems.length})
                        </th>
                        <th className="py-4 px-4 text-center min-w-[140px]">
                          رسوم التوصيل
                        </th>
                        <th className="py-4 px-4 text-center min-w-[120px]">
                          الإجراء
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedStoreEvaluations.map((ev, idx) => {
                        const isFirst = ev.rank === 1 && ev.isComplete;
                        return (
                          <tr
                            key={ev.store.id}
                            className={`transition-colors ${
                              isFirst
                                ? 'bg-emerald-50/50 hover:bg-emerald-50'
                                : 'hover:bg-slate-50/70'
                            }`}
                          >
                            {/* الترتيب والميدالية */}
                            <td className="py-4 px-4 text-center font-bold">
                              {ev.rank === 1 && ev.isComplete ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                                  🥇
                                </span>
                              ) : ev.rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs">
                                  🥈
                                </span>
                              ) : ev.rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-black text-xs">
                                  🥉
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">#{ev.rank}</span>
                              )}
                            </td>

                            {/* اسم وشعار المتجر مع متوسط التقييم المشتق */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl p-1.5 bg-white rounded-xl border border-slate-200 shrink-0">
                                  {ev.store.logo}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                                    <span>{ev.store.name}</span>
                                    {/* عرض متوسط التقييم بجانب اسم المتجر في صفحة المقارنة */}
                                    <StoreRatingBadge
                                      metrics={getStoreRating(ev.store.id)}
                                      storeName={ev.store.name}
                                      onClick={() => setSelectedStoreForRating(ev.store)}
                                      size="sm"
                                    />
                                    {isFirst && (
                                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                        الأرخص لسلتك
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                    <span>{ev.store.deliveryTime}</span>
                                    <span>•</span>
                                    <span className="text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded font-medium">
                                      سرعة: {getStoreRating(ev.store.id).deliverySpeedRating.toFixed(1)}⭐
                                    </span>
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                      توفر: {getStoreRating(ev.store.id).availabilityRating.toFixed(1)}⭐
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* سعر السلة الكلي فقط (العمود الأهم) */}
                            <td className="py-4 px-4 text-center">
                              <div
                                className={`inline-block py-1.5 px-3.5 rounded-xl ${
                                  isFirst
                                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                                    : 'bg-slate-100 text-slate-900 font-bold'
                                }`}
                              >
                                <span className="font-mono text-base">
                                  {ev.finalGrandTotal.toFixed(2)}
                                </span>
                                <span className="text-[11px] mr-1 font-normal opacity-90">
                                  ر.س
                                </span>
                              </div>
                              {includeDeliveryInTotal && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  (شامل التوصيل)
                                </div>
                              )}
                            </td>

                            {/* فارق السعر والتوفير */}
                            <td className="py-4 px-4 text-center font-mono">
                              {ev.diffFromCheapest === 0 ? (
                                <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-md text-xs">
                                  الأقل سعراً (0.00 ر.س)
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold text-xs">
                                  +{ev.diffFromCheapest.toFixed(2)} ر.س
                                </span>
                              )}
                            </td>

                            {/* توفر السلع */}
                            <td className="py-4 px-4 text-center">
                              {ev.isComplete ? (
                                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg text-xs font-bold">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>كاملة ({ev.availableItemsCount}/{ev.totalSelectedCount})</span>
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg text-xs font-bold inline-block">
                                    {ev.availableItemsCount} من {ev.totalSelectedCount} متوفر
                                  </span>
                                  {ev.missingItems.length > 0 && (
                                    <div className="text-[10px] text-slate-400 truncate max-w-[140px] mx-auto">
                                      ينقص: {ev.missingItems.join('، ')}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* رسوم التوصيل */}
                            <td className="py-4 px-4 text-center text-xs">
                              {ev.isEligibleFreeDelivery ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  توصيل مجاني 🎉
                                </span>
                              ) : (
                                <div className="text-slate-600">
                                  <span className="font-mono">{ev.deliveryFee.toFixed(2)} ر.س</span>
                                  <div className="text-[10px] text-slate-400">
                                    مجاني &gt;{ev.store.freeDeliveryThreshold} ر.س
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* زر الإجراء السريع */}
                            <td className="py-4 px-4 text-center">
                              {onNavigateTab ? (
                                <button
                                  onClick={() => onNavigateTab('cart')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isFirst
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  عرض بالسلة
                                </button>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* رسم بياني شريطي بصري لمقارنة سعر السلة الكلي بين المتاجر */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-700" />
                    <span>مقارنة بصرية لسعر السلة الكلي بين المتاجر</span>
                  </h3>
                  <span className="text-xs text-slate-400">أقصر شريط = أقل سعر وأعلى توفير</span>
                </div>

                <div className="space-y-3 pt-1">
                  {sortedStoreEvaluations.map(ev => {
                    const minPrice = bestStore?.finalGrandTotal || 1;
                    const maxPrice = worstStore?.finalGrandTotal || minPrice * 1.5;
                    // نسبة العرض للشريط (بين 50% و 100%)
                    const range = maxPrice - minPrice || 1;
                    const percentage = 40 + ((ev.finalGrandTotal - minPrice) / range) * 60;
                    const isFirst = ev.rank === 1 && ev.isComplete;

                    return (
                      <div key={ev.store.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 flex-wrap">
                            <span>{ev.store.logo}</span>
                            <span>{ev.store.name}</span>
                            <StoreRatingBadge
                              metrics={getStoreRating(ev.store.id)}
                              storeName={ev.store.name}
                              onClick={() => setSelectedStoreForRating(ev.store)}
                              size="xs"
                            />
                            {isFirst && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black">
                                الأرخص 🥇
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-bold text-slate-900">
                            {ev.finalGrandTotal.toFixed(2)} ر.س
                            {ev.diffFromCheapest > 0 && (
                              <span className="text-[11px] text-rose-500 font-normal mr-1.5">
                                (+{ev.diffFromCheapest.toFixed(2)} ر.س)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${Math.min(100, Math.max(20, percentage))}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFirst
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                                : ev.rank === 2
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. وضع استعراض مصفوفة المنتجات المفردة (تفاصيل كل سلعة) */}
      {/* ============================================================== */}
      {viewMode === 'single_products_matrix' && (
        <div className="space-y-4">
          {/* فلاتر البحث للمنتجات المفردة */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="ابحث عن سلعة، ماركة، أو باركود..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* فلاتر التصنيفات */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* جدول المنتجات المفردة */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs" id="price-comparison-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                    <th className="py-3.5 px-4 min-w-[200px]">المنتج والوحدة</th>
                    {stores.map(store => {
                      const ratingMetrics = getStoreRating(store.id);
                      return (
                        <th key={store.id} className="py-3.5 px-3 min-w-[110px] text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl mb-0.5">{store.logo}</span>
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <span className="text-xs text-slate-900 font-bold">{store.name}</span>
                              <StoreRatingBadge
                                metrics={ratingMetrics}
                                storeName={store.name}
                                onClick={() => setSelectedStoreForRating(store)}
                                size="xs"
                              />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-3.5 px-3 text-center min-w-[100px]">تاريخ الأسعار</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">أفضل سعر</th>
                    <th className="py-3.5 px-3 text-center min-w-[90px]">السلة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    let lowestPrice = Infinity;
                    let lowestStoreId = '';

                    stores.forEach(s => {
                      const pInfo = product.prices[s.id];
                      if (pInfo && pInfo.inStock && pInfo.priceInclVat < lowestPrice) {
                        lowestPrice = pInfo.priceInclVat;
                        lowestStoreId = s.id;
                      }
                    });

                    const isAlreadyInCart = cartProductIds.includes(product.id);

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-1.5 bg-slate-100 rounded-lg shrink-0">
                              {product.imageUrl}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-xs leading-tight">
                                {product.nameAr}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {product.unit}
                              </div>
                            </div>
                          </div>
                        </td>

                        {stores.map(store => {
                          const priceInfo = product.prices[store.id];
                          const isLowest = store.id === lowestStoreId && priceInfo?.inStock;

                          if (!priceInfo || !priceInfo.inStock) {
                            return (
                              <td key={store.id} className="py-3.5 px-3 text-center">
                                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                                  غير متوفر
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={store.id} className="py-3.5 px-3 text-center">
                              <div
                                className={`inline-block py-1 px-2 rounded-lg ${
                                  isLowest
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black'
                                    : 'text-slate-800 font-bold'
                                }`}
                              >
                                <span className="font-mono text-xs">
                                  {priceInfo.priceInclVat.toFixed(2)}
                                </span>
                                <span className="text-[10px] mr-1 text-slate-500 font-normal">
                                  ر.س
                                </span>
                              </div>
                            </td>
                          );
                        })}

                        {/* زر تاريخ الأسعار */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => setActiveChartProduct(product)}
                            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <ChartIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>المخطط</span>
                          </button>
                        </td>

                        {/* أفضل سعر */}
                        <td className="py-3.5 px-4 text-center">
                          {lowestPrice < Infinity ? (
                            <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              <span>{lowestPrice.toFixed(2)} ر.س</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* زر الإضافة */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => onAddToCart(product.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer ${
                              isAlreadyInCart
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {isAlreadyInCart ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>بالسلة</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل نظام تقييم المتجر وتقييم المستخدم */}
      <StoreRatingModal
        store={selectedStoreForRating}
        products={products}
        isOpen={!!selectedStoreForRating}
        onClose={() => setSelectedStoreForRating(null)}
        onRatingUpdated={() => setRatingsRefreshTick(prev => prev + 1)}
      />
    </div>
  );
};
