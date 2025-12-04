"use client";

import PageGuard from "@/components/auth/PageGuard"
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
    return (
      <PageGuard permission="view_dashboard">
      <div className="p-6 text-gray-800 dark:text-white">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    </PageGuard>
    );
  }
  