export type Store = {
  id: string;
  name: string;
  location: string;
  manager?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export type Sale = {
  id: string;
  store_id: string;
  item_name: string;
  month: string; // ISO date string for the first day of the month
  quantity: number;
  price: number;
  created_at: string;
}

export type StoreWithSales = Store & {
  sales: Sale[];
}

export type MonthlyStats = {
  month: string;
  total_sales: number;
  total_revenue: number;
}

export type ItemStats = {
  item_name: string;
  total_quantity: number;
  total_revenue: number;
}