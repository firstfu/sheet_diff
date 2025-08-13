'use client';

import { DiffStats as DiffStatsType } from '@/lib/types';
import { BarChart3, Plus, Minus, Edit3, Activity } from 'lucide-react';

interface DiffStatsProps {
  stats: DiffStatsType;
}

export function DiffStats({ stats }: DiffStatsProps) {
  const items = [
    {
      label: '總變更數',
      value: stats.totalRows,
      icon: BarChart3,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      percentage: 100
    },
    {
      label: '修改項目',
      value: stats.modifiedRows,
      icon: Edit3,
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      percentage: stats.totalRows > 0 ? (stats.modifiedRows / stats.totalRows) * 100 : 0
    },
    {
      label: '新增項目',
      value: stats.addedRows,
      icon: Plus,
      gradient: 'from-emerald-500 to-green-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      percentage: stats.totalRows > 0 ? (stats.addedRows / stats.totalRows) * 100 : 0
    },
    {
      label: '刪除項目',
      value: stats.deletedRows,
      icon: Minus,
      gradient: 'from-red-500 to-pink-500',
      lightBg: 'bg-red-50 dark:bg-red-900/20',
      percentage: stats.totalRows > 0 ? (stats.deletedRows / stats.totalRows) * 100 : 0
    }
  ];

  const impactLevel = stats.totalRows === 0 ? 'none' : 
    stats.totalRows < 10 ? 'low' : 
    stats.totalRows < 100 ? 'medium' : 'high';

  const impactLabels = {
    none: '無變更',
    low: '輕微變更',
    medium: '中等變更',
    high: '重大變更'
  };

  const impactColors = {
    none: 'text-gray-500',
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.label} 
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transform hover:-translate-y-1"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            
            {/* Icon */}
            <div className={`relative mb-4 ${item.lightBg} rounded-xl p-3 w-fit`}>
              <Icon className={`h-6 w-6 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`} />
            </div>
            
            {/* Content */}
            <div className="relative">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {item.value.toLocaleString()}
              </p>
              
              {/* Progress Bar */}
              {index > 0 && stats.totalRows > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">佔比</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${item.gradient} h-2 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Impact Level for Total */}
              {index === 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className={`text-xs font-medium ${impactColors[impactLevel]}`}>
                    {impactLabels[impactLevel]}
                  </span>
                </div>
              )}
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{
              background: `linear-gradient(45deg, ${item.gradient.includes('blue') ? '#3b82f6' : item.gradient.includes('amber') ? '#f59e0b' : item.gradient.includes('emerald') ? '#10b981' : '#ef4444'}, transparent, transparent)`,
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite'
            }}></div>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}