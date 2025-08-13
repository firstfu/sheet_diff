// import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DiffResult, ExportOptions, RowDifference } from './types';

export class ExportManager {
  
  async exportToCSV(diffResult: DiffResult, options: ExportOptions): Promise<Blob> {
    let csvContent = '';
    
    if (options.includeStats) {
      csvContent += '差異統計摘要\n';
      csvContent += `總變更,${diffResult.stats.totalRows}\n`;
      csvContent += `修改,${diffResult.stats.modifiedRows}\n`;
      csvContent += `新增,${diffResult.stats.addedRows}\n`;
      csvContent += `刪除,${diffResult.stats.deletedRows}\n`;
      csvContent += '\n詳細差異\n';
    }
    
    const headers = ['狀態', '行號', ...diffResult.headers];
    csvContent += headers.join(',') + '\n';
    
    let rows = diffResult.differences;
    if (options.includeOnlyDifferences) {
      rows = rows.filter(row => ['modified', 'added', 'deleted'].includes(row.type));
    }
    
    rows.forEach(row => {
      const csvRow = [
        this.getStatusText(row.type),
        row.rowIndex + 1,
        ...diffResult.headers.map(header => {
          const data = row.newData || row.oldData || {};
          const value = data[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
      ];
      csvContent += csvRow.join(',') + '\n';
    });
    
    return new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportToExcel(diffResult: DiffResult, options: ExportOptions): Promise<Blob> {
    const workbook = XLSX.utils.book_new();
    
    if (options.includeStats) {
      const summaryData = [
        ['項目', '數量'],
        ['總變更', diffResult.stats.totalRows],
        ['修改', diffResult.stats.modifiedRows],
        ['新增', diffResult.stats.addedRows],
        ['刪除', diffResult.stats.deletedRows]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, '差異摘要');
    }
    
    let rows = diffResult.differences;
    if (options.includeOnlyDifferences) {
      rows = rows.filter(row => ['modified', 'added', 'deleted'].includes(row.type));
    }
    
    const diffData = [
      ['狀態', '行號', ...diffResult.headers],
      ...rows.map(row => [
        this.getStatusText(row.type),
        row.rowIndex + 1,
        ...diffResult.headers.map(header => {
          const data = row.newData || row.oldData || {};
          return data[header] || '';
        })
      ])
    ];
    
    const diffSheet = XLSX.utils.aoa_to_sheet(diffData);
    
    this.styleExcelSheet(diffSheet, rows);
    
    XLSX.utils.book_append_sheet(workbook, diffSheet, '詳細差異');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async exportToPDF(diffResult: DiffResult, options: ExportOptions): Promise<Blob> {
    const pdf = new jsPDF();
    
    pdf.setFont('helvetica');
    
    pdf.setFontSize(20);
    pdf.text('檔案差異比對報告', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`生成時間: ${new Date().toLocaleString('zh-TW')}`, 20, 35);
    
    if (options.includeStats) {
      pdf.setFontSize(16);
      pdf.text('差異統計摘要', 20, 55);
      
      const statsData = [
        ['項目', '數量'],
        ['總變更', diffResult.stats.totalRows.toString()],
        ['修改', diffResult.stats.modifiedRows.toString()],
        ['新增', diffResult.stats.addedRows.toString()],
        ['刪除', diffResult.stats.deletedRows.toString()]
      ];
      
      autoTable(pdf as unknown as jsPDF, {
        head: [statsData[0]],
        body: statsData.slice(1),
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    let rows = diffResult.differences;
    if (options.includeOnlyDifferences) {
      rows = rows.filter(row => ['modified', 'added', 'deleted'].includes(row.type));
    }
    
    if (rows.length > 0) {
      const startY = options.includeStats ? (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20 : 65;
      
      pdf.setFontSize(16);
      pdf.text('詳細差異', 20, startY);
      
      const tableData = rows.slice(0, 50).map(row => [
        this.getStatusText(row.type),
        (row.rowIndex + 1).toString(),
        ...diffResult.headers.slice(0, 5).map(header => {
          const data = row.newData || row.oldData || {};
          const value = data[header] || '';
          return String(value).substring(0, 20);
        })
      ]);
      
      autoTable(pdf as unknown as jsPDF, {
        head: [['狀態', '行號', ...diffResult.headers.slice(0, 5)]],
        body: tableData,
        startY: startY + 10,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        didParseCell: function(data) {
          if (data.row.index >= 0) {
            const rowType = rows[data.row.index]?.type;
            if (rowType === 'added') {
              data.cell.styles.fillColor = [212, 237, 218];
            } else if (rowType === 'deleted') {
              data.cell.styles.fillColor = [248, 215, 218];
            } else if (rowType === 'modified') {
              data.cell.styles.fillColor = [255, 243, 205];
            }
          }
        }
      });
      
      if (rows.length > 50) {
        pdf.setFontSize(10);
        pdf.text(`註: 僅顯示前 50 筆差異，總共 ${rows.length} 筆`, 20, (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10);
      }
    }
    
    return pdf.output('blob');
  }

  private styleExcelSheet(sheet: XLSX.WorkSheet, rows: RowDifference[]) {
    if (!sheet['!cols']) sheet['!cols'] = [];
    
    rows.forEach((row, index) => {
      const rowNum = index + 2;
      let fillColor = '';
      
      switch (row.type) {
        case 'added':
          fillColor = 'D4EDDA';
          break;
        case 'deleted':
          fillColor = 'F8D7DA';
          break;
        case 'modified':
          fillColor = 'FFF3CD';
          break;
      }
      
      if (fillColor) {
        for (let col = 0; col < 10; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum - 1, c: col });
          if (!sheet[cellAddress]) sheet[cellAddress] = { t: 's', v: '' };
          if (!sheet[cellAddress].s) sheet[cellAddress].s = {};
          sheet[cellAddress].s.fill = { fgColor: { rgb: fillColor } };
        }
      }
    });
  }

  private getStatusText(type: string): string {
    switch (type) {
      case 'modified': return '修改';
      case 'added': return '新增';
      case 'deleted': return '刪除';
      default: return '正常';
    }
  }
}