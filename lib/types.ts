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
}

export type CellType = 'normal' | 'modified' | 'added' | 'deleted';

export interface EnhancedRow {
  id: string;
  type: CellType;
  data: Record<string, unknown>;
  changedFields: string[];
  rowIndex: number;
}