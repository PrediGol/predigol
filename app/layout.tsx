import './globals.css'
import BottomNav from '@/components/BottomNav'

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
      <body>
        <div style={{ paddingBottom: '80px' }}>{children}</div>
        <BottomNav />
      </body>
    </html>
  )
}
