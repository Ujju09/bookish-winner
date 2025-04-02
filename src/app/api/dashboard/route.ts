import { NextResponse } from 'next/server';
import { getStores, getSales, getMonthlySales, getTopItems, getStorePerformance } from '../../../lib/database';

// GET endpoint to fetch all dashboard data
export async function GET(request: Request) {
  try {
    // Get the URL and params
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Fetch all required data
    const [stores, sales, _, __, storePerformance] = await Promise.all([
      getStores(),
      getSales(storeId || undefined),
      getMonthlySales(), // Not used directly, but kept for API completeness
      getTopItems(),     // Not used directly, but kept for API completeness
      getStorePerformance()
    ]);
    
    // Filter sales by date if needed
    let filteredSales = sales;
    if (startDate || endDate) {
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.month);
        
        if (startDate && endDate) {
          return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        } else if (startDate) {
          return saleDate >= new Date(startDate);
        } else if (endDate) {
          return saleDate <= new Date(endDate);
        }
        
        return true;
      });
    }
    
    // Create summary statistics
    const totalSales = filteredSales.length;
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    
    // Group data by month for time series
    const salesByMonth: Record<string, { count: number; items: number; revenue: number }> = {};
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.month);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = { count: 0, items: 0, revenue: 0 };
      }
      
      salesByMonth[monthYear].count += 1;
      salesByMonth[monthYear].items += sale.quantity;
      salesByMonth[monthYear].revenue += sale.quantity * sale.price;
    });
    
    // Sort months chronologically
    const sortedMonthsData = Object.entries(salesByMonth)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, data]) => ({
        month,
        ...data
      }));
    
    // Product performance
    const productPerformance = Object.entries(
      filteredSales.reduce<Record<string, { quantity: number; revenue: number }>>(
        (acc, sale) => {
          if (!acc[sale.item_name]) {
            acc[sale.item_name] = { quantity: 0, revenue: 0 };
          }
          
          acc[sale.item_name].quantity += sale.quantity;
          acc[sale.item_name].revenue += sale.quantity * sale.price;
          
          return acc;
        },
        {}
      )
    ).map(([item, data]) => ({
      item,
      ...data
    })).sort((a, b) => b.revenue - a.revenue);
    
    // Construct response
    const dashboardData = {
      summary: {
        totalStores: stores.length,
        totalSales,
        totalItems,
        totalRevenue,
      },
      stores: stores.map(store => ({
        id: store.id,
        name: store.name,
        location: store.location,
      })),
      timeSeries: sortedMonthsData,
      products: productPerformance,
      storePerformance: storePerformance.map(store => ({
        id: store.store_id,
        name: store.store_name,
        sales: store.total_quantity,
        revenue: store.total_revenue,
      })),
    };
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}