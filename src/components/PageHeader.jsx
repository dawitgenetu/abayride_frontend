import React from 'react';

/** Consistent page title block for admin sections */
export const PageHeader = ({ title, subtitle, actions, badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
    <div className="min-w-0">
      {badge && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary dark:text-blue-400 mb-2">
          {badge}
        </span>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub max-w-2xl">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
  </div>
);
