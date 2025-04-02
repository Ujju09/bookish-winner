'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SalesForm from '../../../../components/salesForm';
import { getStore, getSales } from '../../../../lib/database';
import { Sale, Store } from '../../../../types/database';

export default function StoreSalesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;
  
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreAndSales = async () => {
      try {
        setIsLoading(true);
        const storeData = await getStore(storeId);
        const salesData = await getSales(storeId);
        setStore(storeData);
        setSales(salesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load store data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreAndSales();
  }, [storeId]);

  const handleSuccess = async (newSales: Sale[]) => {
    const itemCount = newSales.length;
    setSuccessMessage(`${itemCount} ${itemCount === 1 ? 'sale' : 'sales'} recorded successfully!`);
    
    // Refresh sales data
    try {
      const salesData = await getSales(storeId);
      setSales(salesData);
    } catch (err) {
      console.error('Error refreshing sales data:', err);
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Store not found'}
        </div>
        <div className="mt-4">
          <Link
            href="/stores"
            className="text-blue-600 hover:underline"
          >
            Back to Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">{store.name} - Sales</h1>
          <p className="text-gray-600">{store.location}</p>
        </div>
        <div className="space-x-4">
          <Link
            href={`/stores/${storeId}`}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Store Details
          </Link>
          <Link
            href="/stores"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-600 rounded-md hover:bg-gray-50"
          >
            All Stores
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div>
          <SalesForm onSuccess={handleSuccess} storeId={storeId} />
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Recent Sales</h2>
            
            {sales.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                No sales recorded for this store yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => {
                      const saleDate = new Date(sale.month);
                      const monthName = saleDate.toLocaleString('default', { month: 'long' });
                      const year = saleDate.getFullYear();
                      
                      return (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{sale.item_name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-500">{`${monthName} ${year}`}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="text-gray-900">{sale.quantity}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="text-gray-900">₹{sale.price.toFixed(2)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="font-medium text-gray-900">
                            ₹{(sale.quantity * sale.price).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}