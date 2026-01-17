# Instrukce pro nahrání screenshotů portálu

## 📸 Potřebné screenshoty

Do složky `demon-agro/public/images/portal-screenshots/` nahrajte následující 3 obrázky:

### 1. health-card.png
- Screenshot zdravotní karty půdy (první obrázek, který jste ukázal)
- Obsahuje: pH hodnoty, fosfor, draslík, hořčík, síru, vápník, poměr K:Mg
- Formát: PNG nebo JPG
- Doporučená šířka: 1200-1600px

### 2. parcels-list.png
- Screenshot seznamu pozemků (druhý obrázek)
- Obsahuje: tabulku s pozemky, kódy, výměry, kultury, pH, stavy
- Formát: PNG nebo JPG
- Doporučená šířka: 1200-1600px

### 3. liming-plan.png
- Screenshot časového plánu vápnění (třetí obrázek)
- Obsahuje: roky, období, produkty, dávky, pH vývoj
- Formát: PNG nebo JPG
- Doporučená šířka: 1200-1600px

## 🎯 Postup nahrání:

### Možnost A: Použít screenshoty z prohlížeče
1. Otevřete portál ve vašem prohlížeči
2. Přejděte na každou z těchto stránek:
   - Zdravotní karta půdy nějakého pozemku
   - Seznam pozemků
   - Časový plán vápnění
3. Vytvořte screenshot (Windows: Win+Shift+S, Mac: Cmd+Shift+4)
4. Ořízněte obrázek na relevantní část (bez zbytečných okrajů prohlížeče)
5. Uložte jako health-card.png, parcels-list.png, liming-plan.png

### Možnost B: Použít již existující screenshoty
1. Najděte screenshoty, které jste mi ukázal v chatu
2. Přejmenujte je podle výše uvedených názvů
3. Zkopírujte je do složky `demon-agro/public/images/portal-screenshots/`

## 🔧 PowerShell příkaz pro nahrání:

```powershell
# Zkopírujte vaše screenshoty do správné složky
# Nahraďte cesty k vašim souborům
Copy-Item "C:\cesta\k\vašemu\screenshot1.png" "demon-agro\public\images\portal-screenshots\health-card.png"
Copy-Item "C:\cesta\k\vašemu\screenshot2.png" "demon-agro\public\images\portal-screenshots\parcels-list.png"
Copy-Item "C:\cesta\k\vašemu\screenshot3.png" "demon-agro\public\images\portal-screenshots\liming-plan.png"
```

## ✅ Ověření

Po nahrání obrázků:
1. Zkontrolujte, že všechny 3 soubory jsou ve složce
2. Spusťte dev server: `npm run dev`
3. Otevřete http://localhost:3000/portal
4. Scrollujte dolů na sekci "Podívejte se na portál v akci"
5. Všechny 3 screenshoty by se měly zobrazit

## 🎨 Optimalizace (volitelné)

Pro nejlepší výkon můžete obrázky optimalizovat:
```powershell
# Pokud máte nainstalovaný ImageMagick nebo podobný nástroj
# Pro redukci velikosti bez ztráty kvality
```

---

**Status**: Čeká se na nahrání screenshotů
**Datum**: 6. ledna 2026



