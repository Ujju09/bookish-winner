import { supabase } from './supabaseClient'
import { Store, Sale, MonthlyStats, ItemStats } from '../types/database'

// Store functions
export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getStore(id: string): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createStore(storeData: Omit<Store, 'id' | 'created_at'>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .insert(storeData)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateStore(id: string, storeData: Partial<Omit<Store, 'id' | 'created_at'>>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteStore(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Sales functions
export async function getSales(storeId?: string): Promise<(Sale & { stores: Pick<Store, 'id' | 'name'> })[]> {
  let query = supabase
    .from('sales')
    .select(`
      *,
      stores (id, name)
    `)
    .order('month', { ascending: false })
  
  if (storeId) {
    query = query.eq('store_id', storeId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getSale(id: string): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createSale(saleData: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .insert(saleData)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateSale(id: string, saleData: Partial<Omit<Sale, 'id' | 'created_at'>>): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .update(saleData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteSale(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Dashboard functions
export async function getMonthlySales(): Promise<MonthlyStats[]> {
  const { data, error } = await supabase
    .rpc('get_monthly_sales')
  
  if (error) throw error
  return data
}

export async function getTopItems(): Promise<ItemStats[]> {
  const { data, error } = await supabase
    .rpc('get_top_items')
  
  if (error) throw error
  return data
}

interface StorePerformance {
  store_id: string;
  store_name: string;
  total_quantity: number;
  total_revenue: number;
}

export async function getStorePerformance(): Promise<StorePerformance[]> {
  const { data, error } = await supabase
    .rpc('get_store_performance')
  
  if (error) throw error
  return data
}