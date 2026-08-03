-- ============================================================================
-- Oprava mazání uživatelů + chybějící tabulka audit_logs
-- ============================================================================
--
-- Řešené problémy:
--
-- 1) profiles.id -> auth.users.id mělo ON DELETE NO ACTION, takže smazání
--    auth uživatele vždy skončilo chybou 23503. Mazání uživatele z admin
--    panelu nefungovalo pro nikoho.
--
-- 2) public.audit_logs nikdy nebyla vytvořena, přestože do ní aplikace zapisuje
--    na desítkách míst a čte z ní stránka /portal/admin/audit-log.
--
-- 3) admin_audit_log odkazoval na profiles s NO ACTION, což by mazání
--    zablokovalo znovu, jakmile by se tabulka začala plnit.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Chybějící tabulka audit_logs
-- ----------------------------------------------------------------------------
-- record_id je záměrně TEXT, ne UUID – různá místa v aplikaci sem ukládají
-- i identifikátory, které nejsou UUID.
-- Cizí klíč se musí jmenovat audit_logs_user_id_fkey, protože se na něj
-- explicitně odkazuje join v app/portal/admin/audit-log/page.tsx.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_record_id_idx ON public.audit_logs (record_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 2. profiles -> auth.users: ON DELETE CASCADE
-- ----------------------------------------------------------------------------
-- Smazání auth uživatele nyní odstraní i jeho profil a přes navazující
-- kaskády i jeho data (parcels, land_blocks, liming_requests, agro_customers,
-- applications, product_cards, password_reset_tokens, ...).

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;


-- ----------------------------------------------------------------------------
-- 3. admin_audit_log: audit musí přežít smazání uživatele
-- ----------------------------------------------------------------------------

ALTER TABLE public.admin_audit_log ALTER COLUMN admin_id DROP NOT NULL;

ALTER TABLE public.admin_audit_log
  DROP CONSTRAINT IF EXISTS admin_audit_log_admin_id_fkey;
ALTER TABLE public.admin_audit_log
  ADD CONSTRAINT admin_audit_log_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES public.profiles (id) ON DELETE SET NULL;

ALTER TABLE public.admin_audit_log
  DROP CONSTRAINT IF EXISTS admin_audit_log_target_user_id_fkey;
ALTER TABLE public.admin_audit_log
  ADD CONSTRAINT admin_audit_log_target_user_id_fkey
  FOREIGN KEY (target_user_id) REFERENCES public.profiles (id) ON DELETE SET NULL;


-- ----------------------------------------------------------------------------
-- 4. Cizí klíče, které kaskádu přerušovaly
-- ----------------------------------------------------------------------------
-- Obojí jsou nepovinné odkazy na původ záznamu. S ON DELETE NO ACTION by
-- kaskáda vyvolaná smazáním profilu skončila chybou ve chvíli, kdy uživatel
-- měl pozemky vzniklé rozdělením nebo zděděnou historii hnojení.

ALTER TABLE public.fertilization_history
  DROP CONSTRAINT IF EXISTS fertilization_history_inherited_from_parcel_id_fkey;
ALTER TABLE public.fertilization_history
  ADD CONSTRAINT fertilization_history_inherited_from_parcel_id_fkey
  FOREIGN KEY (inherited_from_parcel_id) REFERENCES public.parcels (id) ON DELETE SET NULL;

ALTER TABLE public.parcels
  DROP CONSTRAINT IF EXISTS parcels_source_parcel_id_fkey;
ALTER TABLE public.parcels
  ADD CONSTRAINT parcels_source_parcel_id_fkey
  FOREIGN KEY (source_parcel_id) REFERENCES public.parcels (id) ON DELETE SET NULL;


-- ----------------------------------------------------------------------------
-- 5. Admin smí mazat profily
-- ----------------------------------------------------------------------------
-- API používá service-role klienta (RLS obchází), ale explicitní politika
-- zajistí konzistentní chování i pro přístup pod session admina.

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());
