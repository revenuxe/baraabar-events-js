
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'tailor', 'customer');
CREATE TYPE public.booking_status AS ENUM ('draft','pending','confirmed','picked_up','measuring','stitching','ready','out_for_delivery','delivered','cancelled');
CREATE TYPE public.measurement_mode AS ENUM ('doorstep','self','saved');

-- ============ UTILITY: updated_at ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ SIGNUP TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATALOG: CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  image_url TEXT,
  accent TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CATALOG: SUBCATEGORIES ============
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);
GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT ALL ON public.subcategories TO service_role;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage subcategories" ON public.subcategories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_subcategories_updated BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CATALOG: GARMENT TYPES ============
CREATE TABLE public.garment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_price_min INT,
  base_price_max INT,
  measurement_fields TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.garment_types TO anon, authenticated;
GRANT ALL ON public.garment_types TO service_role;
ALTER TABLE public.garment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read garment types" ON public.garment_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage garment types" ON public.garment_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_garment_types_updated BEFORE UPDATE ON public.garment_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CATALOG: STYLE PRESETS ============
CREATE TABLE public.style_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_type_id UUID NOT NULL REFERENCES public.garment_types(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(garment_type_id, slug)
);
GRANT SELECT ON public.style_presets TO anon, authenticated;
GRANT ALL ON public.style_presets TO service_role;
ALTER TABLE public.style_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read style presets" ON public.style_presets FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage style presets" ON public.style_presets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CATALOG: OCCASIONS ============
CREATE TABLE public.occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.occasions TO anon, authenticated;
GRANT ALL ON public.occasions TO service_role;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read occasions" ON public.occasions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage occasions" ON public.occasions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CATALOG: FABRIC TYPES ============
CREATE TABLE public.fabric_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fabric_types TO anon, authenticated;
GRANT ALL ON public.fabric_types TO service_role;
ALTER TABLE public.fabric_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fabric types" ON public.fabric_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage fabric types" ON public.fabric_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ADDRESSES ============
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MEASUREMENT PROFILES ============
CREATE TABLE public.measurement_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My measurements',
  unit TEXT NOT NULL DEFAULT 'cm' CHECK (unit IN ('cm','in')),
  values JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.measurement_profiles TO authenticated;
GRANT ALL ON public.measurement_profiles TO service_role;
ALTER TABLE public.measurement_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own measurements" ON public.measurement_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_measurement_profiles_updated BEFORE UPDATE ON public.measurement_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BOOKINGS ============
CREATE SEQUENCE public.booking_number_seq START 1001;

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE DEFAULT ('BR' || nextval('public.booking_number_seq')),
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.subcategories(id),
  garment_type_id UUID REFERENCES public.garment_types(id),
  occasion_id UUID REFERENCES public.occasions(id),
  style_preset_id UUID REFERENCES public.style_presets(id),
  quantity INT NOT NULL DEFAULT 1,
  notes TEXT,
  wants_stylist_call BOOLEAN NOT NULL DEFAULT false,
  measurement_mode public.measurement_mode,
  measurement_profile_id UUID REFERENCES public.measurement_profiles(id) ON DELETE SET NULL,
  measurement_snapshot JSONB,
  pickup_address_id UUID REFERENCES public.addresses(id),
  delivery_address_id UUID REFERENCES public.addresses(id),
  pickup_date DATE,
  pickup_window TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  estimated_price_min INT,
  estimated_price_max INT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'tailor'));
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users cancel own bookings" ON public.bookings FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_bookings_user ON public.bookings(user_id, created_at DESC);

-- ============ BOOKING REFERENCES ============
CREATE TABLE public.booking_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_references TO authenticated;
GRANT ALL ON public.booking_references TO service_role;
ALTER TABLE public.booking_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage booking refs" ON public.booking_references FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));

-- ============ BOOKING STATUS EVENTS ============
CREATE TABLE public.booking_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status public.booking_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.booking_status_events TO authenticated;
GRANT ALL ON public.booking_status_events TO service_role;
ALTER TABLE public.booking_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read status events" ON public.booking_status_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'tailor'))));

-- ============ WISHLIST ============
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garment_type_id UUID NOT NULL REFERENCES public.garment_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, garment_type_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published reviews" ON public.reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SEED CATALOG ============
INSERT INTO public.categories (slug,name,tagline,sort_order,accent) VALUES
 ('women','Women','Dresses, blouses, kurtis',1,'from-fuchsia-500/70 to-purple-700/70'),
 ('men','Men','Suits, shirts, kurtas',2,'from-indigo-600/70 to-purple-800/70'),
 ('wedding','Wedding','Sherwanis, lehengas, gowns',3,'from-pink-500/70 to-fuchsia-700/70'),
 ('office','Office','Blazers, trousers, formals',4,'from-slate-800/70 to-indigo-700/70'),
 ('ethnic','Ethnic','Sarees, lehengas, sherwanis',5,'from-rose-500/70 to-purple-700/70'),
 ('kids','Kids','Fun ethnic & casual wear',6,'from-amber-500/70 to-pink-600/70');

INSERT INTO public.occasions (slug,name,sort_order) VALUES
 ('everyday','Everyday',1),('office','Office',2),('wedding','Wedding',3),('party','Party',4),('festive','Festive',5);

INSERT INTO public.fabric_types (slug,name) VALUES
 ('cotton','Cotton'),('silk','Silk'),('linen','Linen'),('wool','Wool'),('velvet','Velvet'),('georgette','Georgette'),('chiffon','Chiffon');

-- Garment types linked by category slug
INSERT INTO public.garment_types (category_id,slug,name,description,base_price_min,base_price_max,measurement_fields,sort_order) VALUES
 ((SELECT id FROM public.categories WHERE slug='women'),'blouse','Blouse','Custom-fit blouse stitched to your silhouette',999,2499,ARRAY['chest','shoulder','sleeve','blouseLength','neck'],1),
 ((SELECT id FROM public.categories WHERE slug='women'),'lehenga','Lehenga','Flared, fitted or mermaid — your call',4999,14999,ARRAY['waist','hip','lehengaLength'],2),
 ((SELECT id FROM public.categories WHERE slug='women'),'kurti','Kurti','Everyday and festive kurtis',1499,3999,ARRAY['chest','shoulder','sleeve','waist','kurtaLength'],3),
 ((SELECT id FROM public.categories WHERE slug='women'),'dress','Dress','A-line, bodycon, gowns',2499,7999,ARRAY['chest','shoulder','sleeve','waist','hip','dressLength'],4),
 ((SELECT id FROM public.categories WHERE slug='women'),'saree-fall','Saree fall & pico',NULL,299,599,ARRAY['waist','hip'],5),
 ((SELECT id FROM public.categories WHERE slug='men'),'shirt','Shirt','Formal & casual shirts',899,2499,ARRAY['chest','shoulder','sleeve','waist','shirtLength','neck'],1),
 ((SELECT id FROM public.categories WHERE slug='men'),'trouser','Trouser','Formal & chino trousers',1099,2999,ARRAY['waist','hip','inseam','thigh'],2),
 ((SELECT id FROM public.categories WHERE slug='men'),'kurta','Kurta','Classic and modern kurtas',1499,3999,ARRAY['chest','shoulder','sleeve','waist','kurtaLength'],3),
 ((SELECT id FROM public.categories WHERE slug='men'),'suit','Suit','2- or 3-piece suits',7999,19999,ARRAY['chest','shoulder','sleeve','waist','hip','inseam'],4),
 ((SELECT id FROM public.categories WHERE slug='men'),'blazer','Blazer','Business & wedding blazers',3999,9999,ARRAY['chest','shoulder','sleeve','waist'],5),
 ((SELECT id FROM public.categories WHERE slug='wedding'),'sherwani','Sherwani','Groom sherwanis, achkans, bandhgalas',8999,24999,ARRAY['chest','shoulder','sleeve','waist','kurtaLength'],1),
 ((SELECT id FROM public.categories WHERE slug='wedding'),'bridal-lehenga','Bridal Lehenga','Statement bridal lehengas',12999,39999,ARRAY['waist','hip','lehengaLength'],2),
 ((SELECT id FROM public.categories WHERE slug='office'),'formal-shirt','Formal Shirt',NULL,1099,2499,ARRAY['chest','shoulder','sleeve','waist','shirtLength','neck'],1),
 ((SELECT id FROM public.categories WHERE slug='office'),'formal-trouser','Formal Trouser',NULL,1299,2999,ARRAY['waist','hip','inseam','thigh'],2);

-- Style presets (a starter set)
INSERT INTO public.style_presets (garment_type_id,slug,name,sort_order) VALUES
 ((SELECT id FROM public.garment_types WHERE slug='shirt'),'classic','Classic collar',1),
 ((SELECT id FROM public.garment_types WHERE slug='shirt'),'mandarin','Mandarin',2),
 ((SELECT id FROM public.garment_types WHERE slug='shirt'),'cuban','Cuban camp',3),
 ((SELECT id FROM public.garment_types WHERE slug='kurta'),'straight','Straight cut',1),
 ((SELECT id FROM public.garment_types WHERE slug='kurta'),'anarkali','Anarkali',2),
 ((SELECT id FROM public.garment_types WHERE slug='kurta'),'pathani','Pathani',3),
 ((SELECT id FROM public.garment_types WHERE slug='sherwani'),'achkan','Achkan',1),
 ((SELECT id FROM public.garment_types WHERE slug='sherwani'),'bandhgala','Bandhgala',2),
 ((SELECT id FROM public.garment_types WHERE slug='sherwani'),'jodhpuri','Jodhpuri',3),
 ((SELECT id FROM public.garment_types WHERE slug='suit'),'2piece','Two-piece',1),
 ((SELECT id FROM public.garment_types WHERE slug='suit'),'3piece','Three-piece',2),
 ((SELECT id FROM public.garment_types WHERE slug='suit'),'tux','Tuxedo',3),
 ((SELECT id FROM public.garment_types WHERE slug='blouse'),'deep-back','Deep back',1),
 ((SELECT id FROM public.garment_types WHERE slug='blouse'),'high-neck','High neck',2),
 ((SELECT id FROM public.garment_types WHERE slug='blouse'),'puff','Puff sleeve',3),
 ((SELECT id FROM public.garment_types WHERE slug='blouse'),'corset','Corset',4),
 ((SELECT id FROM public.garment_types WHERE slug='lehenga'),'aline','A-line',1),
 ((SELECT id FROM public.garment_types WHERE slug='lehenga'),'flare','Full flare',2),
 ((SELECT id FROM public.garment_types WHERE slug='lehenga'),'mermaid','Mermaid',3),
 ((SELECT id FROM public.garment_types WHERE slug='lehenga'),'jacket','Jacket lehenga',4);
