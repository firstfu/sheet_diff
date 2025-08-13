// import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    // 創建一個 HTML 元素來渲染報告內容
    const htmlContent = this.createHTMLReport(diffResult, options);
    
    // 創建臨時的 DOM 元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, "Microsoft JhengHei", "Noto Sans TC", sans-serif';
    
    document.body.appendChild(tempDiv);
    
    try {
      // 使用 html2canvas 將 HTML 轉換為圖片
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      // 創建 PDF 並添加圖片
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 寬度
      const pageHeight = 295; // A4 高度
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // 添加第一頁
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 如果內容超過一頁，添加更多頁面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      return pdf.output('blob');
      
    } finally {
      // 清理臨時元素
      document.body.removeChild(tempDiv);
    }
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

  private getStatusTextEn(type: string): string {
    switch (type) {
      case 'modified': return 'Modified';
      case 'added': return 'Added';
      case 'deleted': return 'Deleted';
      default: return 'Normal';
    }
  }

  private createHTMLReport(diffResult: DiffResult, options: ExportOptions): string {
    let rows = diffResult.differences;
    if (options.includeOnlyDifferences) {
      rows = rows.filter(row => ['modified', 'added', 'deleted'].includes(row.type));
    }

    let html = `
      <div style="font-family: Arial, 'Microsoft JhengHei', 'Noto Sans TC', sans-serif; color: #333;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">檔案差異比對報告</h1>
        <p style="color: #7f8c8d; margin-bottom: 30px;">生成時間: ${new Date().toLocaleString('zh-TW')}</p>
    `;

    if (options.includeStats) {
      html += `
        <h2 style="color: #34495e; margin-top: 30px;">差異統計摘要</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">項目</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">數量</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">總變更</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${diffResult.stats.totalRows}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">修改</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${diffResult.stats.modifiedRows}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">新增</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${diffResult.stats.addedRows}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">刪除</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${diffResult.stats.deletedRows}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    if (rows.length > 0) {
      html += `
        <h2 style="color: #34495e; margin-top: 30px;">詳細差異</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px;">狀態</th>
              <th style="border: 1px solid #ddd; padding: 8px;">行號</th>
              ${diffResult.headers.slice(0, 5).map(header => 
                `<th style="border: 1px solid #ddd; padding: 8px;">${header}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      rows.slice(0, 50).forEach(row => {
        let bgColor = '#ffffff';
        if (row.type === 'added') bgColor = '#d4edda';
        else if (row.type === 'deleted') bgColor = '#f8d7da';
        else if (row.type === 'modified') bgColor = '#fff3cd';

        html += `
          <tr style="background-color: ${bgColor};">
            <td style="border: 1px solid #ddd; padding: 8px;">${this.getStatusText(row.type)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${row.rowIndex + 1}</td>
            ${diffResult.headers.slice(0, 5).map(header => {
              const data = row.newData || row.oldData || {};
              const value = data[header] || '';
              return `<td style="border: 1px solid #ddd; padding: 8px;">${String(value).substring(0, 20)}</td>`;
            }).join('')}
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      if (rows.length > 50) {
        html += `<p style="color: #7f8c8d; margin-top: 15px; font-style: italic;">註: 僅顯示前 50 筆差異，總共 ${rows.length} 筆</p>`;
      }
    }

    html += '</div>';
    return html;
  }
}