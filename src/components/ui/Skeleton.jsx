import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 dark:bg-dark-border rounded-xl ${className}`} />
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-8 py-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-5 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-6">
        <Skeleton className="w-12 h-12 mb-4" />
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-7 w-28" />
      </div>
    ))}
  </div>
);
