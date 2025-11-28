'use client'

import { useState } from 'react'

export default function PoptavkaPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Zde by byla logika pro odeslání formuláře
    alert('Děkujeme za vaši poptávku! Brzy se vám ozveme.')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-6 text-center">
          Nezávazná poptávka
        </h1>
        <p className="text-xl text-text-light leading-relaxed mb-8 text-center">
          Vyplňte formulář a my se vám co nejdříve ozveme.
        </p>
        
        <div className="bg-white rounded-3xl shadow-warm-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-brown focus:outline-none transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-brown focus:outline-none transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-2">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-brown focus:outline-none transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-dark mb-2">
                Zpráva *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-brown focus:outline-none transition-all duration-200 resize-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-4 bg-green-cta text-white rounded-full hover:bg-opacity-90 transition-all duration-300 font-medium text-lg shadow-warm hover:shadow-warm-lg"
            >
              Odeslat poptávku
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
