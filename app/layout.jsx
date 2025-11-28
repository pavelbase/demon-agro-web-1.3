import './globals.css'
import Navigation from '@/components/navigation/Navigation'

export const metadata = {
  title: 'Démon agro | Odborník na hnojení a vápnění',
  description: 'Komplexní řešení pro zemědělství - vápnění, hnojení, agronomické poradenství.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body className="bg-cream text-text-dark antialiased">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-primary-brown text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">© 2024 Démon agro. Všechna práva vyhrazena.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
