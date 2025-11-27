// app/settings/business/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useAppContext } from '@/context/AppContext';
import BusinessView from './BusinessView';
import { Loader2 } from 'lucide-react';

export default function BusinessSettingsPage() {
  const router = useRouter();
  const { business, setBusiness, loading } = useAppContext();

  if (loading && !business) {
    return <Loader2 className="h-8 w-8 animate-spin text-brand-400" />;
  }

  const handleEdit = () => {
    router.push('/setup');
  }

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