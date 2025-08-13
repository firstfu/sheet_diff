'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ParsedFile, DiffResult, CompareOptions, FilterState } from '@/lib/types';
import { DiffEngine } from '@/lib/diff-engine';
import { DiffStats } from './DiffStats';
import { DataGrid } from './DataGrid';
import { FilterControls } from './FilterControls';
import { ExportButtons } from './ExportButtons';
import { ArrowLeft, AlertCircle, FileCheck, TrendingUp, Clock, Sparkles } from 'lucide-react';

export function CompareResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({
    showOnlyDifferences: true,
    searchTerm: '',
    selectedDiffTypes: ['modified', 'added', 'deleted'],
    hiddenColumns: []
  });

  useEffect(() => {
    const performComparison = async () => {
      try {
        const oldFileData = sessionStorage.getItem('oldFileData');
        const newFileData = sessionStorage.getItem('newFileData');
        const optionsParam = searchParams.get('options');

        if (!oldFileData || !newFileData) {
          setError('找不到檔案資料，請重新上傳檔案');
          return;
        }

        const oldFile: ParsedFile = JSON.parse(oldFileData);
        const newFile: ParsedFile = JSON.parse(newFileData);
        const options: CompareOptions = optionsParam 
          ? JSON.parse(optionsParam)
          : { ignoreCase: false, ignoreWhitespace: false, ignoredColumns: [] };

        setIsLoading(true);

        let result: DiffResult;
        
        if (oldFile.rowCount > 1000 || newFile.rowCount > 1000) {
          result = await DiffEngine.compareInWorker(oldFile, newFile, options);
        } else {
          const engine = new DiffEngine(options);
          result = engine.compare(oldFile, newFile);
        }

        setDiffResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '比對過程發生錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    performComparison();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              智能分析進行中
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              我們的 AI 引擎正在深度分析您的檔案差異
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>預計完成時間：數秒鐘</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 mx-auto mb-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              分析遇到問題
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              重新開始分析
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!diffResult) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">沒有比對結果</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  分析完成
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{searchParams.get('oldFilename')}</span>
                <span className="mx-2">vs</span>
                <span className="font-medium">{searchParams.get('newFilename')}</span>
              </div>
              <ExportButtons diffResult={diffResult} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            智能差異分析報告
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            基於先進算法的深度檔案比對分析，為您呈現最精確的變更洞察
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <DiffStats stats={diffResult.stats} />
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Controls Header */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  詳細差異檢視
                </h3>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  即時篩選
                </span>
              </div>
              
              <FilterControls
                filterState={filterState}
                onFilterChange={setFilterState}
                availableColumns={diffResult.headers}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="p-0">
            <DataGrid
              diffResult={diffResult}
              filterState={filterState}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span>由 DataDiff AI 引擎提供支援</span>
          </div>
        </div>
      </div>
    </div>
  );
}