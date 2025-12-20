# 🚀 Admin Zóna - Rychlý Test

Tento průvodce vám pomůže otestovat Admin Zónu v sidebaru během **5 minut**.

---

## ⏱️ Rychlý start (3 kroky)

### 1️⃣ Nastavte admin roli v Supabase

1. Otevřete **Supabase Dashboard**
2. Klikněte na **SQL Editor**
3. Spusťte tento příkaz (změňte email):

```sql
-- Nahraďte email svým
UPDATE public.profiles SET role = 'admin' WHERE email = 'vas@email.cz';
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'vas@email.cz';
```

4. Zkontrolujte změnu:

```sql
SELECT email, role FROM public.profiles WHERE email = 'vas@email.cz';
```

### 2️⃣ Odhlaste se a znovu přihlaste

1. V portálu klikněte na **Odhlásit se**
2. Přihlaste se znovu s vaším účtem
3. Budete přesměrováni na Dashboard

### 3️⃣ Zkontrolujte sidebar

V sidebaru byste měli vidět:

```
Dashboard
Pozemky
Upload rozborů
Historie hnojení
Osevní postup
Moje poptávky
Nastavení

━━━━━━━━━━━━━━━━━━━━━━━━━━  ← Silnější čára

🛡️ ADMIN ZÓNA                 ← Červený nadpis s Shield ikonou

📊 Přehled                     ← Červené hover efekty
👥 Uživatelé
📦 Produkty hnojení
📦 Produkty vápnění
📋 Poptávky
🖼️ Obrázky portálu
📄 Audit log
📊 Statistiky
```

---

## ✅ Kontrolní seznam

- [ ] Admin Zóna se zobrazuje v sidebaru?
- [ ] Je oddělená silnější čárou?
- [ ] Má červený nadpis "ADMIN ZÓNA" s Shield ikonou?
- [ ] Obsahuje 8 admin odkazů?
- [ ] Odkazy mají červený hover efekt?
- [ ] Můžete kliknout na "/portal/admin" a vidíte dashboard?
- [ ] Můžete kliknout na "/portal/admin/uzivatele" a vidíte seznam uživatelů?

---

## 🔍 Test pro běžného uživatele

Chcete otestovat, že běžný uživatel Admin Zónu **nevidí**?

1. Vytvořte testovacího uživatele s `role='user'`:

```sql
-- V Supabase SQL Editor
UPDATE public.profiles SET role = 'user' WHERE email = 'test@email.cz';
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "user"}'::jsonb WHERE email = 'test@email.cz';
```

2. Přihlaste se jako testovací uživatel
3. ✅ Admin Zóna by **neměla být vidět** v sidebaru
4. ✅ Pokus o přístup na `/portal/admin` → redirect na `/portal/dashboard`

---

## 🐛 Řešení problémů

### Admin Zóna se nezobrazuje?

**Kontrola 1: Role v databázi**

```sql
SELECT 
  email, 
  role as profile_role,
  raw_user_meta_data->>'role' as auth_role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE email = 'vas@email.cz';
```

Obě role by měly být `'admin'`.

**Kontrola 2: Přihlášení**

- Zkuste se odhlásit a znovu přihlásit
- Vymažte cache prohlížeče (Ctrl+F5)

**Kontrola 3: Konzole prohlížeče**

Otevřete konzoli (F12) a zkontrolujte, zda nejsou chyby.

---

### Mohu přistupovat na admin stránky, ale Admin Zóna se nezobrazuje?

Zkontrolujte, že `isAdmin` prop je správně předáván:

```tsx
// V app/portal/layout.tsx (řádek ~47)
const isAdmin = profile?.role === 'admin'
```

---

### Admin Zóna je vidět, ale odkazy nefungují?

Zkontrolujte:
1. Existují admin stránky v `app/portal/admin/`?
2. Middleware povoluje přístup?

```sql
-- Zkontrolujte middleware log v konzoli
```

---

## 📸 Očekávaný výsledek

### Pro admina:
- ✅ Vidí hlavní navigaci (7 odkazů)
- ✅ Vidí Admin Zónu (8 odkazů)
- ✅ Admin Zóna je červeně stylovaná
- ✅ Může přistupovat na všechny admin stránky

### Pro běžného uživatele:
- ✅ Vidí pouze hlavní navigaci (7 odkazů)
- ✅ Admin Zóna je skrytá
- ✅ Nemůže přistupovat na admin stránky (redirect)

---

## 🎯 Výsledek testu

| Test | Očekávaný výsledek | Váš výsledek |
|------|-------------------|--------------|
| Admin vidí Admin Zónu | ✅ | [ ] |
| Admin může přistupovat na /portal/admin | ✅ | [ ] |
| User nevidí Admin Zónu | ✅ | [ ] |
| User nemůže přistupovat na /portal/admin | ✅ (redirect) | [ ] |
| Admin Zóna je červeně stylovaná | ✅ | [ ] |
| Shield ikona je viditelná | ✅ | [ ] |

---

## 📞 Další kroky

Pokud vše funguje:
- ✅ **Hotovo!** Admin Zóna je plně funkční
- 🎉 Můžete začít používat admin funkce

Pokud něco nefunguje:
- 📖 Přečtěte si detailní dokumentaci v `ADMIN_SIDEBAR_IMPLEMENTATION.md`
- 🔧 Použijte SQL skripty v `lib/supabase/sql/admin_role_setup.sql`
- 🐛 Zkontrolujte konzoli prohlížeče a Supabase logy

---

**Čas na test: ~5 minut ⏱️**
