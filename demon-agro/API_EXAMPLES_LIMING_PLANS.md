# API PŘÍKLADY: Systém plánování vápnění

Tento soubor obsahuje příklady HTTP požadavků pro testování API endpoints.

## 1. Generování nového plánu vápnění

```http
POST /api/portal/liming-plans/generate
Content-Type: application/json
Cookie: sb-access-token=<your_token>

{
  "parcelId": "123e4567-e89b-12d3-a456-426614174000",
  "soilAnalysisId": "987e6543-e89b-12d3-a456-426614174000",
  "currentPh": 5.0,
  "targetPh": 6.5,
  "soilType": "S",
  "landUse": "orna",
  "currentMg": 76,
  "area": 10.5
}
```

**Odpověď (200 OK):**
```json
{
  "success": true,
  "planId": "abc12345-e89b-12d3-a456-426614174000",
  "warnings": [
    "Doporučeny kontrolní rozbory 1 rok po každé aplikaci"
  ],
  "applicationsCount": 2,
  "totalCaoNeed": 36.75
}
```

**Možné chyby:**
- 400: Chybí povinná pole
- 403: Nemáte oprávnění k pozemku
- 500: Chyba při generování

---

## 2. Získání existujícího plánu

```http
GET /api/portal/liming-plans/{planId}
Cookie: sb-access-token=<your_token>
```

**Odpověď (200 OK):**
```json
{
  "plan": {
    "id": "abc12345-...",
    "parcel_id": "123e4567-...",
    "current_ph": 5.0,
    "target_ph": 6.5,
    "soil_type": "S",
    "total_cao_need": 36.75,
    "total_cao_need_per_ha": 3.5,
    "status": "draft",
    "applications": [
      {
        "id": "app1-...",
        "year": 2026,
        "season": "podzim",
        "sequence_order": 1,
        "product_name": "Dolomit mletý",
        "cao_content": 30,
        "mgo_content": 18,
        "dose_per_ha": 3.67,
        "total_dose": 38.5,
        "cao_per_ha": 1.1,
        "mgo_per_ha": 0.66,
        "ph_before": 5.0,
        "ph_after": 5.4,
        "mg_after": 604,
        "notes": "Kriticky nízké Mg - dolomit NUTNÝ",
        "status": "planned"
      },
      {
        "id": "app2-...",
        "year": 2029,
        "season": "podzim",
        "sequence_order": 2,
        "product_name": "Dolomit mletý",
        "cao_content": 30,
        "mgo_content": 18,
        "dose_per_ha": 3.33,
        "total_dose": 35.0,
        "cao_per_ha": 1.0,
        "mgo_per_ha": 0.6,
        "ph_before": 5.4,
        "ph_after": 5.9,
        "mg_after": 1084,
        "notes": "Nízké Mg - doporučen dolomit",
        "status": "planned"
      }
    ]
  }
}
```

---

## 3. Aktualizace aplikace

```http
PATCH /api/portal/liming-plans/{planId}/applications/{applicationId}
Content-Type: application/json
Cookie: sb-access-token=<your_token>

{
  "year": 2025,
  "season": "jaro",
  "dose_per_ha": 3.0,
  "total_dose": 31.5
}
```

**Odpověď (200 OK):**
```json
{
  "success": true,
  "message": "Aplikace byla úspěšně aktualizována"
}
```

---

## 4. Smazání aplikace

```http
DELETE /api/portal/liming-plans/{planId}/applications/{applicationId}
Cookie: sb-access-token=<your_token>
```

**Odpověď (200 OK):**
```json
{
  "success": true,
  "message": "Aplikace byla smazána"
}
```

---

## 5. Aktualizace plánu

```http
PATCH /api/portal/liming-plans/{planId}
Content-Type: application/json
Cookie: sb-access-token=<your_token>

{
  "status": "approved",
  "notes": "Plán schválen agronomem"
}
```

**Odpověď (200 OK):**
```json
{
  "success": true,
  "message": "Plán byl aktualizován"
}
```

---

## 6. Smazání celého plánu

```http
DELETE /api/portal/liming-plans/{planId}
Cookie: sb-access-token=<your_token>
```

**Odpověď (200 OK):**
```json
{
  "success": true,
  "message": "Plán byl smazán"
}
```

---

## Testování pomocí cURL

### Generování plánu
```bash
curl -X POST https://demon-agro.vercel.app/api/portal/liming-plans/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "parcelId": "123e4567-e89b-12d3-a456-426614174000",
    "currentPh": 5.0,
    "targetPh": 6.5,
    "soilType": "S",
    "landUse": "orna",
    "currentMg": 76,
    "area": 10.5
  }'
```

### Získání plánu
```bash
curl -X GET https://demon-agro.vercel.app/api/portal/liming-plans/abc12345 \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

### Aktualizace aplikace
```bash
curl -X PATCH https://demon-agro.vercel.app/api/portal/liming-plans/abc12345/applications/app1 \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "year": 2025,
    "season": "jaro",
    "dose_per_ha": 3.0
  }'
```

---

## Testování v Postman

1. **Importuj Collection:**
   - Vytvoř novou collection "Liming Plans"
   - Přidej výše uvedené requesty

2. **Nastav Environment:**
   - `baseUrl`: https://demon-agro.vercel.app
   - `token`: Tvůj access token z Supabase
   - `planId`: ID existujícího plánu
   - `parcelId`: ID pozemku

3. **Spusť testy:**
   - Postupně volej endpoints
   - Ověř response codes a data

---

## Stavy plánu (status)

- `draft` - Koncept, editovatelný
- `approved` - Schválený, připravený k realizaci
- `in_progress` - Probíhající realizace
- `completed` - Dokončený

---

## Stavy aplikace (status)

- `planned` - Naplánovaná
- `ordered` - Objednaná (produkty)
- `applied` - Aplikovaná na pole
- `cancelled` - Zrušená

---

## Validace

### Rozsahy pH:
- Min: 4.0
- Max: 8.0
- Target musí být >= Current

### Půdní typy:
- `L` - Lehká
- `S` - Střední
- `T` - Těžká

### Využití půdy:
- `orna` - Orná půda
- `ttp` - Trvalý travní porost

### Období aplikace:
- `jaro` - Únor-Březen
- `podzim` - Září-Říjen

---

## Bezpečnost

Všechny endpoints jsou chráněny:
- ✅ Authentication (Supabase Auth)
- ✅ Authorization (RLS policies)
- ✅ Validace vstupů
- ✅ Rate limiting (Vercel)
- ✅ CORS policy

---

## Rate Limits

- Generování plánu: 10/hodina
- Ostatní endpoints: 100/hodina
- Při překročení: HTTP 429

---

**Vytvořeno:** 2026-01-03  
**Verze API:** 1.0.0


