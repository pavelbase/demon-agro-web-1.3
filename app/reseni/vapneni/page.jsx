export default function ReseniVapneniPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6">
          Vápnění půd
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-text-light leading-relaxed mb-8">
            Profesionální řešení vápnění pro optimální pH půdy a vyšší výnosy.
          </p>
          
          <div className="bg-white rounded-3xl shadow-warm-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary-brown mb-4">Naše služby</h2>
            <ul className="space-y-3 text-text-dark">
              <li>✓ Rozbory půdy a stanovení potřeby vápnění</li>
              <li>✓ Doporučení vhodného typu vápna</li>
              <li>✓ Výpočet optimální dávky</li>
              <li>✓ Aplikace vápenných materiálů</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
