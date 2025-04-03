'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SalesForm from '../../../components/salesForm';
import AuthCheck from '../../../components/authCheck'
import { Sale } from '../../../types/database';

export default function AddSalePage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (sales: Sale[]) => {
    const itemCount = sales.length;
    setSuccessMessage(`${itemCount} ${itemCount === 1 ? 'sale' : 'sales'} recorded successfully!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <AuthCheck>
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-600">Record Sales</h1>
        <Link
          href="/sales"
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
        >
          Back to Sales
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <SalesForm onSuccess={handleSuccess} />
    </div>
    </AuthCheck>
  );
}