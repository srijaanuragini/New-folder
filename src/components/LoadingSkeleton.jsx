import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const LOADING_MESSAGES = [
  'Ingesting raw notes and parsing semantic structure...',
  'Extracting core conceptual anchors and definitions...',
  'Generating pedagogical 3D flashcards with mnemonic hints...',
  'Formulating diagnostic multiple-choice quiz questions...',
  'Validating JSON schema and ensuring structural integrity...',
];

export function LoadingSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full space-y-6 animate-fade-in my-6">
      {/* Live AI Status Bar */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-4 flex items-center space-x-3 text-indigo-700 dark:text-indigo-300">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <div className="text-sm font-medium">
          <span className="font-semibold mr-1">MindPulse AI Engine:</span>
          <span className="animate-pulse">{LOADING_MESSAGES[messageIndex]}</span>
        </div>
      </div>

      {/* Overview Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="h-7 w-2/5 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Flashcard Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[260px] space-y-4">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
      </div>
    </div>
  );
}

