import React from 'react';
import { BookOpen, CheckCircle2, Circle, Tag, Bookmark } from 'lucide-react';

export function ConceptList({
  keyConcepts = [],
  masteredIds = new Set(),
  onToggleMastery,
}) {
  if (!keyConcepts || keyConcepts.length === 0) {
    return null;
  }

  const categoryColors = {
    'Core Principle': 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'Formula': 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'Vocabulary': 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Application': 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  };

  const masteredCount = keyConcepts.filter(c => masteredIds.has(c.id)).length;
  const percentMastered = Math.round((masteredCount / keyConcepts.length) * 100);

  return (
    <div className="space-y-4">
      {/* Checklist Header & Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Key Terminology & Conceptual Checklist
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">
              Mastered: <strong className="text-slate-800 dark:text-slate-200">{masteredCount}</strong> / {keyConcepts.length}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {percentMastered}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentMastered}%` }}
          />
        </div>
      </div>

      {/* Concept Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {keyConcepts.map((item) => {
          const isMastered = masteredIds.has(item.id);
          const badgeClass = categoryColors[item.category] || categoryColors['Core Principle'];

          return (
            <div
              key={item.id}
              onClick={() => onToggleMastery(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                isMastered
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400/80 dark:border-emerald-800/80'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-300 dark:text-slate-700 hover:text-emerald-500 transition-colors"
              >
                {isMastered ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold truncate ${
                    isMastered
                      ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-80'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {item.term}
                  </h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex-shrink-0 ${badgeClass}`}>
                    {item.category || 'Core'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {item.definition}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

