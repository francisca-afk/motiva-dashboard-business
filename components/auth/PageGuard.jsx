"use client";
import { useAppContext } from "@/context/AppContext";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PageGuard({ permission, children }) {
  const { hasPermission, permissionsLoaded, user } = useAppContext();
  const router = useRouter();

  if (!permissionsLoaded) return null;

  if (!hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full">

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-error-500/20 blur-2xl rounded-full"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-error-50 to-error-100 dark:from-error-500/10 dark:to-error-500/20 flex items-center justify-center border-4 border-error-200 dark:border-error-500/30">
                <ShieldAlert className="h-12 w-12 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You don't have permission to view this page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Your current role:
              <span className="font-semibold capitalize text-error-600 dark:text-error-400">
                {{
                  owner: "Owner",
                  admin: "Administrator",
                  chatRep: "Chat Representative"
                }[user?.role] || "Unknown"}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:from-brand-600 hover:to-purple-600 transition-all inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  return children;
}
