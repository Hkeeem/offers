import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ListPlus,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Store as StoreIcon,
  Search,
  FileText,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Product, Store, CartItem, QuickListMatchedItem } from '../types.ts';
import {
  matchItemWithDatabase,
  parseBulkQuickList,
  PRESET_QUICK_LISTS,
  extractQuantityAndQuery,
} from '../lib/quickListMatcher.ts';

interface QuickListViewProps {
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  onAddToCart: (productId: string, quantity?: number) => void;
  onNavigateTab: (tab: any) => void;
  onOpenPriceHistory?: (product: Product) => void;
}

export const QuickListView: React.FC<QuickListViewProps> = ({
  products,
  stores,
  cart,
  onAddToCart,
  onNavigateTab,
  onOpenPriceHistory,
}) => {
  // وضع الإدخال: كتابة مفردة سريعة أو لصق قائمة مجمعة
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [itemsList, setItemsList] = useState<QuickListMatchedItem[]>([]);
  const [addedBatchNotice, setAddedBatchNotice] = useState<string | null>(null);

  const cartProductIds = useMemo(() => cart.map(c => c.productId), [cart]);

  // تحديث حالة السلة في القائمة السريعة فورياً
  const syncedItemsList = useMemo(() => {
    return itemsList.map(item => ({
      ...item,
      isInCart: item.matchedProduct ? cartProductIds.includes(item.matchedProduct.id) : false,
    }));
  }, [itemsList, cartProductIds]);

  // إضافة عنصر مفرد من حقل الإدخال
  const handleAddSingleItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!singleInput.trim()) return;

    const matched = matchItemWithDatabase(singleInput, products, stores, cartProductIds);
    setItemsList(prev => [matched, ...prev]);
    setSingleInput('');
  };

  // تحليل ومعالجة القائمة المجمعة المنسوخة
  const handleProcessBulkList = () => {
    if (!bulkInput.trim()) return;
    const parsed = parseBulkQuickList(bulkInput, products, stores, cartProductIds);
    setItemsList(prev => [...parsed, ...prev]);
    setBulkInput('');
    setInputMode('single');
  };

  // تحميل قائمة نموذجية سريعة
  const handleLoadPreset = (presetItems: string[]) => {
    const parsed = presetItems.map(text => matchItemWithDatabase(text, products, stores, cartProductIds));
    setItemsList(parsed);
  };

  // تغيير الكمية لعنصر في القائمة
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setItemsList(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const lowest = item.lowestPriceSar || 0;
        return {
          ...item,
          detectedQuantity: newQty,
          totalCostSar: parseFloat((lowest * newQty).toFixed(2)),
          potentialSavingsSar: item.potentialSavingsSar
            ? parseFloat(((item.potentialSavingsSar / item.detectedQuantity) * newQty).toFixed(2))
            : 0,
        };
      })
    );
  };

  // تبديل المنتج بمنتج بديل من المقترحات
  const handleSelectAlternativeProduct = (itemId: string, newProduct: Product) => {
    setItemsList(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const reMatched = matchItemWithDatabase(
          `${item.detectedQuantity} ${newProduct.nameAr}`,
          products,
          stores,
          cartProductIds
        );
        return {
          ...reMatched,
          id: item.id,
          rawInputText: item.rawInputText,
        };
      })
    );
  };

  // حذف عنصر من القائمة السريعة
  const handleRemoveItem = (itemId: string) => {
    setItemsList(prev => prev.filter(i => i.id !== itemId));
  };

  // مسح جميع عناصر القائمة
  const handleClearAll = () => {
    setItemsList([]);
    setAddedBatchNotice(null);
  };

  // إضافة جميع العناصر المطابقة إلى السلة بنقرة واحدة
  const handleAddAllMatchedToCart = () => {
    const matchedItemsToAdd = syncedItemsList.filter(item => item.matchedProduct !== null);
    if (matchedItemsToAdd.length === 0) return;

    let count = 0;
    matchedItemsToAdd.forEach(item => {
      if (item.matchedProduct) {
        onAddToCart(item.matchedProduct.id, item.detectedQuantity);
        count++;
      }
    });

    setAddedBatchNotice(`تمت إضافة ${count} سلع مطابقة إلى سلة التسوق بنجاح!`);
    setTimeout(() => setAddedBatchNotice(null), 4000);
  };

  // إحصائيات القائمة
  const matchedCount = syncedItemsList.filter(i => i.matchedProduct !== null).length;
  const totalEstimatedCost = syncedItemsList.reduce((sum, i) => sum + (i.totalCostSar || 0), 0);
  const totalEstimatedSavings = syncedItemsList.reduce((sum, i) => sum + (i.potentialSavingsSar || 0), 0);

  return (
    <div className="space-y-6" dir="rtl" id="quick-list-view">
      {/* رأس الصفحة مع الشرح */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مطابقة ذكية بالذكاء الاصطناعي مع قاعدة السلع السعودية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>القائمة السريعة الذكية</span>
              <span className="text-amber-400 font-mono text-xl">QuickList</span>
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              اكتب اسم أي سلعة ترغب بشرائها (مثل: «حليب المراعي»، «أرز الشعلان»، «زيت عافية»)، وسيقوم نظام حكيم فورياً
              بمطابقتها مع قاعدة بيانات المتاجر، واقتناص أفضل سعر وأقل متجر، وإضافتها لسلتك بنقرة زر واحدة!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('cart')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>الانتقال للسلة ({cart.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* شريط الإدخال الرئيسي والمطابقة */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* اختيار وضع الإدخال */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('single')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                inputMode === 'single'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>إدخال فوري بالاسم (سلعة سلعة)</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('bulk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                inputMode === 'bulk'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>لصق قائمة مقاضي كاملة (متعددة الأسطر)</span>
            </button>
          </div>

          {itemsList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح القائمة الحالية</span>
            </button>
          )}
        </div>

        {/* نموذج الإدخال الفردي */}
        {inputMode === 'single' ? (
          <form onSubmit={handleAddSingleItem} className="space-y-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={singleInput}
                onChange={e => setSingleInput(e.target.value)}
                placeholder="اكتب اسم السلعة مباشرة... مثال: حليب 2 لتر، أرز الشعلان، دجاج التنمية، زيت عافية..."
                className="w-full bg-slate-50 border-2 border-emerald-600/30 focus:border-emerald-600 rounded-2xl py-3.5 px-4 pl-32 text-slate-900 text-sm font-medium focus:outline-hidden transition-all placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!singleInput.trim()}
                className="absolute left-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة للقائمة</span>
              </button>
            </div>

            {/* اقتراحات سريعة بنقرة زر */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 pt-1">
              <span className="font-bold text-slate-700">جرب بسرعة:</span>
              {['حليب المراعي', 'أرز الشعلان', 'طبق بيض الوطنية', 'زيت عافية', 'دجاج التنمية', 'مسحوق أريال'].map(
                sample => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setSingleInput(sample);
                    }}
                    className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + {sample}
                  </button>
                )
              )}
            </div>
          </form>
        ) : (
          /* نموذج لصق قائمة كاملة */
          <div className="space-y-3">
            <textarea
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              rows={5}
              placeholder="الصق مقاضيك هنا سطر بسطر... مثال:&#10;2 حليب المراعي 2 لتر&#10;أرز الشعلان 5 كجم&#10;زيت عافية&#10;طبق بيض الوطنية&#10;مسحوق أريال 5 كجم"
              className="w-full bg-slate-50 border-2 border-emerald-600/30 focus:border-emerald-600 rounded-2xl p-4 text-slate-900 text-sm font-medium focus:outline-hidden transition-all placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                💡 يدعم استخراج الكميات تلقائياً (مثلاً: «2 حليب» أو «أرز 3 أكياس») والتعرف الذكي على الماركات.
              </p>
              <button
                type="button"
                onClick={handleProcessBulkList}
                disabled={!bulkInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل ومطابقة القائمة الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* قوائم جاهزة وسريعة */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">أو اختر قائمة مقاضي جاهزة:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESET_QUICK_LISTS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.items)}
                className="text-right p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                  {preset.title}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* رسالة تأكيد الإضافة للسلة */}
      {addedBatchNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between text-emerald-900 text-sm font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{addedBatchNotice}</span>
          </div>
          <button
            onClick={() => onNavigateTab('cart')}
            className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            مشاهدة السلة وتحسينها 🛒
          </button>
        </div>
      )}

      {/* شريط الإحصائيات والإجراء السريع */}
      {itemsList.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="text-xs text-slate-400 font-medium">عدد العناصر المدخلة</div>
              <div className="text-xl font-black text-white">
                {itemsList.length} <span className="text-xs font-normal text-slate-400">عنصر</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-xs text-slate-400 font-medium">المطابقة بنجاح</div>
              <div className="text-xl font-black text-emerald-400">
                {matchedCount} من {itemsList.length}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-xs text-slate-400 font-medium">التكلفة التقديرية (أقل سعر)</div>
              <div className="text-xl font-mono font-black text-amber-400">
                {totalEstimatedCost.toFixed(2)} ر.س
              </div>
            </div>
            {totalEstimatedSavings > 0 && (
              <>
                <div className="h-8 w-px bg-slate-800 hidden sm:block" />
                <div>
                  <div className="text-xs text-emerald-400 font-medium">وفر محتمل</div>
                  <div className="text-xl font-mono font-black text-emerald-300">
                    {totalEstimatedSavings.toFixed(2)} ر.س
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddAllMatchedToCart}
              disabled={matchedCount === 0}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>إضافة السلع المطابقة ({matchedCount}) للسلة</span>
            </button>
          </div>
        </div>
      )}

      {/* عرض نتائج المطابقة للعناصر */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-emerald-700" />
            <span>العناصر في القائمة السريعة ({itemsList.length})</span>
          </h2>
          {itemsList.length > 0 && (
            <span className="text-xs text-slate-500">
              💡 يمكنك تعديل الكميات أو تبديل السلعة بالمقترحات البديلة أدناه
            </span>
          )}
        </div>

        {itemsList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto text-2xl">
              📝
            </div>
            <h3 className="text-base font-bold text-slate-800">قائمتك السريعة فارغة حالياً</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ابدأ بكتابة السلع في الحقل بالأعلى (مثلاً: حليب، بيض، أرز، زيت...) أو اختر إحدى القوائم الجاهزة لمطابقتها
              الفورية مع أسعار السوق السعودي.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {syncedItemsList.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                  item.matchedProduct
                    ? 'border-slate-200 hover:border-emerald-300'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* معلومات السلعة المطابقة */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200">
                      {item.matchedProduct?.imageUrl || '🔍'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {item.matchedProduct?.nameAr || item.rawInputText}
                        </span>
                        {item.matchConfidence === 'exact' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            مطابقة تامة
                          </span>
                        )}
                        {item.matchConfidence === 'high' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            مطابقة ذكية
                          </span>
                        )}
                        {item.matchConfidence === 'partial' && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            اقتراح تقريبي
                          </span>
                        )}
                        {item.matchConfidence === 'unmatched' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            غير متوفر بقاعدة البيانات
                          </span>
                        )}

                        {item.isInCart && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            موجود بالسلة
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span>المدخل: «{item.rawInputText}»</span>
                        {item.matchedProduct && (
                          <>
                            <span>•</span>
                            <span>الفئة: {item.matchedProduct.category}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">
                              أقل سعر في {item.bestStore?.name}: {item.lowestPriceSar?.toFixed(2)} ر.س
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* أدوات التحكم بالكمية والإضافة */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* تعديل الكمية */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.detectedQuantity - 1)}
                        disabled={item.detectedQuantity <= 1}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs text-slate-900">
                        {item.detectedQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.detectedQuantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* التكلفة الإجمالية للسلعة */}
                    {item.totalCostSar && (
                      <div className="text-left font-mono">
                        <div className="text-xs font-bold text-slate-900">
                          {item.totalCostSar.toFixed(2)} ر.س
                        </div>
                        {item.potentialSavingsSar && item.potentialSavingsSar > 0 ? (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            وفر {item.potentialSavingsSar.toFixed(2)} ر.س
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* زر الإضافة للسلة */}
                    {item.matchedProduct ? (
                      <button
                        type="button"
                        onClick={() => onAddToCart(item.matchedProduct!.id, item.detectedQuantity)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          item.isInCart
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{item.isInCart ? 'زيادة بالسلة' : 'أضف للسلة'}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">غير متاح</span>
                    )}

                    {/* حذف السطر */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="حذف من القائمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* مقترحات بديلة للمطابقة في حال الرغبة بالاختيار */}
                {item.alternativeMatches.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400 font-medium">هل تقصد:</span>
                    {item.alternativeMatches.map(alt => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => handleSelectAlternativeProduct(item.id, alt)}
                        className="bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-[11px] cursor-pointer"
                      >
                        {alt.imageUrl} {alt.nameAr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
