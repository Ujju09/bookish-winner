'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getStore, getSales } from '../../../lib/database';
import { Store, Sale } from '../../../types/database';

export default function StoreDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;
  
  const [store, setStore] = useState<Store | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Calculate store statistics
  const totalSales = sales.length;
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);

  // Group sales by month for chart/summary
  const salesByMonth: Record<string, { count: number; items: number; revenue: number }> = {};
  
  sales.forEach(sale => {
    const date = new Date(sale.month);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!salesByMonth[monthYear]) {
      salesByMonth[monthYear] = { count: 0, items: 0, revenue: 0 };
    }
    
    salesByMonth[monthYear].count += 1;
    salesByMonth[monthYear].items += sale.quantity;
    salesByMonth[monthYear].revenue += sale.quantity * sale.price;
  });

  // Sort months in descending order
  const sortedMonths = Object.entries(salesByMonth).sort(
    ([monthA], [monthB]) => monthB.localeCompare(monthA)
  );

  // Get top selling products
  const productSales: Record<string, { quantity: number; revenue: number }> = {};
  
  sales.forEach(sale => {
    if (!productSales[sale.item_name]) {
      productSales[sale.item_name] = { quantity: 0, revenue: 0 };
    }
    
    productSales[sale.item_name].quantity += sale.quantity;
    productSales[sale.item_name].revenue += sale.quantity * sale.price;
  });

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">{store.name}</h1>
          <p className="text-gray-600">{store.location}</p>
        </div>
        <div className="space-x-4">
          
          <Link
            href={`/stores/${storeId}/sales`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Manage Sales
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Sales Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-semibold text-black">{totalSales}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Items Sold</p>
              <p className="text-2xl font-semibold text-black">{totalItems}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gross Sales</p>
              <p className="text-2xl font-semibold text-black">₹{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No sales data available</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map(([product, data]) => (
                <li key={product} className="flex justify-between items-center">
                  <span className="font-medium text-black">{product}</span>
                  <span className="text-gray-600">{data.quantity} pcs - ₹{data.revenue.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-black">Monthly Performance</h2>
        
        {sortedMonths.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            No sales data available for this store yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Sold
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMonths.map(([monthYear, data]) => {
                  const [year, month] = monthYear.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                  const monthName = date.toLocaleString('default', { month: 'long' });
                  
                  return (
                    <tr key={monthYear} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-black">{`${monthName} ${year}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-gray-900">{data.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-gray-900">{data.items}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-medium text-gray-900">
                        ₹{data.revenue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/stores/${storeId}/sales?month=${monthYear}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
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
  );
}