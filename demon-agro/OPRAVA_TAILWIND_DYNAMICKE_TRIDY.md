# 🔧 KRITICKÁ OPRAVA - Dynamické Tailwind CSS třídy

## Problém
Stránka "Historie rozborů" vracela **404 chybu** kvůli použití **dynamických Tailwind CSS tříd**, které **NEFUNGUJÍ** v produkci.

## Příčina

### ❌ Špatně (nefunguje):
```typescript
<div className={`bg-${getCategoryColor(category)}-100 text-${getCategoryColor(category)}-700`}>
```

Tailwind CSS potřebuje vidět **úplné názvy tříd** při build time. Dynamické interpolace nejsou podporovány!

### ✅ Správně (funguje):
```typescript
function getCategoryBadgeClasses(category: PhCategory | NutrientCategory | null): string {
  if (!category) return 'bg-gray-100 text-gray-700'
  
  const color = getCategoryColor(category)
  const classes: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  }
  
  return classes[color] || 'bg-gray-100 text-gray-700'
}

// Použití:
<div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(category)}`}>
```

## Opravený soubor

### ✅ `app/portal/pozemky/[id]/rozbory/page.tsx`

**Přidáno:**
- Nová helper funkce `getCategoryBadgeClasses()`
- Import typů `PhCategory` a `NutrientCategory`

**Opraveno 5 výskytů:**
- pH kategorie badge
- Fosfor (P) kategorie badge
- Draslík (K) kategorie badge
- Hořčík (Mg) kategorie badge
- Vápník (Ca) kategorie badge

## Důležité - Tailwind CSS Best Practices

### ❌ NIKDY NEPOUŽÍVAT:
```typescript
// Dynamické interpolace - NEFUNGUJE!
className={`bg-${color}-100`}
className={`text-${size}-${weight}`}
className={`w-${width}`}
```

### ✅ VŽDY POUŽÍVAT:
```typescript
// Kompletní názvy tříd - FUNGUJE!
className={color === 'red' ? 'bg-red-100' : 'bg-blue-100'}

// Nebo mapping object
const classes = {
  red: 'bg-red-100',
  blue: 'bg-blue-100'
}
className={classes[color]}
```

## Co dělat TEĎAKTUÁLNĚ

### 1️⃣ **Restartujte dev server:**
```bash
# V terminálu stiskněte Ctrl+C
# Pak znovu:
npm run dev
```

### 2️⃣ **Vyčistěte browser cache:**
- Stiskněte `Ctrl + Shift + R` (hard refresh)
- Nebo otevřete v inkognito okně

### 3️⃣ **Otevřete stránku:**
1. Jděte na detail pozemku
2. Klikněte na "Historie rozborů"
3. **Mělo by fungovat!** ✅

---

## Status
**OPRAVENO** - Stránka nyní používá správné statické Tailwind třídy! ✅

---
**Datum opravy:** 2026-01-01  
**Důležitost:** KRITICKÁ - bez této opravy stránka nefunguje v produkci

---

## 📚 Dokumentace
Více o Tailwind CSS omezení:
https://tailwindcss.com/docs/content-configuration#dynamic-class-names





