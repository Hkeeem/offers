import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { HakeemHomeView } from './components/HakeemHomeView.tsx';
import { HakeemMapsView } from './components/HakeemMapsView.tsx';
import { HakeemRewardsView } from './components/HakeemRewardsView.tsx';
import { CartOptimizerView } from './components/CartOptimizerView.tsx';
import { PriceMatrixView } from './components/PriceMatrixView.tsx';
import { CouponsView } from './components/CouponsView.tsx';
import { AiAssistantView } from './components/AiAssistantView.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { PriceHistoryHubView } from './components/PriceHistoryHubView.tsx';
import { ProductPriceHistoryChart } from './components/ProductPriceHistoryChart.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { PriceAlertsWishlistView } from './components/PriceAlertsWishlistView.tsx';
import { PriceAlertToast } from './components/PriceAlertToast.tsx';
import { QuickListView } from './components/QuickListView.tsx';
import { SmartBotsView } from './components/SmartBotsView.tsx';
import { ImageSearchView } from './components/ImageSearchView.tsx';
import { OptimalShoppingTimesView } from './components/OptimalShoppingTimesView.tsx';
import { CartItem, Product, Store, Coupon, CartOptimizationResponse, PriceAlert, PriceAlertNotification, StoreCategoryId } from './types.ts';
import { SAUDI_PRODUCTS, SAUDI_STORES, SAUDI_COUPONS, STORE_CATEGORIES_CONFIG } from './data/saudiData.ts';
import { runCartOptimization } from './lib/cartOptimizer.ts';
import {
  getStoredFavorites,
  saveStoredFavorites,
  getStoredAlerts,
  saveStoredAlerts,
  getStoredNotifications,
  saveStoredNotifications,
  playChimeSound,
  sendBrowserNotification,
  getProductLowestPrice,
} from './lib/priceAlertsManager.ts';
import { Globe, Mail, ExternalLink, Filter, RotateCcw } from 'lucide-react';
import { HkeemLogo } from './components/HkeemLogo.tsx';
import { CheaperAlternativeModal } from './components/CheaperAlternativeModal.tsx';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.tsx';
import { VoiceFloatingTrigger } from './components/VoiceFloatingTrigger.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'quicklist' | 'image-search' | 'cart' | 'matrix' | 'bots' | 'history' | 'analysis' | 'coupons' | 'chat' | 'maps' | 'rewards' | 'schema' | 'alerts' | 'shopping-times'
  >('home');
  const [selectedCity, setSelectedCity] = useState('الرياض');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<StoreCategoryId>('all');
  const [selectedChartProduct, setSelectedChartProduct] = useState<Product | null>(null);
  const [selectedToastAlternative, setSelectedToastAlternative] = useState<PriceAlertNotification | null>(null);

  // تصفية المتاجر بحسب المدينة وفئة المتاجر المحددة من قبل المستخدم
  const filteredStores = useMemo(() => {
    const byCity = SAUDI_STORES.filter(
      (s) =>
        s.supportedCities.includes('كافة مدن ومحافظات المملكة') ||
        s.supportedCities.includes(selectedCity)
    );

    if (selectedStoreCategory === 'all') {
      return byCity.length > 0 ? byCity : SAUDI_STORES;
    }

    const byCategory = byCity.filter((s) => s.category === selectedStoreCategory);
    return byCategory.length > 0 ? byCategory : (byCity.length > 0 ? byCity : SAUDI_STORES);
  }, [selectedCity, selectedStoreCategory]);

  const activeCategoryConfig = useMemo(() => {
    return (
      STORE_CATEGORIES_CONFIG.find((c) => c.id === selectedStoreCategory) ||
      STORE_CATEGORIES_CONFIG[0]
    );
  }, [selectedStoreCategory]);

  // سلة المشتريات الافتراضية لعائلة سعودية
  const [cart, setCart] = useState<CartItem[]>([
    { productId: 'p1', quantity: 2 }, // حليب المراعي 2 لتر
    { productId: 'p2', quantity: 1 }, // أرز الشعلان 5 كجم
    { productId: 'p3', quantity: 2 }, // زيت عافية 1.5 لتر
    { productId: 'p4', quantity: 1 }, // طبق بيض الوطنية
    { productId: 'p6', quantity: 2 }, // دجاج التنمية مبرد
    { productId: 'p7', quantity: 1 }, // مسحوق أريال 5 كجم
  ]);

  // حالة المفضلة وتنبيهات الأسعار والإشعارات
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavorites());
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => getStoredAlerts());
  const [notifications, setNotifications] = useState<PriceAlertNotification[]>(() => getStoredNotifications());
  const [currentToast, setCurrentToast] = useState<PriceAlertNotification | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [aiEnhancedOptimization, setAiEnhancedOptimization] = useState<CartOptimizationResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // احتساب الخوارزمية فورياً على جانب العميل وفق المتاجر المفلترة
  const localOptimization = useMemo(() => {
    if (cart.length === 0) return null;
    return runCartOptimization(cart, SAUDI_PRODUCTS, filteredStores, SAUDI_COUPONS);
  }, [cart, filteredStores]);

  // استدعاء خادم Express + Gemini AI لجلب التحليلات المتقدمة وبدائل السلع
  useEffect(() => {
    if (cart.length === 0) {
      setAiEnhancedOptimization(null);
      return;
    }

    let isMounted = true;
    setIsAiLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/optimize-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAiEnhancedOptimization(data);
          }
        }
      } catch (_) {
        // الاعتماد السلس على الحساب المحلي دون إطلاق أخطاء
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [cart]);

  const currentOptimization = aiEnhancedOptimization || localOptimization;

  // مزامنة التنبيهات الافتراضية لعناصر السلة والمفضلة
  useEffect(() => {
    const relevantProductIds = Array.from(new Set([...cart.map(c => c.productId), ...favorites]));
    setAlerts(prev => {
      let changed = false;
      const updated = [...prev];

      relevantProductIds.forEach(pId => {
        const existing = updated.find(a => a.productId === pId);
        const prod = SAUDI_PRODUCTS.find(p => p.id === pId);
        if (!prod) return;

        const { lowestPrice } = getProductLowestPrice(prod, SAUDI_STORES);
        const isCart = cart.some(c => c.productId === pId);
        const isFav = favorites.includes(pId);
        const source = isCart && isFav ? 'both' : isCart ? 'cart' : 'favorite';

        if (!existing) {
          const target = parseFloat((lowestPrice * 0.95).toFixed(2));
          updated.push({
            id: `alert-${pId}`,
            productId: pId,
            targetPriceSar: target,
            currentLowestPriceSar: lowestPrice,
            isEnabled: true,
            createdAt: new Date().toISOString().split('T')[0],
            source,
          });
          changed = true;
        } else {
          if (existing.source !== source || existing.currentLowestPriceSar !== lowestPrice) {
            existing.source = source;
            existing.currentLowestPriceSar = lowestPrice;
            changed = true;
          }
        }
      });

      if (changed) {
        saveStoredAlerts(updated);
        return updated;
      }
      return prev;
    });
  }, [cart, favorites]);

  // تبديل إضافة/إزالة المنتج من المفضلة
  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(productId);
      const next = isFav ? prev.filter(id => id !== productId) : [...prev, productId];
      saveStoredFavorites(next);
      return next;
    });
  }, []);

  // تعديل السعر المستهدف لتنبيه منتج
  const handleSetAlertTargetPrice = useCallback((productId: string, targetPrice: number) => {
    setAlerts(prev => {
      const updated = prev.map(a => (a.productId === productId ? { ...a, targetPriceSar: targetPrice } : a));
      saveStoredAlerts(updated);
      return updated;
    });
  }, []);

  // تفعيل/تعطيل التنبيه
  const handleToggleAlertEnabled = useCallback((productId: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => (a.productId === productId ? { ...a, isEnabled: !a.isEnabled } : a));
      saveStoredAlerts(updated);
      return updated;
    });
  }, []);

  // تمييز الإشعار كمقروء
  const handleMarkNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  // تمييز جميع الإشعارات كمقروءة
  const handleMarkAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  // مسح سجل الإشعارات
  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    saveStoredNotifications([]);
  }, []);

  // محاكاة فورية لهبوط سعر منتج في السلة أو المفضلة لإظهار التنبيه الذكي للمستخدم
  const handleSimulatePriceDrop = useCallback(() => {
    const cartOrFavIds = Array.from(new Set([...cart.map(c => c.productId), ...favorites]));
    const candidateProducts = SAUDI_PRODUCTS.filter(p => cartOrFavIds.includes(p.id));
    const chosenProduct = candidateProducts.length > 0
      ? candidateProducts[Math.floor(Math.random() * candidateProducts.length)]
      : SAUDI_PRODUCTS[0];

    const availableStores = SAUDI_STORES.filter(s => chosenProduct.prices[s.id]?.inStock);
    const chosenStore = availableStores.length > 0
      ? availableStores[Math.floor(Math.random() * availableStores.length)]
      : SAUDI_STORES[0];

    const currentPrice = chosenProduct.prices[chosenStore.id]?.priceInclVat || 25;
    const dropPercent = 18;
    const discountAmount = Math.max(1.5, parseFloat(((currentPrice * dropPercent) / 100).toFixed(2)));
    const newPrice = parseFloat((currentPrice - discountAmount).toFixed(2));
    const isCart = cart.some(c => c.productId === chosenProduct.id);

    const newNotification: PriceAlertNotification = {
      id: `notif-${Date.now()}`,
      alertId: `alert-${chosenProduct.id}`,
      productId: chosenProduct.id,
      productName: chosenProduct.nameAr,
      productImage: chosenProduct.imageUrl,
      storeId: chosenStore.id,
      storeName: chosenStore.name,
      storeLogo: chosenStore.logo,
      oldPriceSar: currentPrice,
      newPriceSar: newPrice,
      savingSar: discountAmount,
      savingPercent: dropPercent,
      timestamp: 'الآن',
      isRead: false,
      source: isCart ? 'cart' : 'favorite',
      message: `عرض استثنائي جديد! انخفض سعر ${chosenProduct.nameAr} في ${chosenStore.name} إلى ${newPrice.toFixed(2)} ر.س، وفرت ${discountAmount.toFixed(2)} ر.س!`,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });

    setCurrentToast(newNotification);
    playChimeSound();
    sendBrowserNotification(
      `🇸🇦 تنبيه هبوط سعر في ${chosenStore.name}!`,
      `انخفض ${chosenProduct.nameAr} إلى ${newPrice.toFixed(2)} ر.س (وفر ${discountAmount.toFixed(2)} ر.س)!`
    );
  }, [cart, favorites]);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { productId, quantity: Math.max(1, quantity) }];
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLoadPreset = (presetType: 'family' | 'essentials' | 'ramadan') => {
    if (presetType === 'family') {
      setCart([
        { productId: 'p1', quantity: 3 }, // حليب المراعي 2 لتر
        { productId: 'p2', quantity: 2 }, // أرز الشعلان 5 كجم
        { productId: 'p3', quantity: 2 }, // زيت عافية
        { productId: 'p4', quantity: 2 }, // بيض الوطنية
        { productId: 'p5', quantity: 1 }, // سكر الأسرة 5 كجم
        { productId: 'p6', quantity: 4 }, // دجاج التنمية
        { productId: 'p7', quantity: 1 }, // أريال 5 كجم
        { productId: 'p8', quantity: 2 }, // شاي ربيع
        { productId: 'p10', quantity: 2 }, // مناديل كلينكس
      ]);
    } else if (presetType === 'essentials') {
      setCart([
        { productId: 'p1', quantity: 1 },
        { productId: 'p3', quantity: 1 },
        { productId: 'p4', quantity: 1 },
        { productId: 'p5', quantity: 1 },
      ]);
    }
  };

  // استبدال منتج في السلة بمنتج بديل صحي مع الحفاظ على الكمية
  const handleSwapProductInCart = (oldProductId: string, newProductId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === oldProductId);
      const qty = existing ? existing.quantity : 1;
      const filtered = prev.filter(item => item.productId !== oldProductId);
      const alreadyHasNew = filtered.find(item => item.productId === newProductId);
      if (alreadyHasNew) {
        return filtered.map(item =>
          item.productId === newProductId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...filtered, { productId: newProductId, quantity: qty }];
    });
  };

  const cartProductIds = cart.map(c => c.productId);
  const cartSubtotal = currentOptimization?.bestSingleStore?.itemsSubtotalInclVat || 0;
  const currentSavingsSar = currentOptimization?.splitStores?.netSavingsVsBestSingleStore || 0;
  const unreadAlertsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* رأس التطبيق والشريط العلوي مع هوية حكيم AI واختيار المدينة وتصفية فئات المتاجر */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedStoreCategory={selectedStoreCategory}
        onSelectStoreCategory={setSelectedStoreCategory}
        unreadAlertsCount={unreadAlertsCount}
        favoritesCount={favorites.length}
        recentNotifications={notifications}
        products={SAUDI_PRODUCTS}
        stores={filteredStores}
        allStores={SAUDI_STORES}
        cart={cart}
        onAddToCart={handleAddToCart}
        onSwapProductInCart={handleSwapProductInCart}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
      />

      {/* المحتوى الرئيسي للمنصة */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* شريط تنبيه الفلترة النشطة لفئات المتاجر */}
        {selectedStoreCategory !== 'all' && (
          <div
            id="active-category-filter-banner"
            className="mb-6 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-sky-950 shadow-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs border border-sky-100">
                {activeCategoryConfig.icon}
              </span>
              <div>
                <div className="font-bold text-sm text-sky-950 flex items-center gap-2">
                  <span>تم تفعيل فلترة المتاجر:</span>
                  <span className="bg-sky-600 text-white text-xs px-2 py-0.5 rounded-lg font-black">
                    {activeCategoryConfig.labelAr}
                  </span>
                  <span className="text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-bold">
                    {filteredStores.length} متاجر في {selectedCity}
                  </span>
                </div>
                <p className="text-xs text-sky-800/80 mt-1">
                  يتم الآن حصر نتائج مقارنة الأسعار ومصفوفة السلع والسلة حصرياً على:{' '}
                  <span className="font-bold text-sky-950">
                    {filteredStores.map((s) => s.name).join('، ')}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStoreCategory('all')}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-sky-100/60 text-sky-900 px-3.5 py-1.5 rounded-xl border border-sky-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-700" />
              <span>إلغاء الفلترة وعرض كافة المتاجر</span>
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <HakeemHomeView
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            onNavigateTab={setActiveTab}
            onSelectProductForChart={prod => setSelectedChartProduct(prod)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          />
        )}

        {/* تبويب القائمة السريعة الجديد */}
        {activeTab === 'quicklist' && (
          <QuickListView
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            cart={cart}
            onAddToCart={handleAddToCart}
            onNavigateTab={setActiveTab}
            onOpenPriceHistory={prod => setSelectedChartProduct(prod)}
          />
        )}

        {/* تبويب البحث بالصور عبر Google Cloud Vision API */}
        {activeTab === 'image-search' && (
          <ImageSearchView
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            cart={cart}
            onAddToCart={handleAddToCart}
            onSwapProductInCart={handleSwapProductInCart}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* تبويب بوتات حكيم الذكية (الشريطي، الوسيط العقاري، رادار العروض، صياد الكوبونات) */}
        {activeTab === 'bots' && (
          <SmartBotsView
            onNavigateTab={setActiveTab}
          />
        )}

        {/* تبويب تنبيهات الأسعار والمفضلة */}
        {activeTab === 'alerts' && (
          <PriceAlertsWishlistView
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            cart={cart}
            favorites={favorites}
            alerts={alerts}
            notifications={notifications}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onSwapProductInCart={handleSwapProductInCart}
            onSetAlertTargetPrice={handleSetAlertTargetPrice}
            onToggleAlertEnabled={handleToggleAlertEnabled}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
            onClearNotifications={handleClearNotifications}
            onSimulatePriceDrop={handleSimulatePriceDrop}
            onNavigateTab={setActiveTab}
            onOpenPriceHistory={prod => setSelectedChartProduct(prod)}
          />
        )}

        {activeTab === 'maps' && (
          <HakeemMapsView
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'shopping-times' && (
          <OptimalShoppingTimesView
            stores={filteredStores}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            cart={cart}
            products={SAUDI_PRODUCTS}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'rewards' && (
          <HakeemRewardsView
            currentCartSavings={currentSavingsSar}
            totalItemsInCart={cart.length}
            onNavigateTab={setActiveTab}
          />
        )}

        {(activeTab === 'cart' || activeTab === 'analysis') && (
          <CartOptimizerView
            cart={cart}
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            optimization={currentOptimization}
            isLoading={isAiLoading}
            initialSubTab={activeTab === 'analysis' ? 'analysis' : 'split'}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onAddToCart={handleAddToCart}
            onLoadPreset={handleLoadPreset}
            onClearCart={handleClearCart}
            onSwapProductInCart={handleSwapProductInCart}
          />
        )}

        {activeTab === 'matrix' && (
          <PriceMatrixView
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onLoadPreset={handleLoadPreset}
            onNavigateTab={setActiveTab}
            cartProductIds={cartProductIds}
            onSwapProductInCart={handleSwapProductInCart}
          />
        )}

        {activeTab === 'history' && (
          <PriceHistoryHubView
            products={SAUDI_PRODUCTS}
            stores={filteredStores}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
          />
        )}

        {activeTab === 'coupons' && (
          <CouponsView
            coupons={SAUDI_COUPONS}
            stores={filteredStores}
            cartSubtotal={cartSubtotal}
          />
        )}

        {activeTab === 'chat' && <AiAssistantView />}

        {activeTab === 'schema' && <ArchitectureView />}
      </main>

      {/* نافذة تفاصيل المنتج والبدائل الصحية وسجل الأسعار المنبثقة */}
      {selectedChartProduct && (
        <ProductDetailModal
          product={selectedChartProduct}
          products={SAUDI_PRODUCTS}
          stores={filteredStores}
          cart={cart}
          onClose={() => setSelectedChartProduct(null)}
          onAddToCart={handleAddToCart}
          onSwapProductInCart={handleSwapProductInCart}
        />
      )}

      {/* توست إشعار هبوط السعر المنبثق */}
      <PriceAlertToast
        notification={currentToast}
        onClose={() => setCurrentToast(null)}
        onAddToCart={(prodId) => {
          handleAddToCart(prodId);
          setCurrentToast(null);
        }}
        onViewAlerts={() => {
          setCurrentToast(null);
          setActiveTab('alerts');
        }}
        onViewCheaperAlternative={(notif) => {
          setSelectedToastAlternative(notif);
          setCurrentToast(null);
        }}
      />

      {/* نافذة البديل الأوفر إذا فُتحت عبر التوست السريع */}
      {selectedToastAlternative && (
        <CheaperAlternativeModal
          isOpen={!!selectedToastAlternative}
          onClose={() => setSelectedToastAlternative(null)}
          notification={selectedToastAlternative}
          products={SAUDI_PRODUCTS}
          stores={SAUDI_STORES}
          cart={cart}
          onAddToCart={handleAddToCart}
          onSwapProductInCart={handleSwapProductInCart}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* الزر العائم للأوامر الصوتية Web Speech API */}
      <VoiceFloatingTrigger onClick={() => setIsVoiceModalOpen(true)} />

      {/* نافذة المساعد الصوتي التفاعلي للتعرف على الكلام */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={SAUDI_PRODUCTS}
        stores={SAUDI_STORES}
        cart={cart}
        onAddToCart={handleAddToCart}
        onSearch={(query) => {
          setActiveTab('matrix');
        }}
        onNavigateTab={setActiveTab}
        onClearCart={handleClearCart}
      />

      {/* التذييل الرسمي المدمج مع alhkmystore.lovable.app */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <HkeemLogo size="sm" withGlow />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm">حكيم AI (HkeeemAI)</span>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                    مساعد التوفير الذكي
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  تسوّق أذكى… وفّر أكثر • مصلحتك أنت أولاً، لا المتجر
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="https://alhkmystore.lovable.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-bold bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>alhkmystore.lovable.app</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="mailto:support@alhkmy.store"
                className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-bold bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>support@alhkmy.store</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>جميع الأسعار مطابقة لأنظمة ضريبة القيمة المضافة 15% (ZATCA)</span>
              <span>•</span>
              <span>تحديث الأسعار والعروض: لحظي ومباشر</span>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <span>© 2026 HkeeemAI — جميع الحقوق محفوظة</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
