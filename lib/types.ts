/**
 * 類型定義檔
 * 
 * 定義整個應用程式的 TypeScript 介面和類型：
 * - 檔案解析相關類型（ParsedFile）
 * - 比較選項和結果類型（CompareOptions, DiffResult）
 * - 統計資訊類型（DiffStats）
 * - 差異資料類型（RowDifference）
 * - 匯出選項類型（ExportOptions）
 * - 狀態管理類型（FilterState, FileUploadState）
 */

export interface ParsedFile {
  filename: string;
  headers: string[];
  data: Record<string, unknown>[];
  rowCount: number;
}

export interface CompareOptions {
  primaryKey?: string;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  ignoredColumns: string[];
}

export interface DiffStats {
  totalRows: number;
  modifiedRows: number;
  addedRows: number;
  deletedRows: number;
  oldFileRecords: number;
  newFileRecords: number;
  totalRecords: number;
}

export interface RowDifference {
  rowIndex: number;
  type: 'normal' | 'modified' | 'added' | 'deleted';
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  changedFields?: string[];
  primaryKeyValue?: string;
}

export interface DiffResult {
  stats: DiffStats;
  differences: RowDifference[];
  headers: string[];
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeOnlyDifferences: boolean;
  includeStats: boolean;
}

export interface FileUploadState {
  oldFile: File | null;
  newFile: File | null;
  oldParsed: ParsedFile | null;
  newParsed: ParsedFile | null;
  isLoading: boolean;
  error: string | null;
}

export interface CompareState {
  diffResult: DiffResult | null;
  isComparing: boolean;
  error: string | null;
  options: CompareOptions;
}

export interface FilterState {
  showOnlyDifferences: boolean;
  searchTerm: string;
  selectedDiffTypes: ('modified' | 'added' | 'deleted')[];
  hiddenColumns: string[];
}

export type CellType = 'normal' | 'modified' | 'added' | 'deleted';

export interface EnhancedRow {
  id: string;
  type: CellType;
  data: Record<string, unknown>;
  changedFields: string[];
  rowIndex: number;
}