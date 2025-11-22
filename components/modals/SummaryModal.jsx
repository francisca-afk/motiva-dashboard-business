"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import { Sparkles, Lightbulb, FileText, TrendingUp } from "lucide-react";

export default function SummaryModal({ isOpen, onClose, summary, sessionTitle }) {
  if (!summary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-brand-50 p-2.5 dark:bg-brand-500/10">
              <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conversation Summary
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-12">
            {sessionTitle}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Summary Overview */}
          {summary.summary && (
            <div className="rounded-xl bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 p-5 border border-brand-100 dark:border-brand-500/20">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white/80 dark:bg-gray-900/80 p-2 mt-0.5">
                  <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-300 mb-2">
                    📋 Overview
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {summary.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Business Insights */}
          {summary.businessInsights && (
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 p-5 border border-purple-100 dark:border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white/80 dark:bg-gray-900/80 p-2 mt-0.5">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    💡 Business Insights
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {summary.businessInsights}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations && (
            <div className="rounded-xl bg-gradient-to-br from-success-50 to-teal-50 dark:from-success-500/10 dark:to-teal-500/10 p-5 border border-success-100 dark:border-success-500/20">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white/80 dark:bg-gray-900/80 p-2 mt-0.5">
                  <Lightbulb className="h-5 w-5 text-success-600 dark:text-success-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-success-900 dark:text-success-300 mb-2">
                    ✨ Recommendations
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {summary.recommendations}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-brand-400 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}