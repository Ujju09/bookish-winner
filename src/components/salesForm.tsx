import React, { useState, useEffect } from 'react';
import { createSale } from '../lib/database';
import { getStores } from '../lib/database';
import { Store, Sale } from '../types/database';

interface SalesFormProps {
  onSuccess?: (sales: Sale[]) => void;
  storeId?: string;
}

type SalesEntry = {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
};

const SalesForm: React.FC<SalesFormProps> = ({ onSuccess, storeId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [selectedStoreId, setSelectedStoreId] = useState(storeId || '');
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([
    { id: crypto.randomUUID(), item_name: '', quantity: 1, price: 0 }
  ]);

  // Fetch stores for dropdown
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await getStores();
        setStores(storesData);
        
        // If no storeId was provided but stores exist, select the first one
        if (!storeId && storesData.length > 0 && selectedStoreId === '') {
          setSelectedStoreId(storesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores. Please try again.');
      }
    };

    fetchStores();
  }, [storeId]);

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStoreId(e.target.value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleEntryChange = (id: string, field: keyof SalesEntry, value: string | number) => {
    setSalesEntries(entries => 
      entries.map(entry => 
        entry.id === id 
          ? { ...entry, [field]: value } 
          : entry
      )
    );
  };

  const addEntry = () => {
    setSalesEntries([
      ...salesEntries,
      { id: crypto.randomUUID(), item_name: '', quantity: 1, price: 0 }
    ]);
  };

  const removeEntry = (id: string) => {
    if (salesEntries.length > 1) {
      setSalesEntries(entries => entries.filter(entry => entry.id !== id));
    }
  };

  const validateEntries = (): boolean => {
    // Basic validation
    if (!selectedStoreId) {
      setError('Please select a store');
      return false;
    }

    for (const entry of salesEntries) {
      if (!entry.item_name) {
        setError('All items must have a name');
        return false;
      }

      if (entry.quantity <= 0) {
        setError('All quantities must be greater than zero');
        return false;
      }

      if (entry.price <= 0) {
        setError('All prices must be greater than zero');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEntries()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert YYYY-MM to YYYY-MM-01 for the database
      const monthDate = new Date(`${selectedMonth}-01`).toISOString();
      
      // Create all sales records
      const createdSales: Sale[] = [];
      
      for (const entry of salesEntries) {
        const saleData = {
          store_id: selectedStoreId,
          item_name: entry.item_name,
          month: monthDate,
          quantity: entry.quantity,
          price: entry.price,
        };
        
        const newSale = await createSale(saleData);
        createdSales.push(newSale);
      }
      
      // Reset form after successful submission
      setSalesEntries([
        { id: crypto.randomUUID(), item_name: '', quantity: 1, price: 0 }
      ]);
      
      if (onSuccess) {
        onSuccess(createdSales);
      }
    } catch (err) {
      console.error('Error creating sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to record sales');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return salesEntries.reduce((sum, entry) => sum + (entry.quantity * entry.price), 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
          {!storeId && (
            <div className="col-span-1">
              <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-1">
                Store*
              </label>
              <select
                id="store_id"
                value={selectedStoreId}
                onChange={handleStoreChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                required
                disabled={isSubmitting}
              >
                <option value="">Select a store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.location})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="col-span-1">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Month*
            </label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Sales Items</h3>
            <button
              type="button"
              onClick={addEntry}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              disabled={isSubmitting}
            >
              + Add Item
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            {/* Headers for the entries */}
            <div className="grid grid-cols-12 gap-4 mb-2 px-2">
              <div className="col-span-5 text-sm font-medium text-gray-700">Item</div>
              <div className="col-span-2 text-sm font-medium text-gray-700">Quantity</div>
              <div className="col-span-2 text-sm font-medium text-gray-700">Unit Price</div>
              <div className="col-span-2 text-sm font-medium text-gray-700">Total</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Dynamic entry rows */}
            {salesEntries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-12 gap-4 mb-3 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={entry.item_name}
                    onChange={(e) => handleEntryChange(entry.id, 'item_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    placeholder="Item name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={entry.quantity}
                    onChange={(e) => handleEntryChange(entry.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={entry.price}
                    onChange={(e) => handleEntryChange(entry.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2">
                  <div className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-700">
                  ₹{(entry.quantity * entry.price).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={isSubmitting || salesEntries.length <= 1}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            
            {/* Order total */}
            <div className="border-t border-gray-300 mt-4 pt-4 flex justify-end">
              <div className="w-1/3">
                <div className="flex justify-between font-medium">
                  <span>Order Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSalesEntries([
                { id: crypto.randomUUID(), item_name: '', quantity: 1, price: 0 }
              ]);
            }}
            className="px-4 py-2 mr-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Record Sales'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;