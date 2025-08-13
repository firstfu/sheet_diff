'use client';

import { useMemo } from 'react';
import { DataGrid as RDG, Column } from 'react-data-grid';
import { DiffResult, FilterState, EnhancedRow } from '@/lib/types';
import { Edit3, Plus, Minus } from 'lucide-react';

interface DataGridProps {
  diffResult: DiffResult;
  filterState: FilterState;
}

export function DataGrid({ diffResult, filterState }: DataGridProps) {
  const filteredRows = useMemo(() => {
    let rows = diffResult.differences;

    if (filterState.showOnlyDifferences) {
      rows = rows.filter(row => ['modified', 'added', 'deleted'].includes(row.type));
    }

    if (filterState.selectedDiffTypes.length < 3) {
      rows = rows.filter(row => 
        filterState.selectedDiffTypes.includes(row.type as 'modified' | 'added' | 'deleted')
      );
    }

    if (filterState.searchTerm) {
      const searchTerm = filterState.searchTerm.toLowerCase();
      rows = rows.filter(row => {
        const searchData = row.newData || row.oldData || {};
        return Object.values(searchData).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        );
      });
    }

    return rows.map((row, index): EnhancedRow => ({
      id: row.primaryKeyValue || String(index),
      type: row.type as 'normal' | 'modified' | 'added' | 'deleted',
      data: row.newData || row.oldData || {},
      changedFields: row.changedFields || [],
      rowIndex: row.rowIndex
    }));
  }, [diffResult.differences, filterState]);

  const columns: Column<EnhancedRow>[] = useMemo(() => {
    const statusColumn: Column<EnhancedRow> = {
      key: '_status',
      name: '變更狀態',
      width: 120,
      frozen: true,
      renderCell: ({ row }) => (
        <div className="flex items-center justify-center h-full">
          {row.type === 'modified' && (
            <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full border border-amber-200 dark:border-amber-700">
              <Edit3 className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">修改</span>
            </div>
          )}
          {row.type === 'added' && (
            <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full border border-emerald-200 dark:border-emerald-700">
              <Plus className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">新增</span>
            </div>
          )}
          {row.type === 'deleted' && (
            <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-full border border-red-200 dark:border-red-700">
              <Minus className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">刪除</span>
            </div>
          )}
        </div>
      ),
      cellClass: (row) => getCellClassName(row, '_status')
    };

    const dataColumns: Column<EnhancedRow>[] = diffResult.headers.map(header => ({
      key: header,
      name: header,
      resizable: true,
      renderCell: ({ row }) => (
        <DiffCell
          value={row.data[header]}
          isChanged={row.changedFields.includes(header)}
          rowType={row.type}
        />
      ),
      cellClass: (row) => getCellClassName(row, header)
    }));

    return [statusColumn, ...dataColumns];
  }, [diffResult.headers]);

  if (filteredRows.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-gray-200 dark:border-gray-600 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Edit3 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {filterState.showOnlyDifferences || filterState.searchTerm || filterState.selectedDiffTypes.length < 3
            ? '無符合條件的變更'
            : '完美匹配！'
          }
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {filterState.showOnlyDifferences || filterState.searchTerm || filterState.selectedDiffTypes.length < 3
            ? '請調整篩選條件以檢視更多資料，或嘗試清除目前的篩選設定。'
            : '兩個檔案完全相同，沒有發現任何差異。您的資料同步狀況良好！'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <RDG
        columns={columns}
        rows={filteredRows}
        className="rdg-light dark:rdg-dark"
        style={{ height: 'calc(100vh - 450px)', minHeight: '500px' }}
        headerRowHeight={48}
        rowHeight={40}
        defaultColumnOptions={{
          resizable: true,
          sortable: true
        }}
      />
      
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              共 {filteredRows.length.toLocaleString()} 筆變更記錄
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <span>修改</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"></div>
              <span>新增</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-pink-500"></div>
              <span>刪除</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCellClassName(row: EnhancedRow, columnKey: string): string {
  const baseClass = 'rdg-cell';
  
  switch (row.type) {
    case 'added':
      return `${baseClass} rdg-cell-added`;
    case 'deleted':
      return `${baseClass} rdg-cell-deleted`;
    case 'modified':
      if (columnKey !== '_status' && row.changedFields.includes(columnKey)) {
        return `${baseClass} rdg-cell-modified`;
      }
      return baseClass;
    default:
      return baseClass;
  }
}

interface DiffCellProps {
  value: unknown;
  isChanged: boolean;
  rowType: 'normal' | 'modified' | 'added' | 'deleted';
}

function DiffCell({ value, isChanged, rowType }: DiffCellProps) {
  const displayValue = value === null || value === undefined ? '' : String(value);
  
  return (
    <div 
      className={`h-full flex items-center px-2 ${
        isChanged && rowType === 'modified' ? 'font-medium' : ''
      }`}
      title={displayValue}
    >
      <span className="truncate">{displayValue}</span>
    </div>
  );
}