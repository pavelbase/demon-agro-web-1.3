# Referenční hodnoty pro produkty vápnění

Tento dokument obsahuje referenční hodnoty z etiket reálných produktů pro zadávání do systému.

## 📊 Přehled parametrů

Systém nyní podporuje následující fyzikální vlastnosti pro produkty vápnění:

- **Vlhkost (%)** - `moisture_content`
- **Částice nad 1 mm (%)** - `particles_over_1mm`
- **Částice pod 0,5 mm (%)** - `particles_under_05mm`
- **Částice 0,09-0,5 mm (%)** - `particles_009_05mm`

---

## 1. Dolomit (O1635)

**Výrobce:** Agroslužby Štěpán s.r.o.  
**Číslo registrace:** O1635  
**Typ hnojiva:** 17.1.5 (Dolomitický vápenec)

### Chemické vlastnosti
- **CaO + MgO jako CaCO₃ + MgCO₃:** min. 95,0%
- **MgO:** min. 40,0%
- **Neutralizační hodnota:** min. 50% CaO

### Fyzikální vlastnosti

| Parametr | Hodnota | Pole v systému |
|----------|---------|----------------|
| Vlhkost | max. 3,0% | `moisture_content: 3.0` |
| Částice nad 1 mm | max. 18,0% | `particles_over_1mm: 18.0` |
| Částice pod 0,5 mm | min. 74,0% | `particles_under_05mm: 74.0` |

### Příklad zadání do systému:
```
Název: Dolomit Štěpán
Typ: Dolomitický (CaO + MgO)
CaO: 50.0%
MgO: 40.0%
Reaktivita: Střední
Vlhkost: 3.0%
Částice nad 1 mm: 18.0%
Částice pod 0,5 mm: 74.0%
```

---

## 2. Vápenec Vitošov (O635)

**Výrobce:** VÁPENKA VITOŠOV s.r.o.  
**Číslo ohlášení:** O635  
**Typ:** 17.1.1 (Vápenec jemně mletý, druh A)

### Chemické vlastnosti
- **CaCO₃ + MgCO₃:** min. 80,0%
- **MgCO₃:** max. 2,0%
- **Vhodný pro:** středně těžké a lehčí půdy, travní porosty

### Fyzikální vlastnosti

| Parametr | Hodnota | Pole v systému |
|----------|---------|----------------|
| Vlhkost | 15,0 - 20,0% | `moisture_content: 15.0` nebo `20.0` |
| Částice 0,09-0,5 mm | min. 90,0% | `particles_009_05mm: 90.0` |

### Příklad zadání do systému:
```
Název: Vápenec Vitošov jemně mletý
Typ: Kalcitický (pouze CaO)
CaO: 45.0%
MgO: 1.1%
Reaktivita: Vysoká (rychlé působení)
Vlhkost: 17.5%
Částice 0,09-0,5 mm: 90.0%
```

---

## 🔄 Přepočet hodnot CaO a MgO

### Z etikety do systému

**Dolomit:**
- Etiketa uvádí: "Vápník celkový a hořčík celkový jako CaCO₃ + MgCO₃"
- Systém vyžaduje: % CaO a % MgO samostatně
- **Přepočet:**
  - Z celkové neutralizační hodnoty min. 50% CaO → `cao_content: 50.0`
  - Z hořčíku jako MgO min. 40,0% → `mgo_content: 40.0`

**Vápenec Vitošov:**
- Etiketa uvádí: "CaCO₃ + MgCO₃ min. 80,0%"
- Z toho MgCO₃ max. 2,0%
- **Přepočet:**
  - CaCO₃ (80%) → CaO přibližně 45% → `cao_content: 45.0`
  - MgCO₃ (2%) → MgO přibližně 1% → `mgo_content: 1.0`

---

## 📝 Poznámky k zadávání

### Povinná pole
- Název ✓
- Typ (calcitic/dolomite/both) ✓
- % CaO ✓

### Volitelná pole (ale důležitá!)
- % MgO
- Reaktivita
- **Vlhkost**
- **Obsah částic** (alespoň jeden typ)

### Důležité!
- Hodnoty vlhkosti a částic jsou důležité pro:
  - Výpočet reálného množství účinné látky
  - Plánování skladování
  - Kvalifikaci produktu pro různé způsoby aplikace
  - Sledování kvality dle etiket

### Různé typy frakce částic
Podle produktu použij správnou kombinaci:

**Hrubší frakce (Dolomit):**
- ✓ Částice nad 1 mm
- ✓ Částice pod 0,5 mm

**Jemná frakce (Vápenec mletý):**
- ✓ Částice 0,09-0,5 mm

---

## 🎯 Doporučené dávkování (z etiket)

### Dolomit
**Udržovací vápenění:**
- 1,4t dolomitu 1× za 3 roky
- nebo 2,3t jednou za 5 let při optimálním pH

**Meliorační vápenění (20 cm ornice):**

| pH aktuální | Dávka orná půda | Max. jednorázová | pH TTP | Dávka TTP |
|-------------|----------------|------------------|---------|-----------|
| 4,1-4,5 | 7 t/ha | Max 3,4t | do 4,0 | 5 t/ha |
| 4,6-5,0 | 5 t/ha | Max 3,4t | 4,1-4,5 | 4 t/ha |

### Vápenec Vitošov
**Doporučené dávky dle pH a půdního druhu:**

| pH | Lehká půda | Střední půda | Těžká půda |
|----|-----------|--------------|------------|
| 4,5 a méně | 1,80 t/ha | 3,00 t/ha | 3,60 t/ha |
| 4,6 až 5,0 | 1,20 t/ha | 2,00 t/ha | 2,40 t/ha |
| 5,1 až 5,5 | 0,60 t/ha | 1,00 t/ha | 1,20 t/ha |
| 5,6 až 6,5 | 0,40 t/ha | 0,60 t/ha | 0,80 t/ha |

---

## ⚠️ Bezpečnost práce (z etiket)

**Vápenec Vitošov:**
- Mletý vápenec je dráždivý
- Dráždí oči
- Při práci zamezte styku s očima
- Používejte vhodný ochranný oděv, rukavice a brýle
- Vdechování prachu zabraňte použitím ochranných pomůcek

**Uchovávejte mimo dosah dětí!**

---

## 📦 Skladování (z etiket)

**Dolomit:**
- Doba použitelnosti: 5 let při dodržení podmínek skladování
- Dodává se volně ložený
- Nevhodné místa se stojatou/tekoucí vodou
- Vyhýbejte se blízkosti vodotečí a kanalizace

**Vápenec Vitošov:**
- Doba použitelnosti: 2 roky při dodržení podmínek skladování
- Dodává se balený (papírové pytle, palety) i volně ložený
- Chraňte před poškozením obalu a působením vlhkosti

---

## ✅ Ekologické zemědělství

Oba produkty jsou povoleny pro použití v ekologickém zemědělství:
- **Dolomit:** Dle Nařízení Rady (ES) č. 834/2007 a č. 889/2008
- **Vápenec Vitošov:** V souladu s evropskými předpisy

**Upozornění:** Výrobek nesmí být použit v době medovice, v blízkosti včelstev a při silném větru vanoucím směrem ke včelstvům.

---

*Dokument vytvořen: 3.1.2026*  
*Pro potřeby Démon Agro - Správa produktů vápnění*




