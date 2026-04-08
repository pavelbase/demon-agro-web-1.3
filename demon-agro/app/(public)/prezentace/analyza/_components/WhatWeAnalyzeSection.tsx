"use client";

export default function WhatWeAnalyzeSection() {
  const parameters = [
    {
      symbol: "pH",
      name: "Reakce půdy",
      method: "roztok CaCl₂",
      importance: "Klíčový parametr — ovlivňuje dostupnost VŠECH živin. pH < 5,5 blokuje P a Mo, pH > 7,5 blokuje Fe, Mn, Zn.",
      category: "základní",
      color: "blue",
    },
    {
      symbol: "P",
      name: "Fosfor",
      method: "Mehlich 3 / Cox",
      importance: "Energetický metabolismus, dělení buněk, tvorba kořenů. Deficit = pomalý start, fialové listy.",
      category: "základní",
      color: "orange",
    },
    {
      symbol: "K",
      name: "Draslík",
      method: "Mehlich 3 / Egner",
      importance: "Vodní režim, odolnost vůči stresu, transport cukrů. Zásoby v ČR dlouhodobě klesají.",
      category: "základní",
      color: "green",
    },
    {
      symbol: "Mg",
      name: "Hořčík",
      method: "Mehlich 3",
      importance: "Součást chlorofylu, aktivátor enzymů. Deficit = žloutnutí listů (chloróza). Antagonismus s K.",
      category: "základní",
      color: "purple",
    },
    {
      symbol: "Ca",
      name: "Vápník",
      method: "Mehlich 3",
      importance: "Struktura půdy, buněčné stěny, pH pufrace. Základ sorpčního komplexu půdy.",
      category: "základní",
      color: "sky",
    },
    {
      symbol: "S",
      name: "Síra",
      method: "Mehlich 3",
      importance: "85 % českých půd má deficit síry. Bez S rostlina nevyužije dusík — plýtváte drahou aplikací LAD. Součást kompletní služby.",
      category: "základní",
      color: "amber",
    },
  ];

  const additionalParams = [
    { symbol: "Cox", name: "Humus", note: "Organická hmota, zásoby N" },
    { symbol: "B", name: "Bor", note: "Tvorba pylu a plodů" },
    { symbol: "Mn", name: "Mangan", note: "Fotosyntéza, aktivátor enzymů" },
    { symbol: "Zn", name: "Zinek", note: "Auxiny, dělení buněk, imunita" },
    { symbol: "Cu", name: "Měď", note: "Dýchání, tvorba bílkovin" },
    { symbol: "Fe", name: "Železo", note: "Chlorofyl, přenos elektronů" },
  ];

  const colorMap: Record<string, { bg: string; border: string; symbol: string; badge: string }> = {
    blue:   { bg: "bg-blue-50",   border: "border-blue-200",   symbol: "bg-blue-600 text-white",   badge: "bg-blue-100 text-blue-700" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", symbol: "bg-orange-500 text-white", badge: "bg-orange-100 text-orange-700" },
    green:  { bg: "bg-green-50",  border: "border-green-200",  symbol: "bg-green-600 text-white",  badge: "bg-green-100 text-green-700" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", symbol: "bg-purple-600 text-white", badge: "bg-purple-100 text-purple-700" },
    sky:    { bg: "bg-sky-50",    border: "border-sky-200",    symbol: "bg-sky-500 text-white",    badge: "bg-sky-100 text-sky-700" },
    amber:  { bg: "bg-amber-50",  border: "border-amber-200",  symbol: "bg-amber-600 text-white",  badge: "bg-amber-100 text-amber-700" },
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Co analyzujeme?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Kompletní služba zahrnuje 6 parametrů: pH, P, K, Mg, Ca, S — vše, co potřebujete pro variabilní hnojení
          </p>
        </div>

        {/* Základní parametry */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {parameters.map((param) => {
            const colors = colorMap[param.color];
            return (
              <div
                key={param.symbol}
                className={`${colors.bg} rounded-xl p-5 border-2 ${colors.border} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${colors.symbol} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-black shadow-sm`}
                  >
                    {param.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-gray-900">
                        {param.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                        {param.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">
                      Metoda: {param.method}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {param.importance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rozšířené parametry */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Rozšířený rozbor — humus a mikroprvky (na vyžádání)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {additionalParams.map((param) => (
              <div
                key={param.symbol}
                className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200 hover:border-blue-300 transition-all duration-200"
              >
                <div className="text-2xl font-black text-gray-700 mb-1">
                  {param.symbol}
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {param.name}
                </div>
                <div className="text-xs text-gray-500">{param.note}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Humus (Cox) doporučujeme při prvním rozboru nebo podezření na pokles organické hmoty. Mikroprvky u plodin s vysokými nároky (řepka, zelenina, mák) nebo při vizuálních příznacích deficitu.
          </p>
        </div>

        {/* pH tabulka kategorií */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Kategorie pH půdy — co vaše číslo znamená?
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Kategorie</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">pH (CaCl₂)</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Hodnocení</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Doporučení</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {[
                  { cat: "1 — silně kyselá",  ph: "< 4,5",    eval: "Nevhodné",        rec: "Intenzivní vápnění" },
                  { cat: "2 — kyselá",         ph: "4,5–5,4",  eval: "Problematické",   rec: "Vápnění nutné" },
                  { cat: "3 — slabě kyselá",   ph: "5,5–6,4",  eval: "Přijatelné",      rec: "Udržovací vápnění" },
                  { cat: "4 — neutrální",      ph: "6,5–7,2",  eval: "Optimální ✓",     rec: "Žádné zásahy" },
                  { cat: "5 — alkalická",      ph: "> 7,2",    eval: "Riziko deficitů", rec: "Konzultace specialisty" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-800">{row.cat}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{row.ph}</td>
                    <td className="py-2 px-3 text-gray-700">{row.eval}</td>
                    <td className="py-2 px-3 text-gray-600">{row.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
