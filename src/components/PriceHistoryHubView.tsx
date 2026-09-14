import React, { useState } from 'react';
import { Product, Store, StorePriceInfo } from '../types.ts';
import { ProductPriceHistoryChart } from './ProductPriceHistoryChart.tsx';
import {
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  ArrowDownRight,
  ShoppingBag,
  HelpCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface PriceHistoryHubViewProps {
  products: Product[];
  stores: Store[];
  onAddToCart: (productId: string) => void;
  cartProductIds: string[];
}

export const PriceHistoryHubView: React.FC<PriceHistoryHubViewProps> = ({
  products,
  stores,
  onAddToCart,
  cartProductIds,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'p1');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');

  const categories = [
    'الكل',
    'ألبان وأجبان',
    'مؤن وحبوب',
    'زيوت ودهون',
    'لحوم ودواجن',
    'عناية ومنظفات',
    'مشروبات وقهوة',
    'تمور ومكسرات',
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'الكل' || p.category === categoryFilter;
    const matchesSearch =
      p.nameAr.includes(searchQuery) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  return (
    <div className="space-y-6" id="price-history-hub-view">
      {/* بطاقة الشرح والتوجيه الذكي */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-black px-2.5 py-1 rounded-md border border-emerald-400/30 inline-flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              مؤشر قرارات الشراء الذكية
            </span>
            <span className="text-xs text-slate-300">| لشهر سبتمبر 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            تاريخ تغير الأسعار التفاعلي عبر Recharts
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            راقب تذبذب أسعار السلع الغذائية والاستهلاكية عبر المتاجر السعودية الكبرى (بنده، العثيم، الدانوب، كارفور، أمازون، ولولو) طوال أيام الشهر الحالي، واكتشف هل التوقيت مناسب للشراء فوراً أم الأفضل الانتظار حتى صدور عروض نهاية الأسبوع.
          </p>
        </div>
      </div>

      {/* اختيار المنتج للتحليل */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* قائمة السلع للاختيار */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 h-fit">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">اختر السلعة للمراقبة:</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              <input
                type="text"
                placeholder="بحث سريع..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-2.5 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isSelected = product.id === selectedProductId;
              // الحصول على أقل سعر حالي
              const currentPrices = (Object.values(product.prices) as StorePriceInfo[])
                .filter(p => p && p.inStock)
                .map(p => p.priceInclVat);
              const minPrice = currentPrices.length ? Math.min(...currentPrices) : 0;

              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`w-full text-right p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl p-1 bg-slate-100 rounded-lg shrink-0">
                      {product.imageUrl}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-emerald-900' : 'text-slate-800'
                        }`}
                      >
                        {product.nameAr}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{product.unit}</div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="font-mono text-xs font-black text-emerald-700">
                      {minPrice.toFixed(2)}
                    </div>
                    <span className="text-[9px] text-slate-400">ر.س</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* مساحة الرسم البياني التفاعلي Recharts */}
        <div className="lg:col-span-3">
          {selectedProduct && (
            <ProductPriceHistoryChart
              product={selectedProduct}
              stores={stores}
              onAddToCart={onAddToCart}
              isAlreadyInCart={cartProductIds.includes(selectedProduct.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
