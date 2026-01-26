"use client";

import { ReactNode } from "react";

interface SubjectHeaderFormatterProps {
  title: string;
  subtitle?: string;
  year?: number;
  series?: string;
  subject?: string;
  className?: string;
}

/**
 * Composant pour formater le titre et le sous-titre d'un sujet
 * Affiche les informations de manière claire et professionnelle
 */
export function SubjectHeaderFormatter({
  title,
  subtitle,
  year,
  series,
  subject,
  className = "",
}: SubjectHeaderFormatterProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h1>

      {/* Métadonnées du sujet */}
      {(year || series || subject) && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          {subject && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold">
              {subject}
            </span>
          )}
          {series && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold">
              Série {series}
            </span>
          )}
          {year && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              {year}
            </span>
          )}
        </div>
      )}

      {/* Sous-titre */}
      {subtitle && (
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
