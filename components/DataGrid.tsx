'use client';

import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellClassParams, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { DiffResult, FilterState } from '@/lib/types';
import { Edit3, Plus, Minus } from 'lucide-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface DataGridProps {
  diffResult: DiffResult;
  filterState: FilterState;
}

// Status cell renderer component
const StatusCellRenderer = (params: ICellRendererParams) => {
  const rowType = params.data?.type;
  
  if (rowType === 'modified') {
    return (
      <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full border border-amber-200 dark:border-amber-700">
        <Edit3 className="h-3 w-3 text-amber-600" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">修改</span>
      </div>
    );
  }
  
  if (rowType === 'added') {
    return (
      <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full border border-emerald-200 dark:border-emerald-700">
        <Plus className="h-3 w-3 text-emerald-600" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">新增</span>
      </div>
    );
  }
  
  if (rowType === 'deleted') {
    return (
      <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-full border border-red-200 dark:border-red-700">
        <Minus className="h-3 w-3 text-red-600" />
        <span className="text-xs font-medium text-red-700 dark:text-red-300">刪除</span>
      </div>
    );
  }
  
  return null;
};

export function DataGrid({ diffResult, filterState }: DataGridProps) {
  const getCellClassName = useCallback((rowData: Record<string, unknown>, columnKey: string): string => {
    if (!rowData) return '';
    
    switch (rowData.type) {
      case 'added':
        return 'ag-cell-added';
      case 'deleted':
        return 'ag-cell-deleted';
      case 'modified':
        if (columnKey !== '_status' && (rowData.changedFields as string[])?.includes(columnKey)) {
          return 'ag-cell-modified';
        }
        return '';
      default:
        return '';
    }
  }, []);

  const rowData = useMemo(() => {
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

    return rows.map((row, index) => ({
      id: row.primaryKeyValue || String(index),
      type: row.type as 'normal' | 'modified' | 'added' | 'deleted',
      changedFields: row.changedFields || [],
      rowIndex: row.rowIndex,
      ...(row.newData || row.oldData || {})
    }));
  }, [diffResult.differences, filterState]);

  const columnDefs = useMemo((): ColDef[] => {
    const statusColumn: ColDef = {
      field: '_status',
      headerName: '變更狀態',
      width: 120,
      pinned: 'left',
      cellRenderer: StatusCellRenderer,
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: (params: CellClassParams) => getCellClassName(params.data, '_status')
    };

    const dataColumns: ColDef[] = diffResult.headers.map(header => ({
      field: header,
      headerName: header,
      resizable: true,
      sortable: true,
      filter: true,
      cellClass: (params: CellClassParams) => getCellClassName(params.data, header),
      cellRenderer: (params: ICellRendererParams) => {
        const isChanged = params.data?.changedFields?.includes(header);
        const value = params.value === null || params.value === undefined ? '' : String(params.value);
        
        return (
          <div 
            className={`h-full flex items-center px-2 ${
              isChanged && params.data?.type === 'modified' ? 'font-medium' : ''
            }`}
            title={value}
          >
            <span className="truncate">{value}</span>
          </div>
        );
      }
    }));

    return [statusColumn, ...dataColumns];
  }, [diffResult.headers, getCellClassName]);

  if (rowData.length === 0) {
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
      <div className="ag-theme-alpine dark:ag-theme-alpine-dark" style={{ height: 'calc(100vh - 450px)', minHeight: '500px' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            resizable: true,
            sortable: true,
            filter: true,
          }}
          enableCellTextSelection={true}
          enableRangeSelection={true}
          suppressRowClickSelection={true}
          rowSelection="multiple"
          animateRows={true}
          headerHeight={48}
          rowHeight={40}
          suppressMenuHide={true}
          suppressColumnVirtualisation={true}
          maintainColumnOrder={true}
          enableBrowserTooltips={true}
        />
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              共 {rowData.length.toLocaleString()} 筆變更記錄
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

