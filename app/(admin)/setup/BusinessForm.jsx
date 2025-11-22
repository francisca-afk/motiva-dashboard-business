"use client";
import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  Mail, 
  Briefcase,
  MessageSquare,
  Upload,
  ArrowRight,
  CheckCircle,
  ImagePlus,
  X
} from 'lucide-react';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import { SECTOR_OPTIONS, TONE_OPTIONS } from '@/lib/business';

export default function BusinessForm({ onSubmit, loading, initialData = null, isEditing = false, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    name: '',
    sector: '',
    description: '',
    website: '',
    businessEmail: '',
    alertEmail: '',
    tone: 'friendly',
    chatbotSettings: {
      welcomeMessage: 'Hi! How can I help you today?',
      offlineMessage: 'We\'re currently offline. Leave a message and we\'ll get back to you soon!'
    },
    logoUrl: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      handleInputChange('logoUrl', previewUrl);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Business name is required';
      if (!formData.sector) newErrors.sector = 'Please select a sector';
      if (!formData.businessEmail.trim()) {
        newErrors.businessEmail = 'Business email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
        newErrors.businessEmail = 'Please enter a valid email';
      }
    }

    if (step === 2) {
      if (!formData.alertEmail.trim()) {
        newErrors.alertEmail = 'Alert email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alertEmail)) {
        newErrors.alertEmail = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    onSubmit(formData, setErrors);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Building2 },
    { number: 2, title: 'Contact & Alerts', icon: Mail },
    { number: 3, title: 'Chatbot Settings', icon: MessageSquare }
  ];

  return (
    <>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${isCompleted 
                      ? 'bg-success-500 border-success-500' 
                      : isActive 
                      ? 'bg-brand-500 border-brand-500' 
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    isActive || isCompleted 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-4 ${
                    currentStep > step.number 
                      ? 'bg-success-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <ComponentCard>
        <form className="space-y-6 p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Building2 className="h-12 w-12 text-brand-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? 'Update' : 'Tell us about'} your business
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Basic information to get started
                </p>
              </div>

              {/* Logo Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-brand-500 rounded-full p-2 cursor-pointer hover:bg-brand-600 transition-colors">
                    <Upload className="h-4 w-4 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Business Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Acme Corporation"
                    error={!!errors.name}
                    hint={errors.name}
                    className="pl-11"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 dark:border-gray-800 px-3 py-3 text-gray-500 dark:text-gray-400">
                    <Building2 className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="sector">Industry Sector *</Label>
                <div className="relative">
                  <Select
                    options={SECTOR_OPTIONS}
                    placeholder="Select your industry"
                    value={formData.sector}
                    onChange={(value) => handleInputChange('sector', value)}
                    className={errors.sector ? 'border-error-500' : 'dark:bg-gray-900'}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {errors.sector && (
                  <p className="mt-1 text-xs text-error-600 dark:text-error-400">{errors.sector}</p>
                )}
              </div>

              <div>
                <Label htmlFor="businessEmail">Business Email *</Label>
                <div className="relative">
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="contact@acme.com"
                    error={!!errors.businessEmail}
                    hint={errors.businessEmail}
                    className="pl-11"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 dark:border-gray-800 px-3 py-3 text-gray-500 dark:text-gray-400">
                    <Mail className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <div className="relative">
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://acme.com"
                    className="pl-11"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 dark:border-gray-800 px-3 py-3 text-gray-500 dark:text-gray-400">
                    <Globe className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Tell us about your business..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact & Alerts */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Mail className="h-12 w-12 text-brand-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Alert Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Where should we send important alerts?
                </p>
              </div>

              <div className="bg-brand-50 dark:bg-brand-500/10 rounded-lg p-4 border border-brand-200 dark:border-brand-500/20">
                <div className="flex gap-3">
                  <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-300 mb-1">
                      Alert Email Purpose
                    </h3>
                    <p className="text-xs text-brand-700 dark:text-brand-400">
                      We'll send notifications here when customers need urgent attention, 
                      show negative sentiment, or request escalation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="alertEmail">Alert Email Address *</Label>
                <div className="relative">
                  <Input
                    id="alertEmail"
                    type="email"
                    value={formData.alertEmail}
                    onChange={(e) => handleInputChange('alertEmail', e.target.value)}
                    placeholder="alerts@acme.com"
                    error={!!errors.alertEmail}
                    hint={errors.alertEmail}
                    className="pl-11"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 dark:border-gray-800 px-3 py-3 text-gray-500 dark:text-gray-400">
                    <Mail className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Chatbot Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MessageSquare className="h-12 w-12 text-brand-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Customize Your Chatbot
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Set the personality and welcome message
                </p>
              </div>

              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <TextArea
                  id="welcomeMessage"
                  value={formData.chatbotSettings.welcomeMessage}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    chatbotSettings: {
                      ...prev.chatbotSettings,
                      welcomeMessage: value
                    }
                  }))}
                  placeholder="Hi! How can I help you today?"
                  rows={4}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This is the first message customers see
                </p>
              </div>

              <div>
                <Label htmlFor="offlineMessage">Offline Message</Label>
                <TextArea
                  id="offlineMessage"
                  value={formData.chatbotSettings.offlineMessage}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    chatbotSettings: {
                      ...prev.chatbotSettings,
                      offlineMessage: value
                    }
                  }))}
                  placeholder="We're currently offline. Leave a message!"
                  rows={4}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Message shown when no agents are available
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-lg bg-error-50 dark:bg-error-500/10 p-4 border border-error-200 dark:border-error-500/20">
              <p className="text-sm text-error-700 dark:text-error-400">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            )}

            {isEditing && currentStep === 1 && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            )}
            
            {currentStep < steps.length  ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors inline-flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    {isEditing ? 'Save Changes' : 'Complete Setup'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </ComponentCard>
    </>
  );
}