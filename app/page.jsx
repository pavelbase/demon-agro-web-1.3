export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary-brown mb-6">
          Démon agro
        </h1>
        <p className="text-xl md:text-2xl text-text-light leading-relaxed mb-12">
          Váš partner pro moderní zemědělství. Odborné řešení vápnění a hnojení.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-3xl shadow-warm p-8">
            <div className="text-4xl mb-4">🌾</div>
            <h3 className="text-xl font-bold mb-3">Vápnění</h3>
            <p className="text-text-light">Optimální pH pro vaše půdy</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-warm p-8">
            <div className="text-4xl mb-4">🧪</div>
            <h3 className="text-xl font-bold mb-3">Hnojení</h3>
            <p className="text-text-light">Přesné dávkování živin</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-warm p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Poradenství</h3>
            <p className="text-text-light">Odborné agronomické služby</p>
          </div>
        </div>
      </div>
    </div>
  )
}
