export default function RadcePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6">
          Agronomický rádce
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-text-light leading-relaxed mb-8">
            Praktické rady a tipy pro úspěšné zemědělství.
          </p>
          
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-warm-lg p-8">
              <h2 className="text-2xl font-bold text-primary-brown mb-4">📚 Znalostní báze</h2>
              <p className="text-text-light">
                Články, návody a doporučení od našich agronomů.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-warm-lg p-8">
              <h2 className="text-2xl font-bold text-primary-brown mb-4">💡 Časté dotazy</h2>
              <p className="text-text-light">
                Odpovědi na nejčastější otázky ohledně vápnění a hnojení.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
