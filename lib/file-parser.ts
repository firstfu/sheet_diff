import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedFile } from './types';

export class FileParser {
  static async parseFile(file: File): Promise<ParsedFile> {
    const extension = file.name.toLowerCase().split('.').pop();
    
    try {
      switch (extension) {
        case 'csv':
          return await this.parseCSV(file);
        case 'xlsx':
        case 'xls':
          return await this.parseExcel(file);
        default:
          throw new Error(`不支援的檔案格式: ${extension}`);
      }
    } catch (error) {
      throw new Error(`檔案解析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  private static async parseCSV(file: File): Promise<ParsedFile> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          if (results.errors.length > 0) {
            const errorMessages = results.errors.map(err => err.message).join(', ');
            reject(new Error(`CSV 解析錯誤: ${errorMessages}`));
            return;
          }

          const data = results.data as Record<string, unknown>[];
          const headers = results.meta.fields || [];

          resolve({
            filename: file.name,
            headers,
            data: this.cleanData(data),
            rowCount: data.length
          });
        },
        error: (error) => {
          reject(new Error(`CSV 解析失敗: ${error.message}`));
        }
      });
    });
  }

  private static async parseExcel(file: File): Promise<ParsedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result;
          if (!fileContent) {
            reject(new Error('無法讀取檔案內容'));
            return;
          }

          const workbook = XLSX.read(fileContent, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          
          if (!sheetName) {
            reject(new Error('Excel 檔案中沒有找到工作表'));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          
          // Get data with proper date formatting
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false
          }) as unknown[][];

          if (jsonData.length === 0) {
            reject(new Error('Excel 檔案沒有資料'));
            return;
          }

          const headers = jsonData[0].map((header: unknown) => String(header || '').trim());
          const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

          const parsedData = dataRows.map((row) => {
            const rowData: Record<string, unknown> = {};
            headers.forEach((header, colIndex) => {
              const cellValue = row[colIndex];
              if (cellValue !== undefined) {
                if (cellValue instanceof Date) {
                  // Format date as YYYY-MM-DD
                  rowData[header] = cellValue.toISOString().split('T')[0];
                } else if (typeof cellValue === 'number' && this.isExcelDateSerial(cellValue)) {
                  // Convert Excel date serial number to date
                  rowData[header] = this.excelDateToString(cellValue);
                } else {
                  rowData[header] = String(cellValue).trim();
                }
              } else {
                rowData[header] = '';
              }
            });
            return rowData;
          });

          resolve({
            filename: file.name,
            headers,
            data: this.cleanData(parsedData),
            rowCount: parsedData.length
          });
        } catch (error) {
          reject(new Error(`Excel 解析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('檔案讀取失敗'));
      };

      reader.readAsBinaryString(file);
    });
  }

  private static cleanData(data: Record<string, unknown>[]): Record<string, unknown>[] {
    return data.map((row) => {
      const cleanedRow: Record<string, unknown> = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        cleanedRow[key] = value === null || value === undefined ? '' : String(value).trim();
      });
      return cleanedRow;
    });
  }

  private static isExcelDateSerial(value: number): boolean {
    // Excel serial dates are between 1 (1900-01-01) and 2958465 (9999-12-31)
    // But commonly they're in a much smaller range
    return value >= 1 && value <= 2958465 && Math.floor(value) === value;
  }

  private static excelDateToString(serialNumber: number): string {
    // Excel's epoch starts at 1900-01-01, but treats 1900 as a leap year (which it isn't)
    // JavaScript Date constructor counts from 1970-01-01
    const excelEpoch = new Date(1900, 0, 1);
    
    // Adjust for Excel's leap year bug and convert to milliseconds
    const daysOffset = serialNumber - 1; // Excel starts counting from 1, not 0
    const date = new Date(excelEpoch.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
    
    // Adjust for the leap year bug (subtract 1 day for dates after Feb 28, 1900)
    if (serialNumber >= 60) {
      date.setDate(date.getDate() - 1);
    }
    
    return date.toISOString().split('T')[0];
  }


  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const extension = file.name.toLowerCase().split('.').pop();

    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `不支援的檔案格式。請選擇 ${allowedExtensions.join(', ')} 檔案。`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `檔案大小超過限制 (${Math.round(maxSize / (1024 * 1024))}MB)。`
      };
    }

    return { isValid: true };
  }

  static getFileInfo(file: File) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const extension = file.name.toLowerCase().split('.').pop();
    
    return {
      name: file.name,
      size: `${sizeInMB} MB`,
      type: extension?.toUpperCase() || 'Unknown',
      lastModified: new Date(file.lastModified).toLocaleDateString('zh-TW')
    };
  }
}