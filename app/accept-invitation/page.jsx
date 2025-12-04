"use client";
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { acceptInvitation, verifyInvitationToken } from '@/services/apiService';
import { Mail, User, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  console.log("token", token);

  const [status, setStatus] = useState('loading'); 
  const [invitationData, setInvitationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      console.log("no token");
      setStatus('error');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await verifyInvitationToken(token);
      console.log("response verifyToken", response);
      setInvitationData(response.data);
      setStatus(response.status);
    } catch (error) {
      if (error.response?.status === 410) {
        setStatus('expired');
      } else {
        setStatus('error');
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await acceptInvitation(token, form.firstName, form.lastName, form.password);
      setStatus('success');
      setTimeout(() => router.push('/signin'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success-50 to-success-100 dark:from-success-500/10 dark:to-success-500/20 mb-6 border-4 border-success-200 dark:border-success-500/30">
            <CheckCircle className="h-10 w-10 text-success-600 dark:text-success-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome aboard! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your account has been created successfully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error' || status === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-error-50 to-error-100 dark:from-error-500/10 dark:to-error-500/20 mb-6 border-4 border-error-200 dark:border-error-500/30">
            <XCircle className="h-10 w-10 text-error-600 dark:text-error-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {status === 'expired' ? 'Invitation Expired' : 'Invalid Invitation'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {status === 'expired' 
              ? 'This invitation has expired. Please contact your administrator for a new one.'
              : 'This invitation link is invalid or has already been used.'}
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:from-brand-600 hover:to-purple-600 transition-all shadow-lg"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 mb-4 border-4 border-brand-200 dark:border-brand-500/30">
            <Mail className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Accept Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join <span className="font-semibold text-brand-600 dark:text-brand-400">{invitationData?.businessName}</span>
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role: <span className="text-brand-600 dark:text-brand-400 capitalize">{invitationData?.role}</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={invitationData?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <Label>
                First Name<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <Label>
                Last Name<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <Label>
                Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20">
                <XCircle className="h-4 w-4 text-error-600 dark:text-error-400 flex-shrink-0" />
                <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:from-brand-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Accept & Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          By creating an account, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitation() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}