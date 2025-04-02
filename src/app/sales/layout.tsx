import Link from 'next/link';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 px-4">
          <nav className="flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-900 hover:text-blue-600 text-sm font-medium"
            >
              Home
            </Link>
            <Link 
              href="/stores" 
              className="text-gray-900 hover:text-blue-600 text-sm font-medium"
            >
              Stores
            </Link>
            <Link 
              href="/sales" 
              className="text-gray-900 hover:text-blue-600 text-sm font-medium"
            >
              Sales
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-900 hover:text-blue-600 text-sm font-medium"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}