import React, { useState, useMemo } from 'react';
import {
  CartItem,
  Product,
  Store,
  SavedCartSnapshot,
  CartItemComparison,
} from '../types.ts';
import {
  getStoredSavedCarts,
  createNewCartSnapshot,
  deleteSavedCartSnapshot,
  compareCartWithSavedSnapshot,
} from '../lib/cartComparisonManager.ts';
import {
  History,
  TrendingDown,
  TrendingUp,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShoppingBag,
  LineChart as ChartIcon,
  X,
  Sparkles,
  ArrowRightLeft,
  Store as StoreIcon,
  Plus,
} from 'lucide-react';

interface CartComparisonHistoryViewProps {
  currentCart: CartItem[];
  products: Product[];
  stores: Store[];
  onLoadSavedCartToCurrent: (cartItems: CartItem[]) => void;
  onSelectProductForChart?: (product: Product) => void;
  onAddToCart?: (productId: string) => void;
}

export const CartComparisonHistoryView: React.FC<CartComparisonHistoryViewProps> = ({
  currentCart,
  products,
  stores,
  onLoadSavedCartToCurrent,
  onSelectProductForChart,
  onAddToCart,
}) => {
  // قائمة السلال المحفوظة
  const [savedCarts, setSavedCarts] = useState<SavedCartSnapshot[]>(() => getStoredSavedCarts());
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(() => {
    const carts = getStoredSavedCarts();
    return carts.length > 0 ? carts[0].id : '';
  });

  // مرشح تصفية الأصناف (الكل، انخفاض، ارتفاع، مستقر، جديد/محذوف)
  const [filterType, setFilterType] = useState<'all' | 'down' | 'up' | 'stable' | 'changed_items'>('all');

  // نافذة حفظ السلة الحالية
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // السلة المختارة للمقارنة
  const selectedSavedCart = useMemo(() => {
    return savedCarts.find(s => s.id === selectedSnapshotId) || savedCarts[0] || null;
  }, [savedCarts, selectedSnapshotId]);

  // نتيجة المقارنة الرياضية الدقيقة
  const comparison = useMemo(() => {
    if (!selectedSavedCart) return null;
    return compareCartWithSavedSnapshot(currentCart, selectedSavedCart, products, stores);
  }, [currentCart, selectedSavedCart, products, stores]);

  // تصفية السلع حسب المرشح المختار
  const filteredItems = useMemo(() => {
    if (!comparison) return [];
    if (filterType === 'all') return comparison.itemComparisons;
    if (filterType === 'down') return comparison.itemComparisons.filter(i => i.trend === 'down');
    if (filterType === 'up') return comparison.itemComparisons.filter(i => i.trend === 'up');
    if (filterType === 'stable') return comparison.itemComparisons.filter(i => i.trend === 'stable');
    if (filterType === 'changed_items')
      return comparison.itemComparisons.filter(i => i.trend === 'new' || i.trend === 'removed');
    return comparison.itemComparisons;
  }, [comparison, filterType]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // حفظ السلة الحالية
  const handleSaveCurrentCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCart.length === 0) {
      showToast('⚠️ لا يمكن حفظ سلة فارغة، أضف بعض المنتجات أولاً.');
      return;
    }

    const newSnapshot = createNewCartSnapshot(
      saveTitle.trim() || `سلة تسوق (${new Date().toLocaleDateString('ar-SA')})`,
      currentCart,
      products,
      stores,
      saveNote.trim() || undefined
    );

    const updated = getStoredSavedCarts();
    setSavedCarts(updated);
    setSelectedSnapshotId(newSnapshot.id);
    setIsSaveModalOpen(false);
    setSaveTitle('');
    setSaveNote('');
    showToast(`✅ تم حفظ سلة "${newSnapshot.title}" بنجاح في السجل!`);
  };

  // حذف سلة من السجل
  const handleDeleteSnapshot = (snapshotId: string) => {
    const target = savedCarts.find(s => s.id === snapshotId);
    const updated = deleteSavedCartSnapshot(snapshotId);
    setSavedCarts(updated);
    if (selectedSnapshotId === snapshotId) {
      setSelectedSnapshotId(updated.length > 0 ? updated[0].id : '');
    }
    showToast(`🗑️ تم حذف "${target?.title || 'السلة'}" من السجل.`);
  };

  // استعادة سلة سابقة كسلة حالية
  const handleRestoreSavedCart = () => {
    if (!selectedSavedCart) return;
    const cartItems: CartItem[] = selectedSavedCart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    onLoadSavedCartToCurrent(cartItems);
    showToast(`🔄 تم استعادة "${selectedSavedCart.title}" بنجاح إلى سلة التسوق النشطة!`);
  };

  return (
    <div className="space-y-6" id="cart-comparison-history-root">
      {/* إشعار عائم Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in zoom-in duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس التوضيحي والشعار */}
      <div className="bg-gradient-to-l from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>سجل مقارنة السلال التاريخي والمشتريات السابقة</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              مقارنة تكلفة السلة الحالية مع السلال السابقة
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              تعرّف فورياً على فرق التكلفة الإجمالية بين ما تشتريه اليوم وما اشتريته سابقاً، مع إبراز دقيق للسلع التي انخفضت أو ارتفعت أسعارها في السوق السعودي.
            </p>
          </div>

          {/* أزرار التحكم السريعة: حفظ السلة الحالية */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="save-current-cart-btn"
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 touch-manipulation cursor-pointer border border-emerald-400/40"
            >
              <Save className="w-4 h-4" />
              <span>حفظ السلة الحالية بالسجل</span>
            </button>
          </div>
        </div>
      </div>

      {/* شريط اختيار السلة المحفوظة للمقارنة وأزرار التفاعل */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <label htmlFor="saved-cart-select" className="block text-xs font-bold text-slate-500 mb-0.5">
                اختر السلة السابقة المحفوظة للمقارنة معها:
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="saved-cart-select"
                  value={selectedSnapshotId}
                  onChange={e => setSelectedSnapshotId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden min-w-[240px] cursor-pointer"
                >
                  {savedCarts.map(cart => (
                    <option key={cart.id} value={cart.id}>
                      {cart.title} ({cart.dateLabel}) — {cart.totalCostSar} ر.س
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400">({savedCarts.length} سلال بالسجل)</span>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات على السلة المختارة */}
          {selectedSavedCart && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="restore-saved-cart-btn"
                onClick={handleRestoreSavedCart}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors touch-manipulation cursor-pointer"
                title="استبدال محتويات سلة التسوق الحالية بهذه السلة"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>استعادة هذه السلة كسلتي الحالية</span>
              </button>

              {savedCarts.length > 1 && (
                <button
                  id="delete-saved-cart-btn"
                  onClick={() => handleDeleteSnapshot(selectedSavedCart.id)}
                  className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 px-3 py-2 rounded-xl border border-rose-200 transition-colors touch-manipulation cursor-pointer"
                  title="حذف هذه السلة من السجل"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>حذف</span>
                </button>
              )}
            </div>
          )}
        </div>

        {selectedSavedCart?.note && (
          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span><strong>ملاحظة السلة المحفوظة:</strong> {selectedSavedCart.note}</span>
          </div>
        )}
      </div>

      {/* لوحة المقارنة الإجمالية الرئيسية (Hero Comparison Dashboard) */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="cart-comparison-hero-cards">
          {/* كرت المقارنة الإجمالية مع السعر السابق والحالي */}
          <div className="md:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      comparison.overallTrend === 'cheaper'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : comparison.overallTrend === 'more_expensive'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {comparison.overallTrend === 'cheaper' ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        <span>انخفاض وتوفير إجمالي في سلتك</span>
                      </>
                    ) : comparison.overallTrend === 'more_expensive' ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-rose-600" />
                        <span>ارتفاع إجمالي في تكلفة السلة</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-600" />
                        <span>تكلفة متقاربة ومتوازنة</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">شاملة 15% ضريبة ZATCA</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {comparison.overallTrend === 'cheaper'
                    ? `سلتك الحالية أوفر بمقدار ${Math.abs(comparison.costDeltaSar).toFixed(2)} ر.س (${Math.abs(comparison.costDeltaPercent)}%)`
                    : comparison.overallTrend === 'more_expensive'
                    ? `سلتك الحالية تزيد بـ +${comparison.costDeltaSar.toFixed(2)} ر.س (+${comparison.costDeltaPercent}%) عن السابقة`
                    : `تكلفة السلة الحالية متطابقة مع السلة السابقة`}
                </h3>

                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  {comparison.overallTrend === 'cheaper'
                    ? `استفادت سلتك الحالية من عروض أسعار تنافسية في المتاجر؛ حيث انخفضت أسعار ${comparison.itemsCount.cheaper} سلع رئيسية مقارنة بتاريخ حفظ السلة السابقة (${selectedSavedCart?.dateLabel}).`
                    : comparison.overallTrend === 'more_expensive'
                    ? `شهدت بعض السلع ارتفاعاً أو تمت إضافة أصناف جديدة؛ ننصح بمراجعة السلع المرتفعة بالأسفل والبحث عن بدائلها الأوفر.`
                    : `الأسعار الإجمالية متطابقة بشكل عام بين فترتي التسوق.`}
                </p>
              </div>

              {/* بطاقة التكلفة السابقة مقابل التكلفة الحالية */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 min-w-[200px] shrink-0 space-y-2.5 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">التكلفة بالسلة السابقة</div>
                  <div className="text-base font-black text-slate-600 font-mono line-through">
                    {comparison.savedTotalCost.toFixed(2)} <span className="text-xs">ر.س</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-xs text-emerald-800 font-bold">التكلفة الحالية للسلة</div>
                  <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                    {comparison.currentTotalCost.toFixed(2)}{' '}
                    <span className="text-xs font-bold">ر.س</span>
                  </div>
                </div>
                <div
                  className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                    comparison.overallTrend === 'cheaper'
                      ? 'bg-emerald-100 text-emerald-800'
                      : comparison.overallTrend === 'more_expensive'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {comparison.costDeltaSar <= 0 ? 'وفر' : 'فرق'}:{' '}
                  {Math.abs(comparison.costDeltaSar).toFixed(2)} ر.س
                </div>
              </div>
            </div>
          </div>

          {/* كرت ملخص عدد السلع المرتفعة والمنخفضة (KPI Metrics) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400">حركة أسعار السلع في السلة</span>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-emerald-900">سلع انخفض سعرها (أوفر):</span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {comparison.itemsCount.cheaper} سلع
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="font-bold text-rose-900">سلع ارتفع سعرها (أغلى):</span>
                  </div>
                  <span className="font-mono font-black text-rose-700 text-sm">
                    {comparison.itemsCount.moreExpensive} سلع
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="font-bold text-slate-700">سلع مستقرة السعر:</span>
                  </div>
                  <span className="font-mono font-black text-slate-800 text-sm">
                    {comparison.itemsCount.stable} سلع
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>إجمالي السلع المشمولة: {comparison.itemsCount.total}</span>
              {comparison.itemsCount.newItems > 0 && (
                <span className="text-teal-700 font-bold">+{comparison.itemsCount.newItems} مضافة حديثاً</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* تسليط الضوء على أبرز السلع المتغيرة (Top Movers Callout) */}
      {comparison && (comparison.topSavingsItem || comparison.topPriceIncreaseItem) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="top-movers-banner">
          {comparison.topSavingsItem && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-start gap-3">
              <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs shrink-0">
                {comparison.topSavingsItem.imageUrl}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md">
                    أكبر وفر تم تحقيقه 🟢
                  </span>
                  <span className="text-xs font-black text-emerald-900 truncate">
                    {comparison.topSavingsItem.productName}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  انخفض السعر من <span className="line-through">{comparison.topSavingsItem.savedUnitPrice.toFixed(2)}</span> إلى{' '}
                  <strong className="font-black text-emerald-900">{comparison.topSavingsItem.currentUnitPrice.toFixed(2)} ر.س</strong>{' '}
                  (وفر {Math.abs(comparison.topSavingsItem.unitPriceDeltaSar).toFixed(2)} ر.س للوحدة في {comparison.topSavingsItem.bestCurrentStoreName}).
                </p>
              </div>
            </div>
          )}

          {comparison.topPriceIncreaseItem && (
            <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3">
              <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs shrink-0">
                {comparison.topPriceIncreaseItem.imageUrl}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-md">
                    أكبر ارتفاع سعري 🔴
                  </span>
                  <span className="text-xs font-black text-rose-900 truncate">
                    {comparison.topPriceIncreaseItem.productName}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 mt-1">
                  ارتفع السعر من {comparison.topPriceIncreaseItem.savedUnitPrice.toFixed(2)} إلى{' '}
                  <strong className="font-black text-rose-900">{comparison.topPriceIncreaseItem.currentUnitPrice.toFixed(2)} ر.س</strong>{' '}
                  (+{comparison.topPriceIncreaseItem.unitPriceDeltaSar.toFixed(2)} ر.س للوحدة).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* قائمة السلع المفصلة مع شريط التصفية والفرز */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              تفاصيل السلع المشمولة في المقارنة
            </h3>
            <p className="text-xs text-slate-500">
              مقارنة سعر الوحدة وتكلفة الكمية الإجمالية لكل منتج بين السلتين
            </p>
          </div>

          {/* أزرار المرشحات السريعة Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({comparison?.itemsCount.total || 0})
            </button>
            <button
              onClick={() => setFilterType('down')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'down'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>انخفضت ({comparison?.itemsCount.cheaper || 0})</span>
            </button>
            <button
              onClick={() => setFilterType('up')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'up'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ارتفعت ({comparison?.itemsCount.moreExpensive || 0})</span>
            </button>
            <button
              onClick={() => setFilterType('stable')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'stable'
                  ? 'bg-slate-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              مستقرة ({comparison?.itemsCount.stable || 0})
            </button>
          </div>
        </div>

        {/* عرض السلع المقارنة */}
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">لا توجد سلع تطابق هذا المرشح</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const fullProduct = products.find(p => p.id === item.productId);

              return (
                <div
                  key={item.productId}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.trend === 'down'
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : item.trend === 'up'
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : item.trend === 'new'
                      ? 'bg-teal-50/40 border-teal-200'
                      : item.trend === 'removed'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* معلومات المنتج */}
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-3xl p-2.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs shrink-0 flex items-center justify-center w-14 h-14">
                        {item.imageUrl}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">
                            {item.productName}
                          </h4>
                          {/* شارة اتجاه السعر */}
                          {item.trend === 'down' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                              <span>انخفاض {Math.abs(item.unitPriceDeltaPercent)}% ({Math.abs(item.unitPriceDeltaSar).toFixed(2)} ر.س)</span>
                            </span>
                          )}
                          {item.trend === 'up' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                              <span>ارتفاع +{item.unitPriceDeltaPercent}% (+{item.unitPriceDeltaSar.toFixed(2)} ر.س)</span>
                            </span>
                          )}
                          {item.trend === 'stable' && (
                            <span className="text-[11px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full">
                              سعر مستقر
                            </span>
                          )}
                          {item.trend === 'new' && (
                            <span className="text-[11px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                              صنف جديد في سلتك الحالية
                            </span>
                          )}
                          {item.trend === 'removed' && (
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              غير مضاف في السلة الحالية
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {item.unit}
                          </span>
                          <span>•</span>
                          <span>الفئة: {item.category}</span>
                          <span>•</span>
                          <span className="text-slate-600">
                            أوفر متجر حالياً: <strong className="text-slate-900">{item.bestCurrentStoreName}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {item.changeNote}
                        </p>
                      </div>
                    </div>

                    {/* أرقام المقارنة السعرية (السابق مقابل الحالي) */}
                    <div className="flex items-center gap-4 sm:gap-6 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
                      {/* السعر السابق */}
                      <div className="text-center sm:text-right">
                        <div className="text-[11px] text-slate-400 font-bold">السعر بالسلة السابقة</div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-slate-600">
                          {item.savedQuantity > 0 ? (
                            <>
                              <div>{item.savedUnitPrice.toFixed(2)} ر.س <span className="text-[10px] text-slate-400">/ للوحدة</span></div>
                              <div className="text-[10px] text-slate-500">
                                إجمالي ({item.savedQuantity}): <strong>{item.savedTotalPrice.toFixed(2)} ر.س</strong>
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs">لم يكن مضافاً</span>
                          )}
                        </div>
                      </div>

                      {/* السهم الانتقالي */}
                      <div className="text-slate-300 font-bold text-sm">➔</div>

                      {/* السعر الحالي */}
                      <div className="text-center sm:text-right">
                        <div className="text-[11px] text-emerald-800 font-bold">السعر بالسلة الحالية</div>
                        <div className="font-mono font-black text-xs sm:text-sm text-emerald-900">
                          {item.currentQuantity > 0 ? (
                            <>
                              <div>{item.currentUnitPrice.toFixed(2)} ر.س <span className="text-[10px] text-slate-400">/ للوحدة</span></div>
                              <div className="text-[10px] text-emerald-700">
                                إجمالي ({item.currentQuantity}): <strong>{item.currentTotalPrice.toFixed(2)} ر.س</strong>
                              </div>
                            </>
                          ) : (
                            <span className="text-amber-700 text-xs font-bold">0 في السلة</span>
                          )}
                        </div>
                      </div>

                      {/* الإجراءات السريعة على المنتج */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {fullProduct && onSelectProductForChart && (
                          <button
                            onClick={() => onSelectProductForChart(fullProduct)}
                            className="p-2 rounded-xl text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 transition-colors touch-manipulation cursor-pointer"
                            title="رسم بياني لتاريخ أسعار هذا المنتج"
                          >
                            <ChartIcon className="w-4 h-4" />
                          </button>
                        )}
                        {item.currentQuantity === 0 && onAddToCart && (
                          <button
                            onClick={() => onAddToCart(item.productId)}
                            className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-xl transition-all shadow-xs active:scale-95 touch-manipulation cursor-pointer"
                            title="إضافة المنتج للسلة الحالية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* نافذة حفظ السلة الحالية المنبثقة (Save Cart Modal) */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  حفظ السلة الحالية في السجل
                </h3>
                <p className="text-xs text-slate-500">
                  تضم {currentCart.length} أصناف بأسعارها الحية اليوم
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCurrentCart} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم السلة / المناسبة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سلة مقاضي منتصف سبتمبر، تموين الراتب..."
                  value={saveTitle}
                  onChange={e => setSaveTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظة إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: تم التركيز على عروض بنده والعثيم..."
                  value={saveNote}
                  onChange={e => setSaveNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md cursor-pointer"
                >
                  تأكيد الحفظ في السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
