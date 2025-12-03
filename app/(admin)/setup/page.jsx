"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Sparkles, Edit2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { createBusiness, updateBusiness } from '@/services/apiService';
import BusinessForm from './BusinessForm';

export default function BusinessSetupPage() {
  const router = useRouter();
  const { business, setBusiness, hasPermission, permissionsLoaded } = useAppContext();
  const [loading, setLoading] = useState(false);
  const isEditing = !!business;

  if (!permissionsLoaded) return null;
  if (!hasPermission('edit_business_settings')) {
    return <PageGuard />;
  }

  const handleSubmit = async (formData, setErrors) => {
    setLoading(true);
    const loadingToast = toast.loading(isEditing ? 'Updating business...' : 'Creating your business...');
    
    try {
      let response;
      if (isEditing) {
        response = await updateBusiness(business._id, formData);
      } else {
        response = await createBusiness(formData);
      }
      
      const businessData = response.data;
      setBusiness(businessData);
      
      toast.success(isEditing ? 'Business updated successfully! 🎉' : 'Business created successfully! 🎉', {
        id: loadingToast,
        duration: 2000,
        icon: '✅',
      });

      // Redirect to appropriate page
      setTimeout(() => {
        router.push(isEditing ? '/settings/business' : '/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error with business:', error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} business. Please try again.`, {
        id: loadingToast,
        icon: '❌',
      });
      setErrors({ submit: error.message || `Failed to ${isEditing ? 'update' : 'create'} business. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/settings/business');
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 mb-4">
              {isEditing ? (
                <Edit2 className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              ) : (
                <Sparkles className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isEditing ? 'Edit Business Information' : 'Set Up Your Business'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditing 
                ? 'Update your business details and chatbot settings'
                : "Let's get your AI chatbot ready in just a few steps"
              }
            </p>
          </div>

          <BusinessForm 
            onSubmit={handleSubmit} 
            loading={loading}
            initialData={business}
            isEditing={isEditing}
            onCancel={isEditing ? handleCancel : undefined}
          />
        </div>
      </div>
    </>
  );
}