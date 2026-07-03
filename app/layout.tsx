import './globals.css'

export const metadata = {
  title: 'PrediGol',
  description: 'Predicciones de futbol con IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
