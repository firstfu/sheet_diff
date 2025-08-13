'use client';

import { useState } from 'react';
import { Download, FileText, File, FileImage } from 'lucide-react';
import { DiffResult } from '@/lib/types';
import { ExportManager } from '@/lib/export-utils';

interface ExportButtonsProps {
  diffResult: DiffResult;
}

export function ExportButtons({ diffResult }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf', includeOnlyDifferences = true) => {
    setIsExporting(true);
    try {
      const exportManager = new ExportManager();
      const options = {
        format,
        includeOnlyDifferences,
        includeStats: true
      };

      let blob: Blob;
      switch (format) {
        case 'csv':
          blob = await exportManager.exportToCSV(diffResult, options);
          break;
        case 'xlsx':
          blob = await exportManager.exportToExcel(diffResult, options);
          break;
        case 'pdf':
          blob = await exportManager.exportToPDF(diffResult, options);
          break;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diff-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請稍後再試');
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
      >
        {isExporting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            <span>生成報告中...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            <span>匯出專業報告</span>
          </div>
        )}
      </button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-10 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  選擇匯出格式
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  下載您的專業分析報告
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <ExportOption
                icon={FileText}
                label="CSV 資料檔"
                description="輕量級純文字格式，適合資料處理"
                onClick={() => handleExport('csv')}
              />
              <ExportOption
                icon={File}
                label="Excel 工作簿"
                description="包含完整統計與詳細資料分析"
                onClick={() => handleExport('xlsx')}
              />
              <ExportOption
                icon={FileImage}
                label="PDF 專業報告"
                description="完整格式化報告，適合簡報分享"
                onClick={() => handleExport('pdf')}
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-600 px-6 py-4 bg-gray-50 dark:bg-slate-700">
            <button
              onClick={() => setShowOptions(false)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showOptions && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}

interface ExportOptionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}

function ExportOption({ icon: Icon, label, description, onClick }: ExportOptionProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-start p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 text-left border border-transparent hover:border-blue-200 dark:hover:border-blue-700 transform hover:scale-[1.02]"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-200">
        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-200">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}