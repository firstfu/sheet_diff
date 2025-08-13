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
  - `globals.css` - Global Tailwind CSS styles
- `/public` - Static assets (images, SVGs)

### Key Technologies
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist and Geist Mono from Google Fonts
- **Path Alias**: `@/*` maps to root directory

### TypeScript Configuration
- Strict mode enabled
- Module resolution: bundler
- Target: ES2017
- JSX: preserve
- Path alias: `@/*` for imports from root

### Development Notes
- The application uses Turbopack for faster development builds
- Auto-updates on file changes during development
- Font optimization handled automatically by next/font