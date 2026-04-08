"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">Démon Agro</h3>
            <p className="text-gray-400 text-sm">Komplexní služby pro moderní zemědělství</p>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-400 text-sm mb-2">
              Agrochemické zkoušení zemědělské půdy dle ČSN a vyhlášky č. 274/1998 Sb.
              Výsledky jsou uznatelné pro SZIF, ÚKZÚZ a agroenvironmentální programy.
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Ceny hnojiv: ceník Agro 2000, platný od 4. 2. 2026, splatnost 30 dní, parita FCA sklad.
              Kalkulace úspor jsou orientační — závisí na stavu půdy, plodině a aktuálních cenách hnojiv.
            </p>
            <p className="text-gray-400 text-sm">
              © 2026 Démon Agro. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
