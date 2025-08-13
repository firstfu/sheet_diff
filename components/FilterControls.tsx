'use client';

import { FilterState } from '@/lib/types';
import { Search, Filter, X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FilterControlsProps {
  filterState: FilterState;
  onFilterChange: (filterState: FilterState) => void;
  availableColumns: string[];
}

export function FilterControls({ filterState, onFilterChange, availableColumns }: FilterControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFilterChange({
      ...filterState,
      searchTerm: value
    });
  };

  const handleShowOnlyDifferencesChange = (show: boolean) => {
    onFilterChange({
      ...filterState,
      showOnlyDifferences: show
    });
  };

  const handleDiffTypeToggle = (type: 'modified' | 'added' | 'deleted') => {
    const newTypes = filterState.selectedDiffTypes.includes(type)
      ? filterState.selectedDiffTypes.filter(t => t !== type)
      : [...filterState.selectedDiffTypes, type];
    
    onFilterChange({
      ...filterState,
      selectedDiffTypes: newTypes
    });
  };

  const handleColumnVisibilityToggle = (column: string) => {
    const newHiddenColumns = filterState.hiddenColumns.includes(column)
      ? filterState.hiddenColumns.filter(c => c !== column)
      : [...filterState.hiddenColumns, column];
    
    onFilterChange({
      ...filterState,
      hiddenColumns: newHiddenColumns
    });
  };

  const clearFilters = () => {
    onFilterChange({
      showOnlyDifferences: false,
      searchTerm: '',
      selectedDiffTypes: ['modified', 'added', 'deleted'],
      hiddenColumns: []
    });
  };

  const hasActiveFilters = filterState.showOnlyDifferences || 
    filterState.searchTerm || 
    filterState.selectedDiffTypes.length < 3 ||
    filterState.hiddenColumns.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋內容..."
            value={filterState.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasActiveFilters
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="h-4 w-4 mr-1" />
          篩選
          {hasActiveFilters && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-2 h-2"></span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            清除
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterState.showOnlyDifferences}
                onChange={(e) => handleShowOnlyDifferencesChange(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                僅顯示有差異的資料
              </span>
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              顯示差異類型：
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'modified' as const, label: '修改', color: 'yellow' },
                { type: 'added' as const, label: '新增', color: 'green' },
                { type: 'deleted' as const, label: '刪除', color: 'red' }
              ].map(({ type, label, color }) => (
                <button
                  key={type}
                  onClick={() => handleDiffTypeToggle(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterState.selectedDiffTypes.includes(type)
                      ? color === 'yellow'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : color === 'green'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              欄位顯示設定：
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {availableColumns.map((column) => {
                const isHidden = filterState.hiddenColumns.includes(column);
                return (
                  <button
                    key={column}
                    onClick={() => handleColumnVisibilityToggle(column)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      isHidden
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {isHidden ? (
                      <EyeOff className="h-3 w-3 mr-2 flex-shrink-0" />
                    ) : (
                      <Eye className="h-3 w-3 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate" title={column}>
                      {column}
                    </span>
                  </button>
                );
              })}
            </div>
            {filterState.hiddenColumns.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                已隱藏 {filterState.hiddenColumns.length} 個欄位
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}