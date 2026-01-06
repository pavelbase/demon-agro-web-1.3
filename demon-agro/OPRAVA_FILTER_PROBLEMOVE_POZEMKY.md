# OPRAVA: Filtr "Pouze problémové" pozemky

## 🐛 Problém

**Uživatel nahlásil:**
1. Filtr "Pouze problémové" nefunguje - nevyfiltruje problémové pozemky
2. Tlačítko "Pouze problémové" splývá s ostatními - není dost viditelné

---

## ✅ Řešení

### 1. Opravena logika filtru

**Soubor:** `components/portal/ParcelsTable.tsx`

**PŘED (řádek 88 - ŠPATNĚ):**
```typescript
if (problemsOnly) {
  filtered = filtered.filter(p => p.status === 'warning' || p.status === 'critical')
}
```

**Problém:** Property se jmenuje `health_status`, ne `status`!

**PO (OPRAVENO):**
```typescript
if (problemsOnly) {
  filtered = filtered.filter(p => p.health_status === 'warning' || p.health_status === 'critical')
}
```

**Také opraveno na řádku 126:**
```typescript
// PŘED:
health_status: 'warning' as const,  // ❌ Bylo: status: 'warning'
```

---

### 2. Zvýrazněno tlačítko "Pouze problémové"

**PŘED:**
```tsx
<label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
  <input type="checkbox" checked={problemsOnly} ... />
  <span className="text-sm text-gray-700">Pouze problémové</span>
</label>
```

**Problémy:**
- ❌ Vypadalo stejně jako ostatní filtry
- ❌ Žádná ikona
- ❌ Slabý border (1px, šedý)
- ❌ Žádné výrazné zvýraznění když aktivní

**PO:**
```tsx
<label className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer transition-all ${
  problemsOnly 
    ? 'bg-orange-50 border-orange-500 hover:bg-orange-100'    // AKTIVNÍ: Oranžové pozadí
    : 'border-orange-300 hover:bg-orange-50 hover:border-orange-400'  // NEAKTIVNÍ: Oranžový border
}`}>
  <input type="checkbox" checked={problemsOnly} ... />
  <AlertTriangle className={`w-4 h-4 ${problemsOnly ? 'text-orange-600' : 'text-orange-400'}`} />
  <span className={`text-sm font-medium ${problemsOnly ? 'text-orange-900' : 'text-orange-700'}`}>
    Pouze problémové
  </span>
</label>
```

**Vylepšení:**
- ✅ **Ikona varování** (AlertTriangle) - okamžitě viditelná
- ✅ **Silnější border** (2px místo 1px)
- ✅ **Oranžová barva** - asociuje se s varováním
- ✅ **Výrazné pozadí když aktivní** (bg-orange-50)
- ✅ **Tmavší text** (font-medium)
- ✅ **Animace přechodu** (transition-all)

---

## 📊 Vizuální porovnání

### PŘED:
```
┌─────────────────────────┐
│ ☐ Pouze problémové      │  <- Splýval s ostatními filtry
└─────────────────────────┘
```

### PO (neaktivní):
```
┌─────────────────────────┐
│ ☐ ⚠️  Pouze problémové  │  <- Oranžový border + ikona
└─────────────────────────┘
```

### PO (aktivní):
```
┌═════════════════════════┐
│ ☑ ⚠️  Pouze problémové  │  <- Oranžové pozadí + výrazný border
└═════════════════════════┘
```

---

## 🎨 Design systém

### Barvy použité

| Stav | Background | Border | Text | Ikona |
|------|------------|--------|------|-------|
| **Neaktivní** | Transparent | `border-orange-300` | `text-orange-700` | `text-orange-400` |
| **Hover (neaktivní)** | `bg-orange-50` | `border-orange-400` | `text-orange-700` | `text-orange-400` |
| **Aktivní** | `bg-orange-50` | `border-orange-500` (2px) | `text-orange-900` | `text-orange-600` |
| **Hover (aktivní)** | `bg-orange-100` | `border-orange-500` (2px) | `text-orange-900` | `text-orange-600` |

### Proč oranžová?

- ⚠️ **Asociace s varováním** - univerzálně chápané
- 🔶 **Výrazné, ale ne agresivní** - červená by byla moc dramatická
- 🎯 **Odlišuje se od ostatních filtrů** - zelená je pro primary actions

---

## 🧪 Jak testovat

### Test 1: Funkčnost filtru

1. Otevřete **Seznam pozemků** (`/portal/pozemky`)
2. Ujistěte se, že máte nějaké **problémové pozemky** (status = warning nebo critical)
3. Klikněte na **"Pouze problémové"**
4. **Očekávaný výsledek:**
   - ✅ Zobrazí se pouze pozemky s varováním nebo kritickým stavem
   - ✅ Pozemky se stavem "OK" zmizí

### Test 2: Vizuální zvýraznění

1. **Neaktivní stav:**
   - ✅ Oranžový border (2px)
   - ✅ Ikona varování (AlertTriangle)
   - ✅ Oranžový text

2. **Hover (neaktivní):**
   - ✅ Světle oranžové pozadí
   - ✅ Tmavší border

3. **Aktivní stav:**
   - ✅ Oranžové pozadí (bg-orange-50)
   - ✅ Výrazný oranžový border (border-orange-500)
   - ✅ Tmavší text (text-orange-900)
   - ✅ Výraznější ikona (text-orange-600)

4. **Hover (aktivní):**
   - ✅ Tmavší oranžové pozadí (bg-orange-100)

---

## 📝 Co definuje "problémový pozemek"?

V `app/portal/pozemky/page.tsx` na řádcích 49-77:

### Critical (kritický):
- ❌ **pH < 5.5** - nutné vápnění
- Status: `critical`
- Barva: červená

### Warning (varování):
- ⚠️ **Chybí rozbor**
- ⚠️ **Rozbor starší než 4 roky**
- ⚠️ **Nízké živiny** (P, K nebo Mg v kategorii 'N' nebo 'VH')
- Status: `warning`
- Barva: oranžová

### OK:
- ✅ Vše v pořádku
- Status: `ok`
- Barva: zelená

---

## ✅ Výsledek

**Před:**
- ❌ Filtr nefungoval (`p.status` místo `p.health_status`)
- ❌ Tlačítko splývalo s ostatními filtry
- ❌ Žádná ikona
- ❌ Slabé vizuální zvýraznění

**Po:**
- ✅ **Filtr funguje** - správně používá `p.health_status`
- ✅ **Výrazné zvýraznění** - ikona varování + oranžová barva
- ✅ **Silnější border** (2px)
- ✅ **Výrazné pozadí když aktivní**
- ✅ **Uživatel okamžitě ví, že je to důležité tlačítko**

---

## 🔗 Související soubory

- ✅ `components/portal/ParcelsTable.tsx` - Opravena logika filtru + zvýrazněno tlačítko
- ✅ `app/portal/pozemky/page.tsx` - Definice `health_status` (beze změny)

---

## 🎉 Shrnutí

**Oba problémy vyřešeny!**

1. ✅ **Filtr funguje** - opravena property `status` → `health_status`
2. ✅ **Tlačítko je výrazné** - oranžová barva + ikona varování + silnější border

**Server automaticky načte změny díky Hot Module Replacement!**



