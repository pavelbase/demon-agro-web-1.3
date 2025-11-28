export default function ReseniHnojeniPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6">
          Hnojení
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-text-light leading-relaxed mb-8">
            Přesné hnojení podle potřeb půdy a plodiny pro maximální efektivitu.
          </p>
          
          <div className="bg-white rounded-3xl shadow-warm-lg p-8">
            <h2 className="text-2xl font-bold text-primary-brown mb-4">Co nabízíme</h2>
            <ul className="space-y-3 text-text-dark">
              <li>✓ Analýza půdy a výživy rostlin</li>
              <li>✓ Návrh hnojícího plánu</li>
              <li>✓ Poradenství při výběru hnojiv</li>
              <li>✓ Optimalizace nákladů na hnojení</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
