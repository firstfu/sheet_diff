# CLAUDE.md

此文件為 Claude Code (claude.ai/code) 在此代碼庫中工作時提供指導。

## 專案概述
這是一個使用 TypeScript、React 19 和 Tailwind CSS v4 的 Next.js 15.4.6 應用程式。專案使用 create-next-app 初始化，採用 App Router 架構。

## 指令

### 開發
- `npm run dev` - 使用 Turbopack 啟動開發伺服器，訪問 http://localhost:3000
- `npm run build` - 建置生產環境應用程式
- `npm run start` - 啟動生產環境伺服器
- `npm run lint` - 執行 ESLint 程式碼品質檢查

### 測試
未發現測試配置。實作測試時，請先檢查測試需求和框架偏好。

## 架構

### 目錄結構
- `/app` - Next.js App Router 頁面和佈局
  - `layout.tsx` - 使用 Geist 字體的根佈局
  - `page.tsx` - 首頁元件
  - `compare/page.tsx` - 比較結果頁面
  - `globals.css` - 全域 Tailwind CSS 與自訂差異視覺化樣式
- `/components` - React 元件
  - `FileUpload.tsx` - 檔案上傳介面
  - `CompareResults.tsx` - 比較結果顯示
  - `DataGrid.tsx` - 用於顯示試算表資料的資料格元件
  - `DiffStats.tsx` - 差異統計元件
  - `FilterControls.tsx` - 篩選控制項
  - `ExportButtons.tsx` - 匯出功能按鈕
- `/lib` - 核心業務邏輯
  - `types.ts` - 整個應用程式的 TypeScript 類型定義
  - `diff-engine.ts` - 核心比較演算法和差異計算
  - `file-parser.ts` - CSV/Excel 檔案解析工具
  - `export-utils.ts` - 不同格式的匯出功能
- `/public` - 靜態資源（圖片、SVG）

### 關鍵技術
- **框架**: Next.js 15.4.6 與 App Router
- **語言**: TypeScript 開啟嚴格模式
- **樣式**: Tailwind CSS v4 與 PostCSS
- **UI 元件**: Lucide React 圖示，AG Grid Community 用於試算表顯示
- **檔案處理**: Papa Parse（CSV）、xlsx 函式庫（Excel）、file-saver 用於下載
- **PDF 生成**: jsPDF 與 autotable 外掛用於報告匯出
- **字體**: 來自 Google Fonts 的 Geist 和 Geist Mono
- **路徑別名**: `@/*` 對應到根目錄

### TypeScript 配置
- 開啟嚴格模式
- 模組解析：bundler
- 目標：ES2017
- JSX：preserve
- 路徑別名：`@/*` 用於從根目錄匯入

### 應用程式功能
- **檔案比較**: 比較 CSV 和 Excel 檔案以識別差異
- **視覺化差異顯示**: 自訂 CSS 類別用於突出顯示新增、修改和刪除的行/儲存格
- **匯出功能**: 支援 CSV、Excel 和 PDF 匯出格式
- **響應式設計**: 針對行動裝置最佳化的介面，支援中文語言
- **資料格**: 使用 AG Grid Community 高效顯示大型資料集

### 開發注意事項
- 應用程式使用 Turbopack 進行更快的開發建置
- 開發期間檔案變更自動更新
- 字體最佳化由 next/font 自動處理
- 在 globals.css 中定義了用於明暗模式的差異視覺化自訂 CSS 變數
- App Router 架構與客戶端元件用於檔案處理
- AG Grid Community 需要在使用它的元件中註冊模組