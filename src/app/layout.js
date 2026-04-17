import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'AutoLead AI | Painel Automotivo',
  description: 'Sistema inteligente de gestão de leads para concessionárias',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#f8fafc] text-slate-900 font-inter">
        <div className="flex min-h-screen">
          {/* Sidebar fixada à esquerda */}
          <Sidebar />
          
          {/* Área principal de conteúdo */}
          <main className="flex-1 min-w-0 h-screen overflow-y-auto">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}