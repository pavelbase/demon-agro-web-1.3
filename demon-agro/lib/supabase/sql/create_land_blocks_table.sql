-- ============================================================================
-- DÍLY PŮDNÍCH BLOKŮ (DPB) – evidence pro službu Hnojiva a POR
-- ============================================================================
-- Zdroj dat: sestava "Informativní údaje o DPB" z Portálu farmáře (LPIS),
-- kterou si uživatel nahraje v portálu.
--
-- Záměrně jde o samostatnou entitu oddělenou od tabulky `parcels`:
--   • `parcels` slouží službě Vápnění – uživatel je spravuje ručně a váže na
--     ně rozbory půdy, plány vápnění a poptávky,
--   • `land_blocks` popisují právní stav dílu půdního bloku v LPIS (zranitelná
--     oblast dusíkem, aplikační pásmo, erozní ohroženost, sklonitost,
--     vzdálenost od vody…), tedy údaje, které rozhodují o tom, co a kdy je na
--     pozemku možné aplikovat. Mění se s aktualizací LPIS, ne rozhodnutím
--     uživatele.
--
-- Data jsou vlastnictvím uživatele → RLS podle user_id, admin má čtení.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.land_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identifikace v LPIS
  square_code TEXT NOT NULL,           -- "Čtverec" (např. 620-1020)
  dpb_code TEXT NOT NULL,              -- "Kód DPB" (např. 0801/11)
  cadastral_area TEXT,                 -- "Katastrální území"

  -- Výměry
  area NUMERIC(10, 4) NOT NULL,        -- "Vým. [ha]"
  area_without_features NUMERIC(10, 4),-- "Vým. bez KP" (bez krajinných prvků)
  perimeter_m NUMERIC(10, 2),          -- "Obvod [m]"

  -- Kultura a režim hospodaření
  culture TEXT,                        -- "Kul." – kód kultury LPIS (R, T, U, V, C, S…)
  farming_mode TEXT,                   -- "EKO" – KONV / EKO / PO
  organic_conversion_from DATE,        -- "PO OD" – přechodné období od
  organic_from DATE,                   -- "EZ OD" – ekologické zemědělství od

  -- Legislativní atributy rozhodující o aplikaci hnojiv a POR
  nitrate_vulnerable_zone BOOLEAN,     -- "ZOD" – zranitelná oblast dusíkem
  application_zone TEXT,               -- "Apl. pásmo" – I., II., III a., III b.
  erosion_class TEXT,                  -- "Eroze DPB" – NEO, MEO-NR, SEO…
  soil_kind TEXT,                      -- "Druh půdy" – lehká / střední / těžká
  soil_type TEXT CHECK (soil_type IN ('L', 'S', 'T')), -- odvozeno z soil_kind
  slope_degrees NUMERIC(6, 2),         -- "Sklonitost [°]"
  water_distance_m NUMERIC(10, 2),     -- "Vzdál. od vody [m]"
  drainage BOOLEAN,                    -- "Meliorace"

  -- Dotační a ochranné režimy
  lfa_type TEXT,                       -- "Typ LFA/ANC" (může být kombinace, např. "O3,S")
  lfa_area_text TEXT,                  -- "Výměra LFA/ANC" – v exportu i více hodnot v jedné buňce
  protected_area_type TEXT,            -- "Typ ZCHÚ"
  protected_area_ha NUMERIC(10, 4),    -- "Vým. ZCHÚ"
  buffer_zone_ha NUMERIC(10, 4),       -- "Vým. SCHÚ" – ochranné pásmo ZCHÚ
  ect_ha NUMERIC(10, 4),               -- "Vým. ECT" – environmentálně citlivé TTP
  aeko_als TEXT,                       -- "AEKO/ALS" – agroenvironmentální opatření

  notes TEXT,

  -- Původ dat
  source_file TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Kód DPB je v rámci čtverce a uživatele jedinečný → opakovaný import
  -- stejného exportu záznamy aktualizuje, nezduplikuje
  UNIQUE (user_id, square_code, dpb_code)
);

CREATE INDEX IF NOT EXISTS idx_land_blocks_user ON public.land_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_land_blocks_dpb_code ON public.land_blocks(user_id, dpb_code);
CREATE INDEX IF NOT EXISTS idx_land_blocks_culture ON public.land_blocks(user_id, culture);
CREATE INDEX IF NOT EXISTS idx_land_blocks_nvz ON public.land_blocks(user_id, nitrate_vulnerable_zone);
CREATE INDEX IF NOT EXISTS idx_land_blocks_cadastral ON public.land_blocks(user_id, cadastral_area);

-- ----------------------------------------------------------------------------
-- LOG IMPORTŮ – ze kterého souboru a kdy data pochází
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.land_block_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_file TEXT NOT NULL,
  rows_total INTEGER NOT NULL DEFAULT 0,
  rows_created INTEGER NOT NULL DEFAULT 0,
  rows_updated INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_land_block_imports_user
  ON public.land_block_imports(user_id, imported_at DESC);

-- ----------------------------------------------------------------------------
-- Automatická aktualizace updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_land_blocks_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_land_blocks_updated_at ON public.land_blocks;
CREATE TRIGGER trg_land_blocks_updated_at
  BEFORE UPDATE ON public.land_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_land_blocks_updated_at();

-- ----------------------------------------------------------------------------
-- RLS – vlastní data uživatele, admin má čtení
-- ----------------------------------------------------------------------------
ALTER TABLE public.land_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_block_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own land_blocks" ON public.land_blocks;
CREATE POLICY "Users manage own land_blocks" ON public.land_blocks
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can read land_blocks" ON public.land_blocks;
CREATE POLICY "Admin can read land_blocks" ON public.land_blocks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users manage own land_block_imports" ON public.land_block_imports;
CREATE POLICY "Users manage own land_block_imports" ON public.land_block_imports
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can read land_block_imports" ON public.land_block_imports;
CREATE POLICY "Admin can read land_block_imports" ON public.land_block_imports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- KOMENTÁŘE
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.land_blocks IS 'Díly půdních bloků z LPIS pro službu Hnojiva a POR – oddělené od tabulky parcels používané ve vápnění';
COMMENT ON TABLE public.land_block_imports IS 'Log importů sestavy Informativní údaje o DPB z Portálu farmáře';
COMMENT ON COLUMN public.land_blocks.nitrate_vulnerable_zone IS 'ZOD – zranitelná oblast dusíkem; určuje limity a termíny aplikace dusíku';
COMMENT ON COLUMN public.land_blocks.application_zone IS 'Aplikační pásmo (I., II., III a., III b.) – termíny zákazu hnojení';
COMMENT ON COLUMN public.land_blocks.erosion_class IS 'Erozní ohroženost DPB (NEO, MEO-NR, SEO…) – omezení plodin a aplikací';
COMMENT ON COLUMN public.land_blocks.water_distance_m IS 'Vzdálenost od vodního toku – rozhoduje o ochranných pásech pro hnojiva i POR';
COMMENT ON COLUMN public.land_blocks.soil_type IS 'Půdní druh přeložený na L/S/T podle sloupce Druh půdy';
COMMENT ON COLUMN public.land_blocks.lfa_area_text IS 'Výměra LFA/ANC – export uvádí i více hodnot v jedné buňce, proto text';
