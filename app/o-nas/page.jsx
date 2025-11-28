export default function ONasPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6">
          O nás
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-text-light leading-relaxed mb-8">
            Jsme tým zkušených agronomů s dlouholetou praxí v oblasti vápnění a hnojení půd.
          </p>
          
          <div className="bg-white rounded-3xl shadow-warm-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary-brown mb-4">Naše mise</h2>
            <p className="text-text-dark leading-relaxed">
              Pomáháme zemědělcům dosahovat vyšších výnosů prostřednictvím moderních 
              agronomických přístupů, přesné analýzy půdy a optimálního hnojení.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-warm-lg p-8">
            <h2 className="text-2xl font-bold text-primary-brown mb-4">Proč si vybrat nás?</h2>
            <ul className="space-y-3 text-text-dark">
              <li>✓ Více než 15 let zkušeností</li>
              <li>✓ Individuální přístup ke každému zákazníkovi</li>
              <li>✓ Moderní analytické metody</li>
              <li>✓ Komplexní servis od analýzy po aplikaci</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
