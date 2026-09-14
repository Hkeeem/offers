export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- مساعد التوفير الذكي (Smart Deal AI) - مخطط قاعدة بيانات Supabase / PostgreSQL
-- متوافق بالكامل مع هيئة الزكاة والضريبة والجمارك (ZATCA) وضريبة 15%
-- ====================================================================

-- تفعيل ملحقات uuid و pg_trgm للبحث السريع في المنتجات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. جدول المتاجر السعودية (Stores)
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY, -- e.g. 'panda', 'othaim', 'danube', 'amazon_sa'
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#008752',
    delivery_fee NUMERIC(8, 2) NOT NULL DEFAULT 15.00,
    free_delivery_threshold NUMERIC(8, 2) NOT NULL DEFAULT 150.00,
    minimum_order NUMERIC(8, 2) NOT NULL DEFAULT 40.00,
    delivery_sla TEXT DEFAULT 'خلال ساعتين',
    rating NUMERIC(3, 2) DEFAULT 4.5,
    branches_count INT DEFAULT 50,
    supported_cities TEXT[] DEFAULT ARRAY['الرياض', 'جدة', 'الدمام'],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول تصنيفات المنتجات (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    slug TEXT UNIQUE NOT NULL
);

-- 3. جدول المنتجات الأساسي (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    unit TEXT NOT NULL, -- e.g. 'عبوة 2 لتر', 'كيس 5 كجم'
    barcode TEXT UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرس بحث باللغة العربية على اسم المنتج
CREATE INDEX IF NOT EXISTS idx_products_name_ar_trgm ON public.products USING gin (name_ar gin_trgm_ops);

-- 4. جدول أسعار المنتجات في المتاجر وضريبة 15% (Store Product Prices)
-- العمود price_incl_vat محسوب تلقائياً كعمود تخزين فيزيائي STORED
CREATE TABLE IF NOT EXISTS public.store_product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    price_excl_vat NUMERIC(10, 2) NOT NULL CHECK (price_excl_vat >= 0),
    vat_rate NUMERIC(4, 2) NOT NULL DEFAULT 15.00 CHECK (vat_rate = 15.00),
    -- السعر المحتسب تلقائياً شاملاً الضريبة وفق معايير ZATCA
    price_incl_vat NUMERIC(10, 2) GENERATED ALWAYS AS (
        ROUND(price_excl_vat * (1 + vat_rate / 100.0), 2)
    ) STORED,
    in_stock BOOLEAN DEFAULT TRUE,
    is_promo BOOLEAN DEFAULT FALSE,
    original_price_incl_vat NUMERIC(10, 2),
    promo_expires_at TIMESTAMPTZ,
    last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_product_store UNIQUE (product_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_prices_store_product ON public.store_product_prices (store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_prices_incl_vat ON public.store_product_prices (price_incl_vat);

-- 5. جدول الكوبونات والعروض النشطة (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount NUMERIC(10, 2), -- للنسب المئوية
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    description TEXT,
    verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_store_coupon UNIQUE (store_id, code)
);

-- 6. جدول سجل تاريخ الأسعار لمتابعة الخصومات الحقيقية والوهمية (Price History)
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    recorded_price_incl_vat NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- دوال SQL المتقدمة لاحتساب السلة والضريبة والتوفير (Supabase RPC)
-- ====================================================================

-- دالة تحليل تكلفة سلة المتجر مع تطبيق الكوبون وتوصيل الشحن والضريبة
CREATE OR REPLACE FUNCTION public.calculate_store_basket_cost(
    p_store_id TEXT,
    p_product_ids UUID[],
    p_quantities INT[]
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_store public.stores%ROWTYPE;
    v_total_incl_vat NUMERIC(10, 2) := 0;
    v_delivery_fee NUMERIC(10, 2) := 0;
    v_best_discount NUMERIC(10, 2) := 0;
    v_applied_code TEXT := NULL;
    v_final_total NUMERIC(10, 2) := 0;
    v_vat_amount NUMERIC(10, 2) := 0;
    v_subtotal_excl_vat NUMERIC(10, 2) := 0;
    v_i INT;
    v_unit_price NUMERIC(10, 2);
    v_in_stock BOOLEAN;
    v_missing_count INT := 0;
BEGIN
    SELECT * INTO v_store FROM public.stores WHERE id = p_store_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'المتجر غير مسجل: %', p_store_id;
    END IF;

    -- حساب مجموع أسعار المنتجات المتوفرة
    FOR v_i IN 1..array_length(p_product_ids, 1) LOOP
        SELECT price_incl_vat, in_stock
        INTO v_unit_price, v_in_stock
        FROM public.store_product_prices
        WHERE product_id = p_product_ids[v_i] AND store_id = p_store_id;

        IF FOUND AND v_in_stock THEN
            v_total_incl_vat := v_total_incl_vat + (v_unit_price * p_quantities[v_i]);
        ELSE
            v_missing_count := v_missing_count + 1;
        END IF;
    END LOOP;

    -- حساب الضريبة والمبلغ قبل الضريبة
    v_subtotal_excl_vat := ROUND(v_total_incl_vat / 1.15, 2);
    v_vat_amount := v_total_incl_vat - v_subtotal_excl_vat;

    -- رسوم الشحن
    IF v_total_incl_vat >= v_store.free_delivery_threshold OR v_total_incl_vat = 0 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := v_store.delivery_fee;
    END IF;

    -- فحص أفضل كوبون خصم ساري
    SELECT code,
           CASE 
             WHEN discount_type = 'FIXED' THEN LEAST(discount_value, v_total_incl_vat)
             ELSE LEAST(ROUND((v_total_incl_vat * discount_value / 100.0), 2), COALESCE(max_discount, 99999))
           END
    INTO v_applied_code, v_best_discount
    FROM public.coupons
    WHERE store_id = p_store_id
      AND is_active = TRUE
      AND valid_until >= NOW()
      AND v_total_incl_vat >= min_spend
    ORDER BY 2 DESC
    LIMIT 1;

    v_best_discount := COALESCE(v_best_discount, 0);
    v_final_total := GREATEST(0, v_total_incl_vat + v_delivery_fee - v_best_discount);

    RETURN jsonb_build_object(
        'store_id', p_store_id,
        'store_name', v_store.name_ar,
        'items_incl_vat', v_total_incl_vat,
        'subtotal_excl_vat', v_subtotal_excl_vat,
        'vat_amount_15', v_vat_amount,
        'delivery_fee', v_delivery_fee,
        'coupon_discount', v_best_discount,
        'applied_coupon', v_applied_code,
        'grand_total_sar', v_final_total,
        'missing_items_count', v_missing_count
    );
END;
$$;

-- سياسات الأمان RLS (Row Level Security) للقراءة المفتوحة والتحكم الإداري
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السماح للجميع بقراءة المتاجر" ON public.stores FOR SELECT USING (true);
CREATE POLICY "السماح للجميع بقراءة المنتجات" ON public.products FOR SELECT USING (true);
CREATE POLICY "السماح للجميع بقراءة الأسعار" ON public.store_product_prices FOR SELECT USING (true);
CREATE POLICY "السماح للجميع بقراءة الكوبونات النشطة" ON public.coupons FOR SELECT USING (is_active = true);
`;
