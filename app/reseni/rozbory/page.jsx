export default function ReseniRozboryPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6">
          Rozbory půd
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-text-light leading-relaxed mb-8">
            Komplexní laboratorní rozbory půdy pro přesné zemědělské hospodaření.
          </p>
          
          <div className="bg-white rounded-3xl shadow-warm-lg p-8">
            <h2 className="text-2xl font-bold text-primary-brown mb-4">Typy rozborů</h2>
            <ul className="space-y-3 text-text-dark">
              <li>✓ Agrochemický rozbor půdy</li>
              <li>✓ Rozbor pH a výměnné kyselosti</li>
              <li>✓ Analýza obsahu živin (N, P, K, Ca, Mg, S)</li>
              <li>✓ Rozbor mikroelementů</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
