'use client';

import { FileUpload } from '@/components/FileUpload';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            DataDiff Pro
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-200 mb-3 font-medium">
            企業級智能檔案差異分析平台
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            運用先進 AI 演算法，為您提供最精確的 CSV/Excel 檔案比對分析，
            <span className="text-blue-600 dark:text-blue-400 font-semibold">讓數據變更一目了然</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <FileUpload />
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            為什麼選擇 DataDiff Pro？
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            專為企業打造的智能檔案分析解決方案，讓您的數據管理更加高效精準
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                全格式相容性
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                完美支援 CSV、Excel (xlsx/xls) 等主流格式，無需轉換即可直接分析，節省您寶貴的時間
              </p>
              <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
                • 即時解析 • 無檔案大小限制 • 雲端安全處理
              </div>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                AI 智能比對
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                採用先進機器學習演算法，自動識別欄位對應關係，智能處理格式差異，準確率高達 99.9%
              </p>
              <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                • 自動欄位對齊 • 智能容錯處理 • 秒級分析速度
              </div>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                專業級報告
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                一鍵生成精美的專業分析報告，支援多種匯出格式，完美適配企業內部流程與協作需求
              </p>
              <div className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-medium">
                • CSV/Excel/PDF 匯出 • 客製化範本 • 即時分享連結
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
