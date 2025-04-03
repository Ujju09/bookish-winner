import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    const item = url.searchParams.get('item');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const view = url.searchParams.get('view') || 'detailed'; // 'detailed', 'monthly', or 'items'
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Select from the appropriate view based on the 'view' parameter
    let query;
    
    if (view === 'monthly') {
      query = supabase
        .from('monthly_sales_summary')
        .select('*');
        
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
    } else if (view === 'items') {
      query = supabase
        .from('item_sales_summary')
        .select('*');
        
      if (item) {
        query = query.ilike('item_name', `%${item}%`);
      }
      
    } else {
      // Default detailed view
      query = supabase
        .from('store_sales_view')
        .select('*');
        
      // Apply filters if provided
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      if (item) {
        query = query.ilike('item_name', `%${item}%`);
      }
      
      // Date filtering
      if (startDate) {
        query = query.gte('month', startDate);
      }
      
      if (endDate) {
        query = query.lte('month', endDate);
      }
    }
    
    // Add pagination for detailed view
    if (view === 'detailed') {
      query = query.order('month', { ascending: false })
                  .range(from, to);
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Return the data with pagination info for detailed view
    if (view === 'detailed') {
      return NextResponse.json({
        data,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: count ? Math.ceil(count / pageSize) : 0
        }
      });
    } else {
      // For summary views, just return the data
      return NextResponse.json(data);
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store sales data' },
      { status: 500 }
    );
  }
}