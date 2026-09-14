import React, { useState } from 'react';
import { Product, Store, CartItem, PriceAlert, PriceAlertNotification } from '../types.ts';
import {
  Bell,
  Heart,
  ShoppingBag,
  TrendingDown,
  Sparkles,
  Zap,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  ExternalLink,
  Search,
  Store as StoreIcon,
  Check,
  Volume2
} from 'lucide-react';
import { getProductLowestPrice, requestBrowserNotificationPermission } from '../lib/priceAlertsManager.ts';
import { CheaperAlternativeModal } from './CheaperAlternativeModal.tsx';

interface PriceAlertsWishlistViewProps {
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  favorites: string[];
  alerts: PriceAlert[];
  notifications: PriceAlertNotification[];
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
  onSetAlertTargetPrice: (productId: string, targetPrice: number) => void;
  onToggleAlertEnabled: (productId: string) => void;
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onClearNotifications: () => void;
  onSimulatePriceDrop: () => void;
  onNavigateTab: (tab: 'home' | 'cart' | 'matrix' | 'coupons' | 'maps' | 'chat' | 'rewards' | 'history' | 'alerts') => void;
  onOpenPriceHistory: (product: Product) => void;
}

export const PriceAlertsWishlistView: React.FC<PriceAlertsWishlistViewProps> = ({
  products,
  stores,
  cart,
  favorites,
  alerts,
  notifications,
  onToggleFavorite,
  onAddToCart,
  onSwapProductInCart,
  onSetAlertTargetPrice,
  onToggleAlertEnabled,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearNotifications,
  onSimulatePriceDrop,
  onNavigateTab,
  onOpenPriceHistory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notifications' | 'favorites' | 'cart'>('notifications');
  const [selectedNotifForAlternative, setSelectedNotifForAlternative] = useState<PriceAlertNotification | null>(null);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);

  const handleQuickAdd = (productId: string, notifId: string) => {
    onAddToCart(productId);
    setAddedFeedbackId(notifId);
    setTimeout(() => {
      setAddedFeedbackId(null);
    }, 1800);
  };
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [customTargetPrice, setCustomTargetPrice] = useState<string>('');
  const [quickSearch, setQuickSearch] = useState('');
  const [showAddFavoritePicker, setShowAddFavoritePicker] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleEnableBrowserNotifs = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserNotifEnabled(granted);
  };

  const handleSaveTarget = (productId: string) => {
    const val = parseFloat(customTargetPrice);
    if (!isNaN(val) && val > 0) {
      onSetAlertTargetPrice(productId, val);
    }
    setEditingTargetId(null);
    setCustomTargetPrice('');
  };

  // المنتجات المفضلة
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  // المنتجات في السلة
  const cartProducts = products.filter((p) => cart.some((c) => c.productId === p.id));

  // إجمالي التوفير في الإشعارات
  const totalNotifSavings = notifications.reduce((acc, curr) => acc + curr.savingSar, 0);

  // المنتجات غير المضافة للمفضلة للبحث السريع
  const nonFavoriteProducts = products.filter(
    (p) =>
      !favorites.includes(p.id) &&
      (p.nameAr.includes(quickSearch) || p.nameEn.toLowerCase().includes(quickSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="price-alerts-wishlist-container">
      {/* البانر التعريفي الرئيسي */}
      <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur-xs text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 shadow-xs">
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>نظام المراقبة والرصد الحي للأسعار في المتاجر السعودية</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight">
              تنبيهات انخفاض الأسعار وقائمة المفضلة
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              يقوم نظام <strong className="text-white">حكيم AI</strong> بمتابعة كل سلعة في سلتك ومفضلتك لحظياً عبر المتاجر الستة (بنده، العثيم، الدانوب، كارفور، أمازون، ولولو). عند هبوط السعر أو بلوغ السعر المستهدف نرسل لك تنبيهاً فورياً لتقتنص الصفقة وتوفر نقودك!
            </p>
          </div>

          {/* أزرار التجربة والمحاكاة والإذن */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              id="simulate-price-drop-btn"
              onClick={onSimulatePriceDrop}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all touch-manipulation cursor-pointer"
              title="محاكاة هبوط سعر سلعة بالسلة أو المفضلة لرؤية التنبيه فوراً"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ تجربة محاكاة هبوط سعر الآن</span>
            </button>

            {!browserNotifEnabled ? (
              <button
                onClick={handleEnableBrowserNotifs}
                className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-2xl bg-emerald-800/70 hover:bg-emerald-700/80 text-emerald-100 text-xs font-bold border border-emerald-600/50 transition-all touch-manipulation cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-emerald-300" />
                <span>تفعيل إشعارات المتصفح الخارجية</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-emerald-800/40 text-emerald-300 text-[11px] font-bold border border-emerald-700/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>إشعارات المتصفح مفعلة ونشطة</span>
              </div>
            )}
          </div>
        </div>

        {/* شريط الإحصائيات السريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
          <div className="bg-emerald-900/50 rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-[11px] text-emerald-200 font-medium">التنبيهات غير المقروءة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-0.5">
              {unreadCount}
            </div>
          </div>

          <div className="bg-emerald-900/50 rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-[11px] text-emerald-200 font-medium">سلع المفضلة المراقبة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {favorites.length}
            </div>
          </div>

          <div className="bg-emerald-900/50 rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-[11px] text-emerald-200 font-medium">سلع السلة المراقبة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {cart.length}
            </div>
          </div>

          <div className="bg-emerald-900/50 rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-[11px] text-emerald-200 font-medium">وفر التنبيهات المرصود</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 mt-0.5">
              {totalNotifSavings.toFixed(2)} <span className="text-xs font-sans">ر.س</span>
            </div>
          </div>
        </div>
      </div>

      {/* شريط التبويبات الفرعية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            id="subtab-notifications"
            onClick={() => setActiveSubTab('notifications')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'notifications'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>سجل إشعارات الهبوط</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeSubTab === 'notifications'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            id="subtab-favorites"
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'favorites'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span>قائمتي المفضلة</span>
            <span className="text-[11px] font-mono opacity-80">({favorites.length})</span>
          </button>

          <button
            id="subtab-cart"
            onClick={() => setActiveSubTab('cart')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'cart'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>سلع السلة المراقبة تلقائياً</span>
            <span className="text-[11px] font-mono opacity-80">({cart.length})</span>
          </button>
        </div>

        {activeSubTab === 'notifications' && notifications.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onMarkAllNotificationsAsRead}
              className="text-xs text-slate-600 hover:text-emerald-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              تحديد الكل كمقروء
            </button>
            <button
              onClick={onClearNotifications}
              className="text-xs text-slate-400 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              مسح السجل
            </button>
          </div>
        )}

        {activeSubTab === 'favorites' && (
          <button
            onClick={() => setShowAddFavoritePicker(!showAddFavoritePicker)}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer self-end sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>إضافة سلعة للمفضلة</span>
          </button>
        )}
      </div>

      {/* منتقي إضافة سلعة جديدة للمفضلة */}
      {showAddFavoritePicker && activeSubTab === 'favorites' && (
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>اختر سلعة لإضافتها للمفضلة وتفعيل تنبيه الهبوط عليها</span>
            </h3>
            <button
              onClick={() => setShowAddFavoritePicker(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              إغلاق
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="ابحث في السلع المتاحة (أرز، حليب، زيت، دجاج...)"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full text-xs pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {nonFavoriteProducts.slice(0, 9).map((prod) => {
              const { lowestPrice, store } = getProductLowestPrice(prod, stores);
              return (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-slate-50/70 transition-all text-right"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl p-1 bg-white rounded-lg shadow-2xs shrink-0">
                      {prod.imageUrl}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {prod.nameAr}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        أقل سعر: {lowestPrice.toFixed(2)} ر.س ({store?.name.split(' ')[0]})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onToggleFavorite(prod.id);
                      setShowAddFavoritePicker(false);
                    }}
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs shrink-0 transition-colors"
                    title="أضف للمفضلة"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* محتوى التبويب 1: سجل الإشعارات الواردة */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">لا توجد تنبيهات جديدة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                سيعلمك نظام حكيم AI فور انخفاض أسعار السلع المضافة في سلة مشترياتك أو في قائمتك المفضلة تلقائياً.
              </p>
              <button
                onClick={onSimulatePriceDrop}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>محاكاة هبوط سعر لتجربة التنبيه</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {notifications.map((notif) => {
                const isItemInCart = cart.some((c) => c.productId === notif.productId);

                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
                      notif.isRead
                        ? 'bg-white border-slate-200/80 opacity-90'
                        : 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* رأس البطاقة */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <span>{notif.storeLogo}</span>
                            <span>{notif.storeName}</span>
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              notif.source === 'cart'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-rose-100 text-rose-900 border border-rose-200'
                            }`}
                          >
                            {notif.source === 'cart' ? '🛒 سلعة في سلتك' : '❤️ في مفضلتك'}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono font-medium">
                          {notif.timestamp}
                        </div>
                      </div>

                      {/* تفاصيل المنتج والأسعار */}
                      <div className="flex items-start gap-3 my-2">
                        <span className="text-3xl p-2 bg-white rounded-xl border border-slate-100 shadow-2xs shrink-0">
                          {notif.productImage}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 text-sm leading-snug">
                            {notif.productName}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>

                      {/* صندوق المقارنة السعرية والوفر */}
                      <div className="bg-white rounded-xl p-3 border border-slate-100 my-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">السعر السابق</span>
                          <span className="line-through font-mono text-xs text-slate-400">
                            {notif.oldPriceSar.toFixed(2)} ر.س
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-emerald-700 font-bold block">السعر الجديد الآن</span>
                          <span className="font-mono text-base font-black text-emerald-700">
                            {notif.newPriceSar.toFixed(2)} ر.س
                          </span>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-rose-600 font-bold block">قيمة التوفير</span>
                          <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            -{notif.savingSar.toFixed(2)} ر.س ({notif.savingPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* الأزرار التفاعلية السريعة المحسنة */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 mt-2 flex-wrap sm:flex-nowrap">
                      {/* زر إضافة للسلة */}
                      <button
                        onClick={() => handleQuickAdd(notif.productId, notif.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                          addedFeedbackId === notif.id
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                            : isItemInCart
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {addedFeedbackId === notif.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
                            <span>تمت الإضافة للسلة! ✓</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isItemInCart ? 'بالسلة (زيادة +1)' : 'أضف للسلة فوراً'}</span>
                          </>
                        )}
                      </button>

                      {/* زر البديل الأرخص الذكي */}
                      <button
                        onClick={() => setSelectedNotifForAlternative(notif)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                        title="فحص المتاجر المنافسة والبدائل الأوفر"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>عرض البديل الأرخص</span>
                      </button>

                      {/* زر مقارنة المتاجر */}
                      <button
                        onClick={() => onNavigateTab('matrix')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="مقارنة السعر عبر جميع المتاجر"
                      >
                        <StoreIcon className="w-4 h-4 text-slate-600" />
                      </button>

                      {/* زر تمييز كمقروء */}
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkNotificationAsRead(notif.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                          title="تحديد كمقروء"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* محتوى التبويب 2: قائمة المفضلة */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">قائمة المفضلة فارغة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                اضغط على أيقونة القلب <Heart className="w-3.5 h-3.5 inline text-rose-500" /> على أي سلعة في المنصة لإضافتها هنا ومتابعة انخفاض سعرها عبر المتاجر السعودية تلقائياً.
              </p>
              <button
                onClick={() => setShowAddFavoritePicker(true)}
                className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سلعة الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProducts.map((prod) => {
                const { lowestPrice, store } = getProductLowestPrice(prod, stores);
                const existingAlert = alerts.find((a) => a.productId === prod.id);
                const isItemInCart = cart.some((c) => c.productId === prod.id);

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 p-4 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* رأس البطاقة */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {prod.category}
                        </span>

                        <button
                          onClick={() => onToggleFavorite(prod.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="إزالة من المفضلة"
                        >
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                        </button>
                      </div>

                      {/* صورة وتفاصيل السلعة */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                          {prod.imageUrl}
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug">
                            {prod.nameAr}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {prod.unit}
                          </span>
                        </div>
                      </div>

                      {/* أرخص متجر وسعره */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">أرخص سعر حالياً:</span>
                          <div className="font-mono font-black text-emerald-700 text-sm">
                            {lowestPrice.toFixed(2)} ر.س
                          </div>
                        </div>

                        {store && (
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>المتجر الأوفر:</span>
                            <span className="font-bold inline-flex items-center gap-1 text-slate-900">
                              <span>{store.logo}</span>
                              <span>{store.name}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ضبط السعر المستهدف لتنبيه الهبوط */}
                      <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200/60 mb-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                            <Bell className="w-3.5 h-3.5 text-emerald-700" />
                            <span>تنبيه السعر المستهدف</span>
                          </span>

                          <button
                            onClick={() => onToggleAlertEnabled(prod.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              existingAlert?.enabled !== false
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {existingAlert?.enabled !== false ? 'مفعّل' : 'معطّل'}
                          </button>
                        </div>

                        {editingTargetId === prod.id ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="number"
                              step="0.5"
                              placeholder={`مثال: ${(lowestPrice * 0.9).toFixed(1)}`}
                              value={customTargetPrice}
                              onChange={(e) => setCustomTargetPrice(e.target.value)}
                              className="w-full text-xs p-1.5 rounded-lg border border-emerald-300 bg-white focus:outline-hidden font-mono text-center"
                            />
                            <button
                              onClick={() => handleSaveTarget(prod.id)}
                              className="py-1.5 px-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingTargetId(null)}
                              className="py-1.5 px-2 rounded-lg bg-slate-200 text-slate-600 font-bold text-xs"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 text-[11px]">
                              نبهني عند أقل من:{' '}
                              <strong className="text-emerald-800 font-mono font-black">
                                {existingAlert?.targetPriceSar
                                  ? `${existingAlert.targetPriceSar.toFixed(2)} ر.س`
                                  : `${(lowestPrice * 0.95).toFixed(2)} ر.س`}
                              </strong>
                            </span>
                            <button
                              onClick={() => {
                                setEditingTargetId(prod.id);
                                setCustomTargetPrice(
                                  existingAlert?.targetPriceSar
                                  ? existingAlert.targetPriceSar.toString()
                                  : (lowestPrice * 0.95).toFixed(2)
                                );
                              }}
                              className="text-[10px] text-emerald-700 font-bold underline cursor-pointer"
                            >
                              تعديل
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* أزرار السلة وتاريخ الأسعار */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onAddToCart(prod.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isItemInCart
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isItemInCart ? 'في السلة (+1)' : 'أضف للسلة'}</span>
                      </button>

                      <button
                        onClick={() => onOpenPriceHistory(prod)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="عرض تاريخ الأسعار التفاعلي"
                      >
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* محتوى التبويب 3: سلع السلة المراقبة تلقائياً */}
      {activeSubTab === 'cart' && (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3 text-right">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-950">
                المراقبة التلقائية لسلع سلة المشتريات
              </h4>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                كل منتج تضعه في سلة مشترياتك يقوم خوارزم حكيم AI برصد أسعاره في باقي المتاجر السعودية. إذا انخفض سعره في متجر آخر أو أُطلق عليه عرض أو كود خصم، ستتلقى إشعاراً فورياً مع اقتراح تبديل المتجر أو استخدام التقسيم الذكي.
              </p>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-2xl">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">سلة مشترياتك فارغة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                أضف السلع التي ترغب بشرائها، وسنبدأ برصد أسعارها وإبلاغك بأي خصم فوري.
              </p>
              <button
                onClick={() => onNavigateTab('home')}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>تصفح عروض اليوم</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-3 px-4">السلعة في السلة</th>
                      <th className="py-3 px-3 text-center">الكمية</th>
                      <th className="py-3 px-3 text-center">أرخص سعر حالياً</th>
                      <th className="py-3 px-3 text-center">المتجر الأوفر</th>
                      <th className="py-3 px-3 text-center">حالة المراقبة</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {cartProducts.map((prod) => {
                      const itemInCart = cart.find((c) => c.productId === prod.id);
                      const { lowestPrice, store } = getProductLowestPrice(prod, stores);
                      const isFav = favorites.includes(prod.id);

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl p-1 bg-slate-100 rounded-lg shrink-0">
                                {prod.imageUrl}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900">{prod.nameAr}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {prod.unit} • {prod.category}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold">
                            {itemInCart?.quantity || 1}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-black text-emerald-700 text-sm">
                              {lowestPrice.toFixed(2)} ر.س
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            {store ? (
                              <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                <span>{store.logo}</span>
                                <span>{store.name}</span>
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              <span>مراقبة حية نشطة</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onToggleFavorite(prod.id)}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  isFav
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                                }`}
                                title={isFav ? 'في المفضلة' : 'أضف للمفضلة أيضاً'}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600' : ''}`} />
                              </button>

                              <button
                                onClick={() => onOpenPriceHistory(prod)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="سجل الأسعار"
                              >
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* نافذة البديل الأوفر للصفقة المنبثقة */}
      <CheaperAlternativeModal
        isOpen={!!selectedNotifForAlternative}
        onClose={() => setSelectedNotifForAlternative(null)}
        notification={selectedNotifForAlternative}
        products={products}
        stores={stores}
        cart={cart}
        onAddToCart={onAddToCart}
        onSwapProductInCart={onSwapProductInCart}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
