import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ghost Context',
  description: 'Summon your kindred spirits!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body id="root" className={inter.className}>{children}</body>
    </html>
  )
}
