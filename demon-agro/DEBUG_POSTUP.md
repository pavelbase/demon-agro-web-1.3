# 🔍 Debug postup pro Historie rozborů

## Aktuální situace
- ✅ Soubor `app/portal/pozemky/[id]/rozbory/page.tsx` existuje
- ✅ Soubor se úspěšně kompiluje bez chyb
- ✅ Linter nehlásí žádné chyby
- ❌ Stránka stále vrací 404

## Přidané debug logy

Do souboru `rozbory/page.tsx` jsem přidal console.logy, které ukáží:
- 🔍 ROZBORY PAGE - START (začátek načítání stránky)
- 🔍 ROZBORY PAGE - Parcel (data o pozemku)
- 🔍 ROZBORY PAGE - Analyses (data o rozborech)

## Co je potřeba udělat TEĎ:

### 1. Obnovit stránku v prohlížeči
```
Stiskněte: Ctrl + Shift + R (hard refresh)
```

### 2. Kliknout na "Historie rozborů"

### 3. Zkontrolovat URL v adresním řádku
Měla by vypadat takto:
```
localhost:3000/portal/pozemky/[NĚJAKÉ-UUID]/rozbory
```

Příklad správné URL:
```
localhost:3000/portal/pozemky/2705b367-7d95-4c3a-9064-3a74a1059fd5/rozbory
```

### 4. Zkontrolovat terminál
Měly by se tam objevit tyto logy:
```
🔍 ROZBORY PAGE - START { parcelId: '...' }
🔍 ROZBORY PAGE - Parcel: { parcel: {...}, parcelError: null }
🔍 ROZBORY PAGE - Analyses: { count: X, analysesError: null, firstAnalysis: {...} }
```

### 5. Pokud se logy neobjeví
To znamená, že stránka se vůbec nenačítá. Možné příčiny:

a) **Problem s routingem** - Next.js nerozpoznává cestu
b) **Problem s middlewarem** - middleware blokuje přístup
c) **Problem s cache** - stará verze je v cache

## Řešení podle situace:

### A) Logy se objeví, ale je tam chyba
Odešlete mi logy z terminálu a vyřešíme podle chyby.

### B) Logy se neobjeví vůbec
Zkuste:

1. **Smazat .next cache:**
```powershell
Remove-Item -Recurse -Force .next
```

2. **Restartovat server:**
```powershell
# Ctrl+C v terminálu
npm run dev
```

3. **Zkusit přímou URL:**
Zkopírujte UUID pozemku z URL stránky pozemku a vložte do této URL:
```
http://localhost:3000/portal/pozemky/[UUID-POZEMKU]/rozbory
```

### C) Stále 404
Zkontrolujeme middleware a routing v Next.js.

## O zobrazení síry a vápníku

Ze screenshotu vidím:
- ✅ **Síra (S)** se zobrazuje: 13.08 mg/kg (šedý pruh = OK, nemá kategorii)
- ✅ **Vápník (Ca)** se zobrazuje: 1892 mg/kg (šedý pruh = OK, nemá kategorii)

**Šedý pruh je SPRÁVNĚ** - tyto živiny nemají `_category` sloupec v databázi, takže se zobrazují bez barevné kategorie.

Pokud chcete barevné kategorie i pro Ca a S, musíme:
1. Přidat sloupce `ca_category` a `s_category` do databáze
2. Aktualizovat API pro výpočet kategorií
3. Aktualizovat frontend pro zobrazení

## Další kroky

Až mi pošlete:
1. Screenshot terminálu s logy (nebo bez nich)
2. Přesnou URL, která se zobrazuje když kliknete na "Historie rozborů"

Budu moct přesně identifikovat problém a opravit ho.




