import './globals.css'

export const metadata = {
  title: 'APEX v3 — Adaptive Portfolio Economics System',
  description: 'Three-layer capital system with live market data, risk engine, and profit funnel',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
