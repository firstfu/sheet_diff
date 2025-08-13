# DataDiff Pro

企業級智能檔案差異分析平台

## 專案簡介

DataDiff Pro 是一個基於 Next.js 15.4.6 開發的企業級檔案比較工具，專門用於 CSV 和 Excel 檔案的智能差異分析。採用先進的演算法提供精確的檔案比對，並提供直觀的視覺化差異報告。

### 主要功能

- 🔍 **智能檔案比較** - 支援 CSV 和 Excel (.xlsx/.xls) 格式
- 📊 **視覺化差異顯示** - 直觀突出顯示新增、修改、刪除的資料
- 📈 **統計報告** - 詳細的差異統計和分析結果
- 📤 **多格式匯出** - 支援 CSV、Excel、PDF 格式匯出
- 🌓 **明暗主題** - 完整支援明暗模式切換
- 📱 **響應式設計** - 完美適配桌面和行動裝置
- 🇹🇼 **中文介面** - 完整的繁體中文支援

## 技術架構

- **前端框架**: Next.js 15.4.6 with App Router
- **程式語言**: TypeScript (嚴格模式)
- **UI 框架**: React 19
- **樣式系統**: Tailwind CSS v4
- **資料表格**: AG Grid Community
- **檔案處理**: Papa Parse (CSV) + xlsx (Excel)
- **圖示系統**: Lucide React
- **字體**: Geist 系列字體

## 快速開始

### 環境需求

- Node.js 18.0 或更高版本
- npm 或 yarn 套件管理器

### 安裝與執行

1. 安裝相依套件：
```bash
npm install
```

2. 啟動開發伺服器：
```bash
npm run dev
```

3. 打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 可用指令

- `npm run dev` - 啟動開發伺服器 (使用 Turbopack)
- `npm run build` - 建置生產環境版本
- `npm run start` - 啟動生產環境伺服器
- `npm run lint` - 執行 ESLint 程式碼檢查

## 使用方法

1. **上傳檔案** - 選擇要比較的兩個 CSV 或 Excel 檔案
2. **設定選項** - 配置比較參數（主鍵、忽略選項等）
3. **執行比較** - 點擊比較按鈕開始分析
4. **查看結果** - 瀏覽詳細的差異報告和統計資訊
5. **匯出報告** - 選擇所需格式匯出分析結果

## 專案結構

```
sheet_diff/
├── app/                 # Next.js App Router 頁面
│   ├── layout.tsx      # 根佈局
│   ├── page.tsx        # 首頁
│   ├── compare/        # 比較結果頁面
│   └── globals.css     # 全域樣式
├── components/         # React 元件
│   ├── FileUpload.tsx  # 檔案上傳
│   ├── DataGrid.tsx    # 資料表格
│   └── ...            # 其他元件
├── lib/               # 核心邏輯
│   ├── types.ts       # 類型定義
│   ├── diff-engine.ts # 比較引擎
│   └── ...           # 工具函數
└── public/           # 靜態資源
```

## 開發指南

### 程式碼風格

- 使用 TypeScript 嚴格模式
- 遵循 ESLint 設定的程式碼風格
- 採用 Tailwind CSS 進行樣式設計
- 使用 `@/*` 路徑別名進行模組匯入

### 重要注意事項

- AG Grid Community 需要在元件中註冊模組
- 專案使用 Turbopack 進行快速開發建置
- 支援自動字體最佳化和熱重載
- 自訂 CSS 變數支援明暗模式切換

## 部署

### Vercel 部署

最簡單的部署方式是使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)：

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 自動部署完成

詳細部署說明請參考 [Next.js 部署文件](https://nextjs.org/docs/app/building-your-application/deploying)。

## 授權

MIT License

## 技術支援

如有任何問題或建議，歡迎提交 Issue 或 Pull Request。
