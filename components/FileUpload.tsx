'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { FileParser } from '@/lib/file-parser';
import { ParsedFile, CompareOptions } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function FileUpload() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [oldParsed, setOldParsed] = useState<ParsedFile | null>(null);
  const [newParsed, setNewParsed] = useState<ParsedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CompareOptions>({
    ignoreCase: true,
    ignoreWhitespace: true,
    ignoredColumns: []
  });
  
  const router = useRouter();

  const handleFileSelect = useCallback(async (file: File, type: 'old' | 'new') => {
    const validation = FileParser.validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || '檔案驗證失敗');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const parsed = await FileParser.parseFile(file);
      
      if (type === 'old') {
        setOldFile(file);
        setOldParsed(parsed);
      } else {
        setNewFile(file);
        setNewParsed(parsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '檔案解析失敗');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'old' | 'new') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file, type);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'old' | 'new') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, type);
    }
  }, [handleFileSelect]);

  const removeFile = (type: 'old' | 'new') => {
    if (type === 'old') {
      setOldFile(null);
      setOldParsed(null);
    } else {
      setNewFile(null);
      setNewParsed(null);
    }
  };

  const startComparison = async () => {
    if (!oldParsed || !newParsed) return;
    
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams({
        oldFilename: oldParsed.filename,
        newFilename: newParsed.filename,
        options: JSON.stringify(options)
      });
      
      sessionStorage.setItem('oldFileData', JSON.stringify(oldParsed));
      sessionStorage.setItem('newFileData', JSON.stringify(newParsed));
      
      router.push(`/compare?${searchParams.toString()}`);
    } catch {
      setError('比對過程發生錯誤');
      setIsLoading(false);
    }
  };

  const canCompare = oldParsed && newParsed && !isLoading;

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <FileDropZone
          title="舊版本檔案"
          file={oldFile}
          parsed={oldParsed}
          onDrop={(e) => handleDrop(e, 'old')}
          onFileSelect={(e) => handleFileInput(e, 'old')}
          onRemove={() => removeFile('old')}
          isLoading={isLoading}
        />
        
        <FileDropZone
          title="新版本檔案"
          file={newFile}
          parsed={newParsed}
          onDrop={(e) => handleDrop(e, 'new')}
          onFileSelect={(e) => handleFileInput(e, 'new')}
          onRemove={() => removeFile('new')}
          isLoading={isLoading}
        />
      </div>

      {(oldParsed || newParsed) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            比對選項
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.ignoreCase}
                onChange={(e) => setOptions(prev => ({ ...prev, ignoreCase: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">忽略大小寫差異</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.ignoreWhitespace}
                onChange={(e) => setOptions(prev => ({ ...prev, ignoreWhitespace: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">忽略空白字元差異</span>
            </label>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={startComparison}
          disabled={!canCompare}
          className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
            canCompare
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              處理中...
            </div>
          ) : (
            '開始比對'
          )}
        </button>
      </div>
    </div>
  );
}

interface FileDropZoneProps {
  title: string;
  file: File | null;
  parsed: ParsedFile | null;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isLoading: boolean;
}

function FileDropZone({ title, file, parsed, onDrop, onFileSelect, onRemove, isLoading }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            拖拽檔案到此處或
          </p>
          <label className="inline-block">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileSelect}
              className="hidden"
            />
            <span className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              選擇檔案
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            支援 CSV, Excel (.xlsx, .xls) 格式
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <FileText className="h-8 w-8 text-blue-500 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {FileParser.getFileInfo(file).size} • {FileParser.getFileInfo(file).type}
                </p>
                {parsed && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>共 {parsed.rowCount} 列資料</p>
                    <p>{parsed.headers.length} 個欄位</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {parsed && <CheckCircle className="h-5 w-5 text-green-500" />}
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
              <button
                onClick={onRemove}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}