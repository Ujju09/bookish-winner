import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6  text-gray-600">Retail Sales Tracker</h1>
          <p className="text-lg text-gray-600 mb-8">
            Track and analyze sales across different retail stores
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/stores"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-600">Manage Stores</h2>
              <p className="text-gray-600">Add, edit, and view retail store information</p>
            </Link>
            
            <Link 
              href="/sales"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-600">Record Sales</h2>
              <p className="text-gray-600">Enter sales data for different stores and items</p>
            </Link>
            
            <Link 
              href="/dashboard"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-600">Analytics Dashboard</h2>
              <p className="text-gray-600">View sales performance and insights</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}