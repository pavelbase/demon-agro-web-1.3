export default function KontaktPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6">
          Kontakt
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-text-light leading-relaxed mb-8">
            Máte dotaz nebo zájem o naše služby? Neváhejte nás kontaktovat.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-warm-lg p-8">
              <h2 className="text-2xl font-bold text-primary-brown mb-4">📞 Telefon</h2>
              <p className="text-text-dark text-lg">+420 XXX XXX XXX</p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-warm-lg p-8">
              <h2 className="text-2xl font-bold text-primary-brown mb-4">📧 Email</h2>
              <p className="text-text-dark text-lg">info@demonagro.cz</p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-warm-lg p-8 md:col-span-2">
              <h2 className="text-2xl font-bold text-primary-brown mb-4">📍 Adresa</h2>
              <p className="text-text-dark">
                Démon agro s.r.o.<br />
                Ulice 123<br />
                123 45 Město
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
