# Test: Ověření problému s telefonním číslem

## Prosím proveďte tento test:

### 1. Otevřete DevTools v prohlížeči (F12)

### 2. Přejděte na stránku poptávky
- URL: `/portal/poptavky/nova`

### 3. Otevřete záložku "Console" v DevTools

### 4. Zkontrolujte PŮVODNÍ hodnotu telefonu v profilu:
Vložte do konzole:
```javascript
// Zkontrolovat aktuální profil v databázi
const response = await fetch('/api/profile', {method: 'GET'});
const profile = await response.json();
console.log('PROFIL PŘED:', profile.phone);
```

### 5. Nyní zadejte do pole "Telefon" jedno číslo (např. "7")
- Klikněte do pole "Telefon"
- Napište "7"
- **NEZAVÍREJTE pole, NEODEŠLETE formulář**

### 6. Zkontrolujte hodnotu telefonu v profilu ZNOVU:
Vložte do konzole:
```javascript
// Zkontrolovat profil po napsání "7"
const response2 = await fetch('/api/profile', {method: 'GET'});
const profile2 = await response2.json();
console.log('PROFIL PO napsání 7:', profile2.phone);
```

### 7. Porovnejte hodnoty:
- Je "PROFIL PŘED" stejný jako "PROFIL PO napsání 7"?
- **ANO** → Funguje správně! Telefon se NEUKLÁDÁ do profilu.
- **NE** → Chyba! Telefon se ukládá do profilu automaticky.

## Co znamená "uloží do poptávkového formuláře"?

Prosím upřesněte:

### A) Vidíte "7" v poli (normální):
```
Telefon: [7_____________]
```
To je **správné chování** - React ukládá hodnotu do lokálního stavu komponenty.
Text se zobrazí v poli, ale **NEUKLÁDÁ se do databáze**.

### B) Změní se telefon v profilu (problém):
Když otevřete:
- Nastavení profilu
- Nebo jiný formulář
→ A tam vidíte změněný telefon na "7"

To by byl **problém** - data se ukládají do databáze.

## Prosím sdělte výsledek testu!


