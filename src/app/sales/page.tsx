import { getSales } from '../../lib/database';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const sales = await getSales();

  // Group sales by month for summary
  const salesByMonth = sales.reduce<Record<string, { count: number; totalValue: number }>>(
    (acc, sale) => {
      const date = new Date(sale.month);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { count: 0, totalValue: 0 };
      }
      
      acc[monthYear].count += 1;
      acc[monthYear].totalValue += sale.quantity * sale.price;
      
      return acc;
    },
    {}
  );

  // Sort months in descending order
  const sortedMonths = Object.entries(salesByMonth).sort(
    ([monthA], [monthB]) => monthB.localeCompare(monthA)
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sales Records</h1>
        <Link
          href="/sales/add"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Record New Sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No sales found. Please add a new sale to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Monthly summary cards */}
          {sortedMonths.map(([monthYear, data]) => {
            const [year, month] = monthYear.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthName = date.toLocaleString('default', { month: 'long' });
            
            return (
              <div key={monthYear} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-600 px-4 py-2">
                  <h3 className="text-lg font-medium text-black">
                    {monthName} {year}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-black ">Total Value</p>
                      <p className="text-xl font-semibold text-black">₹{data.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All sales table */}
      {sales.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => {
                  const saleDate = new Date(sale.month);
                  const monthName = saleDate.toLocaleString('default', { month: 'long' });
                  const year = saleDate.getFullYear();
                  const totalValue = sale.quantity * sale.price;
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/stores/${sale.store_id}`} className="text-blue-600 hover:underline">
                          {sale.stores?.name || 'Unknown Store'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{sale.item_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{`${monthName} ${year}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-gray-900">{sale.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-gray-900">₹{sale.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-medium text-gray-900">
                        ₹{totalValue.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}