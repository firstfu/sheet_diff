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
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? '匯出中...' : '匯出報告'}
      </button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              選擇匯出格式
            </h4>
            <div className="space-y-2">
              <ExportOption
                icon={FileText}
                label="CSV 檔案"
                description="純文字格式"
                onClick={() => handleExport('csv')}
              />
              <ExportOption
                icon={File}
                label="Excel 檔案"
                description="包含統計和詳細資料"
                onClick={() => handleExport('xlsx')}
              />
              <ExportOption
                icon={FileImage}
                label="PDF 報告"
                description="完整格式化報告"
                onClick={() => handleExport('pdf')}
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-600 p-3">
            <button
              onClick={() => setShowOptions(false)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
      className="w-full flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </button>
  );
}