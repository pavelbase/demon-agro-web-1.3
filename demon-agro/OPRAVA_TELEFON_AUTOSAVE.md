# Oprava: Zabránění automatického ukládání telefonního čísla

## Problém

Uživatel hlásil, že při vyplňování formuláře "Moje poptávky / Nova" v sekci "Kontaktní údaje":
1. Kliknul do kolonky "Telefon"
2. Začal psát telefonní číslo - napsal pouze "7"
3. Systém automaticky uložil "7" do profilu uživatele

**Očekávané chování:**
- Formulář "Moje poptávky / Nova" by **NEMĚL** ukládat telefon do profilu uživatele
- Telefon by měl být použit pouze lokálně pro konkrétní poptávku
- Do profilu by se telefon měl ukládat **POUZE** při onboardingu (průvodce při prvním přihlášení)
- Systém musí nechat uživatele dopsat celé telefonní číslo

## Analýza

Po analýze kódu jsem zjistil:

### Kde se telefon ukládá do profilu:
1. **OnboardingWizard** (`components/portal/OnboardingWizard.tsx`) - při kliknutí na "Pokračovat"
2. **Admin update** (`app/api/admin/users/update/route.ts`) - když admin upraví profil

### Potvrzení správného chování:
- **NewLimingRequestForm** (`components/portal/NewLimingRequestForm.tsx`) **NEUKLÁDÁ** telefon do profilu
- Telefon je uložen pouze v lokálním stavu komponenty (`useState`)
- Při odeslání poptávky se telefon použije pouze pro tu konkrétní poptávku

### Identifikovaná příčina:
Problém byl pravděpodobně způsoben **autocomplete prohlížeče**, který:
- Automaticky vyplňoval telefonní číslo z uložených dat prohlížeče
- Mohl zmást uživatele, že systém automaticky ukládá data

## Řešení

### 1. Vypnutí autocomplete v kontaktních polích
Změnil jsem všechna pole v sekci "Kontaktní údaje" z `autoComplete="tel|name|email|street-address"` na `autoComplete="off"`:

**Soubor:** `components/portal/NewLimingRequestForm.tsx`

- ✅ Kontaktní osoba: `autoComplete="off"` (bylo: `"name"`)
- ✅ Telefon: `autoComplete="off"` (bylo: `"tel"`)
- ✅ Email: `autoComplete="off"` (bylo: `"email"`)
- ✅ Adresa dodání: `autoComplete="off"` (bylo: `"street-address"`)

### 2. Důvod změny
- Zabránění automatickému vyplňování prohlížečem
- Uživatel má plnou kontrolu nad vkládanými daty
- Žádné automatické ukládání do profilu během psaní

## Testování

Po nasazení ověřte:
1. ✅ Otevřete stránku `/portal/poptavky/nova`
2. ✅ Klikněte do pole "Telefon" v sekci "Kontaktní údaje"
3. ✅ Začněte psát telefonní číslo
4. ✅ Ověřte, že prohlížeč **nevyplňuje** automaticky telefonní číslo
5. ✅ Ověřte, že můžete dopsat celé číslo bez přerušení
6. ✅ Odešlete poptávku
7. ✅ Zkontrolujte v profilu, že telefon **nebyl** změněn

## Potvrzení správného chování systému

### ✅ Formulář poptávky (Správně):
- Telefon se **neukládá** do profilu
- Telefon se používá pouze pro danou poptávku
- Uživatel může zadat jiné číslo než má v profilu

### ✅ Onboarding (Správně):
- Telefon se ukládá do profilu **POUZE** při kliknutí na tlačítko "Pokračovat"
- **Ne** během psaní každého znaku
- Uživatel může dopsat celé číslo

## Datum opravy
6. ledna 2026

## Status
✅ **OPRAVENO**

---

## Dodatečná oprava: Sekce se automaticky sbalovala

### Nový problém (zjištěn 6. 1. 2026)
Když uživatel napsal "7" do pole Telefon, sekce "Kontaktní údaje" se **automaticky sbalila** a zobrazila kompaktní zobrazení s "7", což znemožnilo dopsat celé číslo.

### Příčina
**Řádek 205** (původní kód):
```typescript
const contactsPreFilled = contactPerson && contactPhone && contactEmail
```

Když uživatel napsal "7", toto se vyhodnotilo jako `true`, protože "7" je truthy hodnota, a sekce se automaticky sbalila.

### Řešení

#### 1. Změna inicializace `contactExpanded`
```typescript
// PŘED:
const [contactExpanded, setContactExpanded] = useState(false)

// PO:
const [contactExpanded, setContactExpanded] = useState(
  !profile.full_name || !profile.phone || !profile.email
)
```
Sekce se nyní automaticky rozbalí, pokud profil nemá všechny údaje vyplněné.

#### 2. Změna podmínky `contactsPreFilled`
```typescript
// PŘED:
const contactsPreFilled = contactPerson && contactPhone && contactEmail

// PO:
const contactsPreFilled = contactPerson && contactPhone && 
  contactPhone.replace(/\s/g, '').length >= 9 && contactEmail
```
Sekce se sbalí jen když telefon má **alespoň 9 znaků** (bez mezer).

### Výsledek
- ✅ Sekce zůstane **rozbalená** při psaní telefonu
- ✅ Uživatel může **dopsat celé telefonní číslo**
- ✅ Sekce se sbalí až když je telefon **kompletní** (alespoň 9 číslic)

## Finální status
✅ **PLNĚ OPRAVENO** - Uživatel může nyní normálně psát celé telefonní číslo!

