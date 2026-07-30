'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, AlertCircle, Save, Truck, ArrowRight, Download } from 'lucide-react'
import { AgroCustomer } from '@/lib/types/database'
import toast from 'react-hot-toast'

// Konstanta - kapacita kamionu
const TRUCK_CAPACITY = 30 // tun

// Typ pro zákazníka s výpočty
interface CustomerWithCalculations extends AgroCustomer {
  calculations: {
    // Kamionová logistika
    teoretickaPotrebaTun: number
    pocetKamionuAuto: number
    pocetKamionuSkutecny: number
    skutecneMnozstviTun: number
    skutecnaDavkaKgHa: number
    
    // Původní výpočty (s přepočtem na skutečnou dávku)
    spotrebaMaterialu: number
    celkemHodin: number
    trzba: number
    nakladMaterial: number
    nakladTraktor: number
    nakladNafta: number
    nakladTraktorista: number
    nakladyCelkem: number
    hrubyZisk: number
    ziskNaHodinu: number
    ziskNaHektar: number
    
    // Doporučená cena
    doporucenaCena: number
  }
}

export function AgroManagerCalculator() {
  const [customers, setCustomers] = useState<AgroCustomer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Editační stav pro aktivního zákazníka
  const [editData, setEditData] = useState<Partial<AgroCustomer>>({})

  // Načíst zákazníky z API
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Keyboard shortcut: Ctrl+S pro uložení
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (selectedCustomerId && editData.id) {
          handleSaveCustomer()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCustomerId, editData])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/agro-customers')
      const data = await response.json()
      
      if (data.success) {
        setCustomers(data.customers || [])
        if (data.customers?.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data.customers[0].id)
        }
      } else {
        toast.error(data.error || 'Chyba při načítání zákazníků')
      }
    } catch (error) {
      console.error('Fetch customers error:', error)
      toast.error('Nepodařilo se načíst zákazníky')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/agro-customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      
      const data = await response.json()
      
      if (data.success && data.customer) {
        setCustomers([data.customer, ...customers])
        setSelectedCustomerId(data.customer.id)
        setEditData(data.customer)
        toast.success('Nová zakázka byla přidána')
      } else {
        toast.error(data.error || 'Chyba při vytváření zakázky')
      }
    } catch (error) {
      console.error('Add customer error:', error)
      toast.error('Nepodařilo se přidat zakázku')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Opravdu chcete smazat zákazníka "${customerName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/agro-customers/${customerId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCustomers(customers.filter(c => c.id !== customerId))
        if (selectedCustomerId === customerId) {
          const remaining = customers.filter(c => c.id !== customerId)
          setSelectedCustomerId(remaining[0]?.id || null)
        }
        toast.success('Zákazník byl smazán')
      } else {
        toast.error(data.error || 'Chyba při mazání zákazníka')
      }
    } catch (error) {
      console.error('Delete customer error:', error)
      toast.error('Nepodařilo se smazat zákazníka')
    }
  }

  const handleSaveCustomer = async () => {
    if (!selectedCustomerId || !editData) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/agro-customers/${selectedCustomerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      
      const data = await response.json()
      
      if (data.success && data.customer) {
        setCustomers(customers.map(c => 
          c.id === selectedCustomerId ? data.customer : c
        ))
        toast.success('Změny byly uloženy')
      } else {
        toast.error(data.error || 'Chyba při ukládání')
      }
    } catch (error) {
      console.error('Save customer error:', error)
      toast.error('Nepodařilo se uložit změny')
    } finally {
      setSaving(false)
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId)
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setEditData(customer)
    }
  }

  const handleFieldChange = (field: keyof AgroCustomer, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handler pro změnu počtu kamionů
  const handleTruckCountChange = (change: number) => {
    if (!selectedCustomer) return
    const current = selectedCustomer.calculations.pocetKamionuSkutecny
    const newCount = Math.max(1, current + change)
    
    setEditData(prev => ({
      ...prev,
      pocet_kamionu: newCount,
    }))
  }

  // Handler pro použití doporučené ceny
  const handleUseRecommendedPrice = () => {
    if (!selectedCustomer) return
    const recommended = selectedCustomer.calculations.doporucenaCena
    
    setEditData(prev => ({
      ...prev,
      cena_prodej_sluzba_ha: Math.round(recommended),
    }))
    
    toast.success('Doporučená cena byla použita')
  }

  // Handler pro export do Excelu
  const handleExportToExcel = async () => {
    if (customers.length === 0) {
      toast.error('Žádné zakázky k exportu')
      return
    }

    try {
      // Načteno dynamicky – xlsx je těžká knihovna, nemá smysl ji stahovat, dokud uživatel export nevyžádá
      const XLSX = await import('xlsx')
      // Připravit data pro export
      const exportData = customers.map(customer => {
        const vymera = Number(customer.vymera_ha) || 0
        const davkaZadana = Number(customer.davka_kg_ha) || 0
        const vykonnost = Number(customer.vykonnost_ha_mth) || 1
        const cenaNakup = Number(customer.cena_nakup_material_tuna) || 0
        const cenaProdej = Number(customer.cena_prodej_sluzba_ha) || 0
        const cenaNajem = Number(customer.cena_najem_traktor_mth) || 0
        const cenaNafta = Number(customer.cena_nafta_tuna_materialu) || 0
        const pozadovanyZisk = Number(customer.pozadovany_zisk_ha) || 330

        // Kamionová logistika
        const teoretickaPotrebaTun = (vymera * davkaZadana) / 1000
        const pocetKamionuAuto = Math.ceil(teoretickaPotrebaTun / TRUCK_CAPACITY)
        const pocetKamionuSkutecny = customer.pocet_kamionu ?? pocetKamionuAuto
        const skutecneMnozstviTun = pocetKamionuSkutecny * TRUCK_CAPACITY
        const skutecnaDavkaKgHa = vymera > 0 ? (skutecneMnozstviTun * 1000) / vymera : 0

        // Výpočty
        const spotrebaMaterialu = skutecneMnozstviTun
        const celkemHodin = vymera / vykonnost
        const trzba = vymera * cenaProdej
        const nakladMaterial = spotrebaMaterialu * cenaNakup
        const nakladTraktor = celkemHodin * cenaNajem
        const nakladNafta = spotrebaMaterialu * cenaNafta
        
        const cenaTraktoristaMth = Number(customer.cena_traktorista_mth) || 0
        const cenaTraktoristaTuna = Number(customer.cena_traktorista_tuna) || 0
        const traktoristaTyp = customer.traktorista_typ || 'hodina'
        const nakladTraktorista = traktoristaTyp === 'hodina'
          ? celkemHodin * cenaTraktoristaMth
          : spotrebaMaterialu * cenaTraktoristaTuna
        
        const nakladyCelkem = nakladMaterial + nakladTraktor + nakladNafta + nakladTraktorista
        const hrubyZisk = trzba - nakladyCelkem
        const ziskNaHodinu = celkemHodin > 0 ? hrubyZisk / celkemHodin : 0
        const ziskNaHektar = vymera > 0 ? hrubyZisk / vymera : 0
        const doporucenaCena = vymera > 0 ? (nakladyCelkem + (pozadovanyZisk * vymera)) / vymera : 0

        return {
          'Název zakázky': customer.jmeno,
          'Výměra (ha)': vymera,
          'Dávka zadaná (kg/ha)': davkaZadana,
          'Teoretická potřeba (t)': Number(teoretickaPotrebaTun.toFixed(2)),
          'Počet kamionů': pocetKamionuSkutecny,
          'Skutečné množství (t)': skutecneMnozstviTun,
          'Skutečná dávka (kg/ha)': Number(skutecnaDavkaKgHa.toFixed(1)),
          'Výkonnost (ha/mth)': vykonnost,
          'Celkem hodin (mth)': Number(celkemHodin.toFixed(2)),
          'Produktivita (t/mth)': celkemHodin > 0 ? Number((spotrebaMaterialu / celkemHodin).toFixed(2)) : 0,
          'Cena nákup (Kč/t)': cenaNakup,
          'Cena prodej (Kč/ha)': cenaProdej,
          'Doporučená cena (Kč/ha)': Number(doporucenaCena.toFixed(0)),
          'Cílový zisk (Kč/ha)': pozadovanyZisk,
          'Tržba (Kč)': Number(trzba.toFixed(0)),
          'Náklad materiál (Kč)': Number(nakladMaterial.toFixed(0)),
          'Náklad traktor (Kč)': Number(nakladTraktor.toFixed(0)),
          'Náklad nafta (Kč)': Number(nakladNafta.toFixed(0)),
          'Náklad traktorista (Kč)': Number(nakladTraktorista.toFixed(0)),
          'Náklady celkem (Kč)': Number(nakladyCelkem.toFixed(0)),
          'Hrubý zisk (Kč)': Number(hrubyZisk.toFixed(0)),
          'Zisk/hodina (Kč/mth)': Number(ziskNaHodinu.toFixed(0)),
          'Zisk/hektar (Kč/ha)': Number(ziskNaHektar.toFixed(0)),
        }
      })

      // Přidat souhrnný řádek
      exportData.push({
        'Název zakázky': `CELKEM (${totalMetrics.count}× zakázek)`,
        'Výměra (ha)': Number(totalMetrics.totalVymera.toFixed(1)),
        'Dávka zadaná (kg/ha)': '',
        'Teoretická potřeba (t)': '',
        'Počet kamionů': Math.ceil(totalMetrics.totalTuny / TRUCK_CAPACITY),
        'Skutečné množství (t)': Number(totalMetrics.totalTuny.toFixed(1)),
        'Skutečná dávka (kg/ha)': '',
        'Výkonnost (ha/mth)': '',
        'Celkem hodin (mth)': Number(totalMetrics.totalHodin.toFixed(1)),
        'Produktivita (t/mth)': totalMetrics.totalHodin > 0 ? Number((totalMetrics.totalTuny / totalMetrics.totalHodin).toFixed(2)) : 0,
        'Cena nákup (Kč/t)': '',
        'Cena prodej (Kč/ha)': '',
        'Doporučená cena (Kč/ha)': '',
        'Cílový zisk (Kč/ha)': '',
        'Tržba (Kč)': Number(totalMetrics.totalTrzba.toFixed(0)),
        'Náklad materiál (Kč)': '',
        'Náklad traktor (Kč)': '',
        'Náklad nafta (Kč)': '',
        'Náklad traktorista (Kč)': '',
        'Náklady celkem (Kč)': Number(totalMetrics.totalNaklady.toFixed(0)),
        'Hrubý zisk (Kč)': Number(totalMetrics.totalZisk.toFixed(0)),
        'Zisk/hodina (Kč/mth)': '',
        'Zisk/hektar (Kč/ha)': totalMetrics.totalVymera > 0 ? Number((totalMetrics.totalZisk / totalMetrics.totalVymera).toFixed(0)) : 0,
      })

      // Vytvořit workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'AgroManažer')

      // Nastavit šířky sloupců
      const columnWidths = [
        { wch: 25 }, // Název zakázky
        { wch: 12 }, // Výměra
        { wch: 15 }, // Dávka zadaná
        { wch: 15 }, // Teoretická potřeba
        { wch: 12 }, // Počet kamionů
        { wch: 15 }, // Skutečné množství
        { wch: 15 }, // Skutečná dávka
        { wch: 15 }, // Výkonnost
        { wch: 15 }, // Celkem hodin
        { wch: 15 }, // Produktivita
        { wch: 14 }, // Cena nákup
        { wch: 14 }, // Cena prodej
        { wch: 16 }, // Doporučená cena
        { wch: 14 }, // Cílový zisk
        { wch: 14 }, // Tržba
        { wch: 16 }, // Náklad materiál
        { wch: 16 }, // Náklad traktor
        { wch: 14 }, // Náklad nafta
        { wch: 18 }, // Náklad traktorista
        { wch: 16 }, // Náklady celkem
        { wch: 14 }, // Hrubý zisk
        { wch: 16 }, // Zisk/hodina
        { wch: 16 }, // Zisk/hektar
      ]
      worksheet['!cols'] = columnWidths

      // Vygenerovat a stáhnout soubor
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `AgroManager_export_${timestamp}.xlsx`
      XLSX.writeFile(workbook, filename)

      toast.success(`Export dokončen: ${filename}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Chyba při exportu do Excelu')
    }
  }

  // Výpočty pro vybraného zákazníka (s kamionovou logikou)
  const selectedCustomer: CustomerWithCalculations | null = useMemo(() => {
    if (!selectedCustomerId) return null
    
    const customer = customers.find(c => c.id === selectedCustomerId)
    if (!customer) return null

    const data = editData.id === customer.id ? { ...customer, ...editData } : customer

    const vymera = Number(data.vymera_ha) || 0
    const davkaZadana = Number(data.davka_kg_ha) || 0
    const vykonnost = Number(data.vykonnost_ha_mth) || 1
    const cenaNakup = Number(data.cena_nakup_material_tuna) || 0
    const cenaProdej = Number(data.cena_prodej_sluzba_ha) || 0
    const cenaNajem = Number(data.cena_najem_traktor_mth) || 0
    const cenaNafta = Number(data.cena_nafta_tuna_materialu) || 0
    const pozadovanyZisk = Number(data.pozadovany_zisk_ha) || 330

    // === KAMIONOVÁ LOGISTIKA ===
    
    // 1. Teoretická potřeba (podle zadané dávky)
    const teoretickaPotrebaTun = (vymera * davkaZadana) / 1000
    
    // 2. Počet kamionů (automatický výpočet)
    const pocetKamionuAuto = Math.ceil(teoretickaPotrebaTun / TRUCK_CAPACITY)
    
    // 3. Skutečný počet kamionů (pokud uživatel ručně přepsal)
    const pocetKamionuSkutecny = data.pocet_kamionu !== null && data.pocet_kamionu !== undefined
      ? Number(data.pocet_kamionu)
      : pocetKamionuAuto
    
    // 4. Skutečné množství materiálu (co opravdu přijede)
    const skutecneMnozstviTun = pocetKamionuSkutecny * TRUCK_CAPACITY
    
    // 5. Skutečná dávka (přepočet - toto číslo se musí použít!)
    const skutecnaDavkaKgHa = vymera > 0 ? (skutecneMnozstviTun * 1000) / vymera : 0

    // === VÝPOČTY NÁKLADŮ (S PŘEPOČTENOU DÁVKOU) ===
    
    const spotrebaMaterialu = skutecneMnozstviTun
    const celkemHodin = vymera / vykonnost
    const trzba = vymera * cenaProdej
    const nakladMaterial = spotrebaMaterialu * cenaNakup
    const nakladTraktor = celkemHodin * cenaNajem
    const nakladNafta = spotrebaMaterialu * cenaNafta
    
    // Náklad traktorista (podle typu výpočtu)
    const cenaTraktoristaMth = Number(data.cena_traktorista_mth) || 0
    const cenaTraktoristaTuna = Number(data.cena_traktorista_tuna) || 0
    const traktoristaTyp = data.traktorista_typ || 'hodina'
    const nakladTraktorista = traktoristaTyp === 'hodina'
      ? celkemHodin * cenaTraktoristaMth
      : spotrebaMaterialu * cenaTraktoristaTuna
    
    const nakladyCelkem = nakladMaterial + nakladTraktor + nakladNafta + nakladTraktorista
    const hrubyZisk = trzba - nakladyCelkem
    const ziskNaHodinu = celkemHodin > 0 ? hrubyZisk / celkemHodin : 0
    const ziskNaHektar = vymera > 0 ? hrubyZisk / vymera : 0

    // === DOPORUČENÁ CENA (Reverse Engineering) ===
    // Aby zisk byl = pozadovanyZisk, musí být cena:
    // Cena = (Náklady + požadovaný zisk celkem) / výměra
    const doporucenaCena = vymera > 0 
      ? (nakladyCelkem + (pozadovanyZisk * vymera)) / vymera
      : 0

    return {
      ...customer,
      ...data,
      calculations: {
        teoretickaPotrebaTun,
        pocetKamionuAuto,
        pocetKamionuSkutecny,
        skutecneMnozstviTun,
        skutecnaDavkaKgHa,
        
        spotrebaMaterialu,
        celkemHodin,
        trzba,
        nakladMaterial,
        nakladTraktor,
        nakladNafta,
        nakladTraktorista,
        nakladyCelkem,
        hrubyZisk,
        ziskNaHodinu,
        ziskNaHektar,
        
        doporucenaCena,
      },
    }
  }, [selectedCustomerId, customers, editData])

  const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('cs-CZ', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  // Výpočet celkových metrik ze VŠECH zákazníků
  const totalMetrics = useMemo(() => {
    if (customers.length === 0) {
      return {
        totalTrzba: 0,
        totalNaklady: 0,
        totalZisk: 0,
        totalVymera: 0,
        totalHodin: 0,
        totalTuny: 0,
        count: 0,
      }
    }

    let totalTrzba = 0
    let totalNaklady = 0
    let totalZisk = 0
    let totalVymera = 0
    let totalHodin = 0
    let totalTuny = 0

    customers.forEach(customer => {
      const vymera = Number(customer.vymera_ha) || 0
      const davka = Number(customer.davka_kg_ha) || 0
      const vykonnost = Number(customer.vykonnost_ha_mth) || 1
      const cenaNakup = Number(customer.cena_nakup_material_tuna) || 0
      const cenaProdej = Number(customer.cena_prodej_sluzba_ha) || 0
      const cenaNajem = Number(customer.cena_najem_traktor_mth) || 0
      const cenaNafta = Number(customer.cena_nafta_tuna_materialu) || 0

      // Kamionová logistika pro souhrn
      const teoretickaPotrebaTun = (vymera * davka) / 1000
      const pocetKamionuAuto = Math.ceil(teoretickaPotrebaTun / TRUCK_CAPACITY)
      const pocetKamionuSkutecny = customer.pocet_kamionu !== null && customer.pocet_kamionu !== undefined
        ? Number(customer.pocet_kamionu)
        : pocetKamionuAuto
      const skutecneMnozstviTun = pocetKamionuSkutecny * TRUCK_CAPACITY

      const spotrebaMaterialu = skutecneMnozstviTun
      const celkemHodin = vymera / vykonnost
      const trzba = vymera * cenaProdej
      const nakladMaterial = spotrebaMaterialu * cenaNakup
      const nakladTraktor = celkemHodin * cenaNajem
      const nakladNafta = spotrebaMaterialu * cenaNafta
      
      // Náklad traktorista (podle typu výpočtu)
      const cenaTraktoristaMth = Number(customer.cena_traktorista_mth) || 0
      const cenaTraktoristaTuna = Number(customer.cena_traktorista_tuna) || 0
      const traktoristaTyp = customer.traktorista_typ || 'hodina'
      const nakladTraktorista = traktoristaTyp === 'hodina'
        ? celkemHodin * cenaTraktoristaMth
        : spotrebaMaterialu * cenaTraktoristaTuna
      
      const nakladyCelkem = nakladMaterial + nakladTraktor + nakladNafta + nakladTraktorista
      const hrubyZisk = trzba - nakladyCelkem

      totalTrzba += trzba
      totalNaklady += nakladyCelkem
      totalZisk += hrubyZisk
      totalVymera += vymera
      totalHodin += celkemHodin
      totalTuny += skutecneMnozstviTun
    })

    return {
      totalTrzba,
      totalNaklady,
      totalZisk,
      totalVymera,
      totalHodin,
      totalTuny,
      count: customers.length,
    }
  }, [customers])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-2">
      {/* ===== LEVÝ PANEL: SEZNAM ZÁKAZNÍKŮ (Kompaktní) ===== */}
      <div className="w-56 bg-white rounded border border-gray-300 flex flex-col flex-shrink-0">
        
        {/* Tlačítko Přidat */}
        <div className="p-2 border-b border-gray-300">
          <button
            onClick={handleAddCustomer}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1 bg-primary-green text-white px-2 py-1.5 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Přidat zakázku
          </button>
        </div>

        {/* CELKOVÉ VÝPOČTY */}
        {customers.length > 0 && (
          <div className="border-b border-gray-300 bg-gray-50">
            <div className="px-2 py-1 bg-gray-200 border-b border-gray-300">
              <h3 className="text-xs font-bold text-gray-700 uppercase">Celkem ({totalMetrics.count}x)</h3>
            </div>
            <div className="p-2 space-y-1 text-xs">
              {/* Tržba */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tržba:</span>
                <span className="font-bold text-blue-700">
                  {formatNumber(totalMetrics.totalTrzba, 0)} Kč
                </span>
              </div>
              
              {/* Náklady */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Náklady:</span>
                <span className="font-bold text-red-700">
                  {formatNumber(totalMetrics.totalNaklady, 0)} Kč
                </span>
              </div>
              
              {/* Zisk */}
              <div className="flex justify-between items-center py-1 border-t border-gray-300">
                <span className="text-gray-700 font-semibold">ZISK:</span>
                <span className={`font-bold ${
                  totalMetrics.totalZisk > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatNumber(totalMetrics.totalZisk, 0)} Kč
                </span>
              </div>

              {/* Další metriky */}
              <div className="pt-1 border-t border-gray-200 space-y-0.5">
                <div className="flex justify-between text-gray-600">
                  <span>Výměra:</span>
                  <span>{formatNumber(totalMetrics.totalVymera, 1)} ha</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>⏱️ Hodiny:</span>
                  <span className="font-semibold text-blue-700">{formatNumber(totalMetrics.totalHodin, 1)} mth</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>🚛 Materiál:</span>
                  <span className="font-semibold text-orange-700">{formatNumber(totalMetrics.totalTuny, 1)} t</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[10px] italic">
                  <span>Produktivita:</span>
                  <span className="text-gray-500">
                    {totalMetrics.totalHodin > 0 
                      ? formatNumber(totalMetrics.totalTuny / totalMetrics.totalHodin, 1) 
                      : '0'} t/mth
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 pt-0.5 border-t border-gray-200">
                  <span>Ø Zisk/ha:</span>
                  <span className={totalMetrics.totalVymera > 0 && totalMetrics.totalZisk / totalMetrics.totalVymera > 0 ? 'text-green-700' : 'text-red-700'}>
                    {totalMetrics.totalVymera > 0 
                      ? formatNumber(totalMetrics.totalZisk / totalMetrics.totalVymera, 0) 
                      : '0'} Kč
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export do Excelu */}
        {customers.length > 0 && (
          <div className="p-2 border-b border-gray-300">
            <button
              onClick={handleExportToExcel}
              className="w-full flex items-center justify-center gap-1.5 bg-green-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors"
              title="Exportovat všechny zakázky do Excelu"
            >
              <Download className="h-3.5 w-3.5" />
              Export do Excelu
            </button>
          </div>
        )}

        {/* Seznam Zákazníků */}
        <div className="flex-1 overflow-y-auto p-2">
          {customers.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Zatím žádné zakázky</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer.id)}
                  className={`
                    flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-sm
                    ${selectedCustomerId === customer.id
                      ? 'bg-primary-green text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }
                  `}
                >
                  <span className="font-medium truncate flex-1 text-xs">
                    {customer.jmeno}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCustomer(customer.id, customer.jmeno)
                    }}
                    className={`
                      ml-1 p-0.5 rounded hover:bg-red-100 transition-colors
                      ${selectedCustomerId === customer.id ? 'text-white hover:bg-red-600' : 'text-red-600'}
                    `}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== PRAVÝ PANEL: HIGH DENSITY KALKULAČKA ===== */}
      <div className="flex-1 bg-white rounded border border-gray-300 overflow-hidden flex flex-col">
        {!selectedCustomer ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium">Vyberte zákazníka ze seznamu</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tenká Hlavička s Názvem a Tlačítkem Uložit */}
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex items-center gap-2">
              <input
                type="text"
                value={editData.jmeno || ''}
                onChange={(e) => handleFieldChange('jmeno', e.target.value)}
                className="flex-1 px-2 py-1 text-sm font-bold border border-gray-300 rounded focus:ring-1 focus:ring-primary-green focus:border-primary-green"
                placeholder="Název zakázky..."
              />
              <button
                onClick={handleSaveCustomer}
                disabled={saving}
                className="flex items-center gap-1 bg-primary-green text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Uložit změny (Ctrl+S)"
              >
                <Save className="h-3 w-3" />
                {saving ? 'Ukládání...' : 'Uložit'}
              </button>
            </div>

            {/* Grid Layout - EXCEL STYLE */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-12 gap-0 border border-gray-300 text-xs">
                
                {/* ===== VSTUPNÍ PARAMETRY ===== */}
                
                {/* Řádek 1: Výměra, Dávka, Výkonnost */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Výměra (ha)</div>
                <div className="col-span-3 bg-white border-b border-r border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.vymera_ha ?? ''}
                    onChange={(e) => handleFieldChange('vymera_ha', Number(e.target.value))}
                    step="0.01"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Dávka (kg/ha)</div>
                <div className="col-span-3 bg-white border-b border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.davka_kg_ha ?? ''}
                    onChange={(e) => handleFieldChange('davka_kg_ha', Number(e.target.value))}
                    step="0.01"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Řádek 2: Výkonnost */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Výkonnost (ha/mth)</div>
                <div className="col-span-9 bg-white border-b border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.vykonnost_ha_mth ?? ''}
                    onChange={(e) => handleFieldChange('vykonnost_ha_mth', Number(e.target.value))}
                    step="0.01"
                    min="0.1"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Řádek 3: Cena nákup materiálu */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Nákup materiálu (Kč/t)</div>
                <div className="col-span-9 bg-white border-b border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.cena_nakup_material_tuna ?? ''}
                    onChange={(e) => handleFieldChange('cena_nakup_material_tuna', Number(e.target.value))}
                    step="0.01"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Řádek 3b: Cena prodej služby + Doporučená cena */}
                <div className="col-span-3 bg-blue-100 border-b border-r border-gray-200 p-1 font-bold">Prodej služby (Kč/ha)</div>
                <div className="col-span-3 bg-white border-b border-r border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.cena_prodej_sluzba_ha ?? ''}
                    onChange={(e) => handleFieldChange('cena_prodej_sluzba_ha', Number(e.target.value))}
                    step="0.01"
                    className="w-full h-7 px-1 text-right text-xs font-bold border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div className="col-span-3 bg-green-50 border-b border-r border-gray-200 p-1 font-semibold text-green-700">
                  💡 Doporučená cena
                </div>
                <div className="col-span-3 bg-green-50 border-b border-gray-200 p-0">
                  <div className="flex items-center h-7">
                    <span className="flex-1 px-1 text-right font-bold text-green-700 text-xs">
                      {formatNumber(selectedCustomer.calculations.doporucenaCena, 0)} Kč
                    </span>
                    <button
                      onClick={handleUseRecommendedPrice}
                      className="px-2 h-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold border-l border-green-700"
                      title="Použít doporučenou cenu"
                    >
                      Použít
                    </button>
                  </div>
                </div>

                {/* Řádek 4: Cena nájem traktor, Cena nafta */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Nájem traktoru (Kč/mth)</div>
                <div className="col-span-3 bg-white border-b border-r border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.cena_najem_traktor_mth ?? ''}
                    onChange={(e) => handleFieldChange('cena_najem_traktor_mth', Number(e.target.value))}
                    step="0.01"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Nafta (Kč/t materiálu)</div>
                <div className="col-span-3 bg-white border-b border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.cena_nafta_tuna_materialu ?? ''}
                    onChange={(e) => handleFieldChange('cena_nafta_tuna_materialu', Number(e.target.value))}
                    step="0.01"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* ===== KAMIONOVÁ LOGISTIKA ===== */}
                <div className="col-span-12 bg-orange-100 border-b border-gray-300 p-1 font-bold text-center text-xs flex items-center justify-center gap-1">
                  <Truck className="h-3 w-3" />
                  LOGISTIKA KAMIONŮ (30t/kamion)
                </div>

                {/* Teoretická potřeba */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Teoretická potřeba (t)</div>
                <div className="col-span-3 bg-gray-50 border-b border-r border-gray-200 p-1 text-right font-mono text-xs">
                  {formatNumber(selectedCustomer.calculations.teoretickaPotrebaTun, 2)}
                </div>
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Auto výpočet kamionů</div>
                <div className="col-span-3 bg-gray-50 border-b border-gray-200 p-1 text-right font-mono text-xs">
                  {selectedCustomer.calculations.pocetKamionuAuto}× kamion
                </div>

                {/* Počet kamionů - s tlačítky +/- */}
                <div className="col-span-3 bg-orange-50 border-b border-r border-gray-200 p-1 font-bold">Počet kamionů</div>
                <div className="col-span-3 bg-white border-b border-r border-gray-200 p-0">
                  <div className="flex items-center h-7">
                    <button
                      onClick={() => handleTruckCountChange(-1)}
                      className="px-2 h-full hover:bg-red-100 text-red-600 font-bold border-r border-gray-200"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-bold text-orange-700">
                      {selectedCustomer.calculations.pocetKamionuSkutecny}×
                    </span>
                    <button
                      onClick={() => handleTruckCountChange(1)}
                      className="px-2 h-full hover:bg-green-100 text-green-600 font-bold border-l border-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="col-span-3 bg-orange-50 border-b border-r border-gray-200 p-1 font-bold">Skutečné množství (t)</div>
                <div className="col-span-3 bg-orange-50 border-b border-gray-200 p-1 text-right font-mono font-bold text-orange-700 text-xs">
                  {formatNumber(selectedCustomer.calculations.skutecneMnozstviTun, 2)} t
                </div>

                {/* Skutečná dávka */}
                <div className="col-span-3 bg-orange-50 border-b border-r border-gray-200 p-1 font-bold">
                  Skutečná dávka (kg/ha)
                </div>
                <div className="col-span-9 bg-orange-50 border-b border-gray-200 p-1 font-mono font-bold text-orange-700 text-xs flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  <span>{formatNumber(selectedCustomer.calculations.skutecnaDavkaKgHa, 1)} kg/ha</span>
                  <span className="text-gray-500 text-xs font-normal">
                    (původně {formatNumber(Number(editData.davka_kg_ha ?? 0), 0)} kg/ha)
                  </span>
                </div>

                {/* Požadovaný zisk */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Cílový zisk (Kč/ha)</div>
                <div className="col-span-9 bg-white border-b border-gray-200 p-0">
                  <input
                    type="number"
                    value={editData.pozadovany_zisk_ha ?? 330}
                    onChange={(e) => handleFieldChange('pozadovany_zisk_ha', Number(e.target.value))}
                    step="10"
                    className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Řádek 5: Traktorista - Typ výpočtu */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Traktorista typ</div>
                <div className="col-span-9 bg-white border-b border-gray-200 p-0">
                  <select
                    value={editData.traktorista_typ ?? 'hodina'}
                    onChange={(e) => handleFieldChange('traktorista_typ', e.target.value)}
                    className="w-full h-7 px-1 text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                  >
                    <option value="hodina">Za hodinu práce (Kč/mth)</option>
                    <option value="tuna">Za vyaplikovanou tunu (Kč/t)</option>
                  </select>
                </div>

                {/* Řádek 6: Traktorista - Ceny (podle typu) */}
                {editData.traktorista_typ === 'hodina' ? (
                  <>
                    <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Traktorista (Kč/mth)</div>
                    <div className="col-span-9 bg-white border-b border-gray-200 p-0">
                      <input
                        type="number"
                        value={editData.cena_traktorista_mth ?? ''}
                        onChange={(e) => handleFieldChange('cena_traktorista_mth', Number(e.target.value))}
                        step="0.01"
                        className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Traktorista (Kč/t)</div>
                    <div className="col-span-9 bg-white border-b border-gray-200 p-0">
                      <input
                        type="number"
                        value={editData.cena_traktorista_tuna ?? ''}
                        onChange={(e) => handleFieldChange('cena_traktorista_tuna', Number(e.target.value))}
                        step="0.01"
                        className="w-full h-7 px-1 text-right text-xs border-none focus:ring-0 focus:outline-none focus:bg-yellow-50"
                      />
                    </div>
                  </>
                )}

                {/* ===== VÝPOČTY ===== */}
                
                {/* Mezera/Oddělení */}
                <div className="col-span-12 bg-gray-200 border-b border-gray-300 p-1 font-bold text-center text-xs">
                  VÝPOČTY
                </div>

                {/* Spotřeba materiálu, Celkem hodin */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Spotřeba materiálu (t)</div>
                <div className="col-span-3 bg-gray-50 border-b border-r border-gray-200 p-1 text-right font-mono text-xs">
                  {formatNumber(selectedCustomer.calculations.spotrebaMaterialu, 2)}
                </div>
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Celkem hodin (mth)</div>
                <div className="col-span-3 bg-gray-50 border-b border-gray-200 p-1 text-right font-mono text-xs">
                  {formatNumber(selectedCustomer.calculations.celkemHodin, 2)}
                </div>

                {/* TRŽBA */}
                <div className="col-span-3 bg-blue-100 border-b border-r border-gray-200 p-1 font-bold">TRŽBA (Kč)</div>
                <div className="col-span-9 bg-blue-50 border-b border-gray-200 p-1 text-right font-mono font-bold text-blue-900 text-xs">
                  {formatNumber(selectedCustomer.calculations.trzba, 0)} Kč
                </div>

                {/* Náklady */}
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Náklad Materiál</div>
                <div className="col-span-3 bg-gray-50 border-b border-r border-gray-200 p-1 text-right font-mono text-red-700 text-xs">
                  {formatNumber(selectedCustomer.calculations.nakladMaterial, 0)} Kč
                </div>
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Náklad Traktor</div>
                <div className="col-span-3 bg-gray-50 border-b border-gray-200 p-1 text-right font-mono text-red-700 text-xs">
                  {formatNumber(selectedCustomer.calculations.nakladTraktor, 0)} Kč
                </div>

                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Náklad Nafta</div>
                <div className="col-span-3 bg-gray-50 border-b border-r border-gray-200 p-1 text-right font-mono text-red-700 text-xs">
                  {formatNumber(selectedCustomer.calculations.nakladNafta, 0)} Kč
                </div>
                <div className="col-span-3 bg-gray-100 border-b border-r border-gray-200 p-1 font-semibold">Náklad Traktorista</div>
                <div className="col-span-3 bg-gray-50 border-b border-gray-200 p-1 text-right font-mono text-red-700 text-xs">
                  {formatNumber(selectedCustomer.calculations.nakladTraktorista, 0)} Kč
                </div>

                {/* NÁKLADY CELKEM */}
                <div className="col-span-3 bg-red-100 border-b border-r border-gray-200 p-1 font-bold">NÁKLADY (Kč)</div>
                <div className="col-span-9 bg-red-50 border-b border-gray-200 p-1 text-right font-mono font-bold text-red-900 text-xs">
                  {formatNumber(selectedCustomer.calculations.nakladyCelkem, 0)} Kč
                </div>

                {/* HRUBÝ ZISK */}
                <div className={`col-span-3 border-b border-r border-gray-200 p-1 font-bold ${
                  selectedCustomer.calculations.hrubyZisk > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  HRUBÝ ZISK (Kč)
                </div>
                <div className={`col-span-9 border-b border-gray-200 p-1 text-right font-mono font-bold ${
                  selectedCustomer.calculations.hrubyZisk > 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {formatNumber(selectedCustomer.calculations.hrubyZisk, 0)} Kč
                </div>

                {/* Zisk na hodinu, Zisk na hektar */}
                <div className="col-span-3 bg-gray-100 border-r border-gray-200 p-1 font-semibold">Zisk/hodina (Kč/mth)</div>
                <div className={`col-span-3 border-r border-gray-200 p-1 text-right font-mono text-xs ${
                  selectedCustomer.calculations.ziskNaHodinu > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {formatNumber(selectedCustomer.calculations.ziskNaHodinu, 0)} Kč
                </div>
                <div className="col-span-3 bg-gray-100 border-r border-gray-200 p-1 font-semibold">Zisk/hektar (Kč/ha)</div>
                <div className={`col-span-3 p-1 text-right font-mono text-xs ${
                  selectedCustomer.calculations.ziskNaHektar > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {formatNumber(selectedCustomer.calculations.ziskNaHektar, 0)} Kč
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
