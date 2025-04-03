import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStore } from '../lib/database';
import { Store } from '../types/database';

// Form schema with validation
const storeSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  manager: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface StoreFormProps {
  onSuccess?: (store: Store) => void;
}

const StoreForm: React.FC<StoreFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      location: '',
      manager: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a clean version of the data with required fields and optional fields that are not empty
      const formData = {
        name: data.name,  // Required field
        location: data.location,  // Required field
        // Only include optional fields if they have values
        ...(data.manager && data.manager !== '' ? { manager: data.manager } : {}),
        ...(data.phone && data.phone !== '' ? { phone: data.phone } : {}),
        ...(data.email && data.email !== '' ? { email: data.email } : {})
      } as Omit<Store, 'id' | 'created_at'>;
      
      const newStore = await createStore(formData);
      
      // Reset form after successful submission
      reset();
      
      if (onSuccess) {
        onSuccess(newStore);
      }
    } catch (err) {
      console.error('Error creating store:', err);
      setError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Add New Store</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name*
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location*
            </label>
            <input
              id="location"
              type="text"
              {...register('location')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
              Manager
            </label>
            <input
              id="manager"
              type="text"
              {...register('manager')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
            {errors.manager && (
              <p className="mt-1 text-sm text-red-600">{errors.manager.message}</p>
            )}
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          
          <div className="col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => reset()}
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
            {isSubmitting ? 'Saving...' : 'Add Store'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreForm;