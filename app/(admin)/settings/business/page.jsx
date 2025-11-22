// app/settings/business/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useAppContext } from '@/context/AppContext';
import BusinessView from './BusinessView';

export default function BusinessSettingsPage() {
  const router = useRouter();
  const { business, setBusiness } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Redirect if no business
  useEffect(() => {
    if (!business) {
      router.push('/setup');
    }
  }, [business, router]);

  if (!business) {
    return null;
  }

  const handleEdit = () => {
    router.push('/setup');
  };

  return (
    <>
      <Toaster position="top-center" />
      <div>
        <PageBreadcrumb pageTitle="Business Settings" />

        <div className="max-w-4xl mx-auto">
          <BusinessView 
            business={business} 
            onEdit={handleEdit}
            showEdit={true}
          />
        </div>
      </div>
    </>
  );
}