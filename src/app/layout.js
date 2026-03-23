import './globals.css'

export const metadata = {
  title: 'AutoLead | Painel',
  description: 'Sistema de gestão de leads automotivos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
