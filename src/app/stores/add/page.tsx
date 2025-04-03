'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StoreForm from '../../../components/storeForm';
import AuthCheck from '../../../components/authCheck'
import { Store } from '../../../types/database';

export default function AddStorePage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (store: Store) => {
    setSuccessMessage(`Store "${store.name}" created successfully!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
      router.push('/stores');
    }, 3000);
  };

  return (
    <AuthCheck>
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-600">Add New Store</h1>
        <Link
          href="/stores"
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
        >
          Back to Stores
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <StoreForm onSuccess={handleSuccess} />
    </div>
    </AuthCheck>
  );
}