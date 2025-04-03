import './globals.css'
import type { Metadata } from 'next'
import NavBar from '../components/navBar'

export const metadata: Metadata = {
  title: 'Retail Sales Tracker',
  description: 'Track and analyze sales across different retail stores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="min-h-screen bg-gray-50 pt-4">
          {children}
        </main>
        <footer className="bg-white border-t py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Retail Sales Tracker. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}