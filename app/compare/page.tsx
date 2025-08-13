'use client';

import { CompareResults } from '@/components/CompareResults';
import { Suspense } from 'react';

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                載入分析報告中...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                正在準備您的專業差異分析報告
              </p>
            </div>
          </div>
        </div>
      }>
        <CompareResults />
      </Suspense>
    </div>
  );
}