# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15.4.6 application using TypeScript, React 19, and Tailwind CSS v4. The project was bootstrapped with create-next-app and uses the App Router architecture.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack at http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing
No test configuration found. When implementing tests, first check for testing requirements and framework preferences.

## Architecture

### Directory Structure
- `/app` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist fonts
  - `page.tsx` - Home page component  
  - `compare/page.tsx` - Compare results page
  - `globals.css` - Global Tailwind CSS with custom diff visualization styles
- `/components` - React components
  - `FileUpload.tsx` - File upload interface
  - `CompareResults.tsx` - Comparison results display
  - `DataGrid.tsx` - Data grid component for displaying spreadsheet data
  - `DiffStats.tsx` - Statistics component for differences
  - `FilterControls.tsx` - Filtering controls
  - `ExportButtons.tsx` - Export functionality buttons
- `/lib` - Core business logic
  - `types.ts` - TypeScript type definitions for the entire application
  - `diff-engine.ts` - Core comparison algorithm and difference calculation
  - `file-parser.ts` - File parsing utilities for CSV/Excel
  - `export-utils.ts` - Export functionality for different formats
- `/public` - Static assets (images, SVGs)

### Key Technologies
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Lucide React icons, AG Grid Community for spreadsheet display
- **File Processing**: Papa Parse (CSV), xlsx library (Excel), file-saver for downloads
- **PDF Generation**: jsPDF with autotable plugin for report exports
- **Fonts**: Geist and Geist Mono from Google Fonts
- **Path Alias**: `@/*` maps to root directory

### TypeScript Configuration
- Strict mode enabled
- Module resolution: bundler
- Target: ES2017
- JSX: preserve
- Path alias: `@/*` for imports from root

### Application Features
- **File Comparison**: Compares CSV and Excel files to identify differences
- **Visual Diff Display**: Custom CSS classes for highlighting added, modified, and deleted rows/cells
- **Export Capabilities**: Supports CSV, Excel, and PDF export formats
- **Responsive Design**: Mobile-optimized interface with Chinese language support
- **Data Grid**: Uses AG Grid Community for efficient display of large datasets

### Development Notes
- The application uses Turbopack for faster development builds
- Auto-updates on file changes during development
- Font optimization handled automatically by next/font
- Custom CSS variables defined for diff visualization in light and dark modes
- App Router architecture with client-side components for file processing
- AG Grid Community requires module registration in components that use it