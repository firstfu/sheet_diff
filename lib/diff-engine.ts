import { ParsedFile, CompareOptions, DiffResult, RowDifference, DiffStats } from './types';

export class DiffEngine {
  private options: CompareOptions;

  constructor(options: CompareOptions) {
    this.options = options;
  }

  compare(oldFile: ParsedFile, newFile: ParsedFile): DiffResult {
    const alignedData = this.alignColumns(oldFile, newFile);
    const oldIndex = this.buildIndex(alignedData.oldData);
    const newIndex = this.buildIndex(alignedData.newData);
    
    const differences = this.calculateDifferences(oldIndex, newIndex, alignedData.headers);
    const stats = this.calculateStats(differences);

    return {
      stats,
      differences,
      headers: alignedData.headers
    };
  }

  private alignColumns(oldFile: ParsedFile, newFile: ParsedFile) {
    const allHeaders = Array.from(new Set([...oldFile.headers, ...newFile.headers]));
    const filteredHeaders = allHeaders.filter(header => 
      !this.options.ignoredColumns.includes(header)
    );

    return {
      headers: filteredHeaders,
      oldData: this.normalizeData(oldFile.data, filteredHeaders),
      newData: this.normalizeData(newFile.data, filteredHeaders)
    };
  }

  private normalizeData(data: Record<string, unknown>[], headers: string[]): Record<string, unknown>[] {
    return data.map((row) => {
      const normalizedRow: Record<string, unknown> = {};
      headers.forEach(header => {
        let value = row[header] !== undefined ? String(row[header]) : '';
        
        if (this.options.ignoreWhitespace) {
          value = value.trim();
        }
        
        if (this.options.ignoreCase) {
          value = value.toLowerCase();
        }
        
        normalizedRow[header] = value;
      });
      return normalizedRow;
    });
  }

  private buildIndex(data: Record<string, unknown>[]): Map<string, { index: number; data: Record<string, unknown> }> {
    const index = new Map();
    
    data.forEach((row, idx) => {
      const key = this.options.primaryKey 
        ? String(row[this.options.primaryKey] || idx)
        : String(idx);
      
      index.set(key, { index: idx, data: row });
    });
    
    return index;
  }

  private calculateDifferences(
    oldIndex: Map<string, { index: number; data: Record<string, unknown> }>,
    newIndex: Map<string, { index: number; data: Record<string, unknown> }>,
    headers: string[]
  ): RowDifference[] {
    const differences: RowDifference[] = [];
    const processedKeys = new Set<string>();

    oldIndex.forEach((oldEntry, key) => {
      processedKeys.add(key);
      
      if (newIndex.has(key)) {
        const newEntry = newIndex.get(key);
        if (newEntry) {
          const changedFields = this.findChangedFields(oldEntry.data, newEntry.data, headers);
          
          if (changedFields.length > 0) {
            differences.push({
              rowIndex: oldEntry.index,
              type: 'modified',
              oldData: this.getOriginalData(oldEntry.data, headers),
              newData: this.getOriginalData(newEntry.data, headers),
              changedFields,
              primaryKeyValue: key
            });
          } else {
            // 加入未更改的行
            differences.push({
              rowIndex: oldEntry.index,
              type: 'normal',
              oldData: this.getOriginalData(oldEntry.data, headers),
              newData: this.getOriginalData(newEntry.data, headers),
              changedFields: [],
              primaryKeyValue: key
            });
          }
        }
      } else {
        differences.push({
          rowIndex: oldEntry.index,
          type: 'deleted',
          oldData: this.getOriginalData(oldEntry.data, headers),
          primaryKeyValue: key
        });
      }
    });

    newIndex.forEach((newEntry, key) => {
      if (!processedKeys.has(key)) {
        differences.push({
          rowIndex: newEntry.index,
          type: 'added',
          newData: this.getOriginalData(newEntry.data, headers),
          primaryKeyValue: key
        });
      }
    });

    return differences.sort((a, b) => a.rowIndex - b.rowIndex);
  }

  private findChangedFields(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    headers: string[]
  ): string[] {
    const changedFields: string[] = [];
    
    headers.forEach(header => {
      const oldValue = oldData[header] || '';
      const newValue = newData[header] || '';
      
      if (oldValue !== newValue) {
        changedFields.push(header);
      }
    });
    
    return changedFields;
  }

  private getOriginalData(normalizedData: Record<string, unknown>, headers: string[]): Record<string, unknown> {
    const originalData: Record<string, unknown> = {};
    headers.forEach(header => {
      originalData[header] = normalizedData[header];
    });
    return originalData;
  }

  private calculateStats(differences: RowDifference[]): DiffStats {
    let modifiedRows = 0;
    let addedRows = 0;
    let deletedRows = 0;

    differences.forEach(diff => {
      switch (diff.type) {
        case 'modified':
          modifiedRows++;
          break;
        case 'added':
          addedRows++;
          break;
        case 'deleted':
          deletedRows++;
          break;
        // 'normal' 類型不計入差異統計
      }
    });

    // totalRows 只計算有差異的行數
    return {
      totalRows: modifiedRows + addedRows + deletedRows,
      modifiedRows,
      addedRows,
      deletedRows
    };
  }

  static async compareInWorker(oldFile: ParsedFile, newFile: ParsedFile, options: CompareOptions): Promise<DiffResult> {
    return new Promise((resolve, reject) => {
      const workerCode = `
        self.onmessage = function(e) {
          const { oldFile, newFile, options } = e.data;
          
          try {
            ${DiffEngine.toString()}
            
            const engine = new DiffEngine(options);
            const result = engine.compare(oldFile, newFile);
            
            self.postMessage({ success: true, result });
          } catch (error) {
            self.postMessage({ success: false, error: error.message });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.postMessage({ oldFile, newFile, options });

      worker.onmessage = (e) => {
        const { success, result, error } = e.data;
        worker.terminate();
        URL.revokeObjectURL(blob.toString());

        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        URL.revokeObjectURL(blob.toString());
        reject(error);
      };

      setTimeout(() => {
        worker.terminate();
        URL.revokeObjectURL(blob.toString());
        reject(new Error('比對超時'));
      }, 30000);
    });
  }
}