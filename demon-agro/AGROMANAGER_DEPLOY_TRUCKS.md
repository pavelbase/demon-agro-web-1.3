# AgroManažer - Deployment kamionové logistiky 🚀

## 📋 Checklist před deploymentem

- [ ] SQL migrace připravena
- [ ] Kód zkompilován bez chyb
- [ ] Lokální testy prošly
- [ ] Backup databáze vytvořen

---

## 🗄️ Krok 1: Backup databáze (DŮLEŽITÉ!)

### V Supabase Dashboard:

1. Jít do: **Database** → **Backups**
2. Kliknout: **Create backup**
3. Název: `before_truck_logistics_2026-01-22`
4. Počkat na dokončení

**Proč?** Pokud něco selže, můžete se vrátit.

---

## 📝 Krok 2: Spustit SQL migraci

### V Supabase SQL Editor:

1. Otevřít: **SQL Editor**
2. Kliknout: **New query**
3. Zkopírovat obsah souboru:
   ```
   demon-agro/lib/supabase/sql/add_truck_logistics_fields.sql
   ```
4. Kliknout: **Run** (nebo F5)

### Očekávaný výsledek:
```sql
status
"Pole pro kamionovou logistiku úspěšně přidána!"
```

### Ověření:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'agro_customers'
AND column_name IN ('pozadovany_zisk_ha', 'pocet_kamionu');
```

### Očekávaný výstup:
```
column_name           | data_type | column_default
----------------------|-----------|---------------
pozadovany_zisk_ha    | numeric   | 330
pocet_kamionu         | integer   | NULL
```

✅ Pokud vidíte tyto 2 řádky, migrace proběhla úspěšně!

---

## 🔧 Krok 3: Ověřit TypeScript typy

### Lokálně spustit:
```bash
npm run build
```

### Očekávaný výsledek:
```
✓ Compiled successfully
```

### Pokud jsou chyby:
1. Zkontrolovat `lib/types/database.ts`
2. Ověřit, že obsahuje:
   ```typescript
   pozadovany_zisk_ha: number
   pocet_kamionu: number | null
   ```

---

## 🚀 Krok 4: Deploy na produkci

### Pro Vercel:
```bash
# Commit změn
git add .
git commit -m "feat: Přidána kamionová logistika do AgroManažeru"

# Push na produkci
git push origin main
```

### Pro jiné platformy:
```bash
# Build
npm run build

# Start
npm start
```

---

## ✅ Krok 5: Ověření na produkci

### 1. Otevřít produkční URL:
```
https://www.demonagro.cz/portal/admin/agromanager
```

### 2. Vytvořit testovací zakázku:
- Výměra: 80 ha
- Dávka: 500 kg/ha

### 3. Ověřit zobrazení:
- [ ] Sekce "🚛 LOGISTIKA KAMIONŮ" je viditelná
- [ ] Teoretická potřeba: 40 t
- [ ] Počet kamionů: 2×
- [ ] Skutečná dávka: 750 kg/ha
- [ ] Doporučená cena: ~1,020 Kč/ha
- [ ] Tlačítka [−] [+] fungují
- [ ] Tlačítko "Použít" u ceny funguje

### 4. Test ukládání:
- [ ] Změnit počet kamionů na 3
- [ ] Kliknout "Uložit" (Ctrl+S)
- [ ] Reload stránky
- [ ] Ověřit, že počet kamionů zůstal 3

---

## 🔥 Krok 6: Rollback (pokud něco selže)

### Rychlý rollback SQL:
```sql
-- Odstranit nová pole (pokud je potřeba)
ALTER TABLE agro_customers DROP COLUMN IF EXISTS pozadovany_zisk_ha;
ALTER TABLE agro_customers DROP COLUMN IF EXISTS pocet_kamionu;
```

### Rollback kódu (Vercel):
1. Jít do: **Vercel Dashboard** → **Deployments**
2. Najít předchozí deployment
3. Kliknout: **⋮** → **Promote to Production**

### Obnovit z backupu (pokud potřeba):
1. Jít do: **Supabase Dashboard** → **Database** → **Backups**
2. Najít backup: `before_truck_logistics_2026-01-22`
3. Kliknout: **Restore**

---

## 📊 Krok 7: Monitoring (první 24 hodin)

### Co sledovat:

1. **Chybové logy** (Vercel/Supabase)
   - Hledat: `agro_customers`, `pozadovany_zisk_ha`, `pocet_kamionu`

2. **Performance**
   - Čas načítání `/portal/admin/agromanager`
   - Čas API odpovědí `/api/admin/agro-customers`

3. **Uživatelské chování**
   - Kolikrát se použije tlačítko "Použít" u doporučené ceny
   - Kolikrát se mění počet kamionů ručně

### Red flags:
- ❌ Časté chyby při ukládání
- ❌ Dlouhé načítání (>3s)
- ❌ Prázdná sekce kamionů
- ❌ Chybné výpočty

---

## 📞 Podpora uživatelů

### Pro adminy (po deployi):

**Email template:**
```
Předmět: ✨ Nová funkce v AgroManažeru - Kamionová logistika

Ahoj,

přidali jsme novou funkci do AgroManažeru, která řeší problém "nedělitelnosti kamionů".

🚛 Co je nového:
- Automatický výpočet počtu kamionů (30t/kamion)
- Přepočet skutečné dávky podle množství materiálu
- Doporučená cena pro udržení požadované marže
- Možnost ručně upravit počet kamionů

📖 Jak to funguje:
1. Zadáte výměru a dávku
2. Kalkulačka spočítá, kolik kamionů bude potřeba
3. Přepočítá skutečnou dávku (protože materiál se musí spotřebovat všechen)
4. Navrhne optimální cenu, abyste nepřišli o zisk

💡 Tip: Když vidíte "Doporučenou cenu", stačí kliknout "Použít" a cena se automaticky upraví.

Jakékoliv dotazy směřujte na: support@demonagro.cz

S pozdravem,
Tým Démon Agro
```

---

## 🎯 Měřitelné cíle (po 1 týdnu)

### KPIs:

1. **Adoption rate**
   - Cíl: 80% adminů použije kamionovou logistiku
   - Měření: Počet zakázek s `pocet_kamionu != NULL`

2. **Accuracy**
   - Cíl: 90% zakázek má správně vypočítaný počet kamionů
   - Měření: Porovnat teoretickou potřebu vs. skutečné množství

3. **Revenue protection**
   - Cíl: Průměrný zisk/ha zůstane ≥ 300 Kč
   - Měření: Průměr `hrubyZisk / vymera` u všech zakázek

4. **Zero errors**
   - Cíl: 0 chyb při výpočtech
   - Měření: Monitoring error logs

---

## 🐛 Známé problémy a workarounds

### Problém 1: Starší prohlížeče
**Symptom:** Tlačítka [−] [+] nefungují  
**Workaround:** Použít moderní prohlížeč (Chrome 90+, Firefox 88+, Safari 14+)

### Problém 2: Velmi velké výměry
**Symptom:** Více než 50 kamionů (1,500+ tun)  
**Workaround:** Rozdělit zakázku na menší části

### Problém 3: Cache
**Symptom:** Stará UI bez sekce kamionů  
**Workaround:** Hard refresh (Ctrl+Shift+R)

---

## 📈 Budoucí vylepšení

### V1.1 (příští týden):
- [ ] Export do PDF s kamionovou logikou
- [ ] História změn počtu kamionů

### V1.2 (příští měsíc):
- [ ] Různé kapacity kamionů (20t, 25t, 30t)
- [ ] Optimalizace více zakázek najednou
- [ ] Notifikace při neoptimálním počtu kamionů

### V2.0 (Q2 2026):
- [ ] AI doporučení optimálního počtu kamionů
- [ ] Integrace s logistickými firmami
- [ ] Real-time tracking kamionů

---

## ✅ Deployment checklist

Před označením jako "Hotovo":

- [ ] SQL migrace proběhla úspěšně
- [ ] Build prošel bez chyb
- [ ] Deploy na produkci dokončen
- [ ] Základní testy na produkci prošly
- [ ] Monitoring nastaven
- [ ] Dokumentace aktualizována
- [ ] Admini informováni
- [ ] Backup databáze vytvořen

---

## 🎉 Po dokončení

Gratulujeme! Kamionová logistika je živá na produkci. 🚀

**Datum deploye:** ________________  
**Deployed by:** ________________  
**Verified by:** ________________

---

**Poslední aktualizace:** 2026-01-22

