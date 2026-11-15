import React from 'react';
import { BookOpen, Clock, BarChart3, Award, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export function SummaryCard({
  studySet,
  masteredCardsCount = 0,
  quizScore = null,
  totalQuizQuestions = 0,
  masteredConceptsCount = 0,
}) {
  if (!studySet) return null;

  const difficultyColors = {
    Beginner: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    Intermediate: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
    Advanced: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
  };

  const badgeColor = difficultyColors[studySet.difficulty] || difficultyColors.Intermediate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm transition-all duration-200">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${badgeColor}`}>
            {studySet.difficulty || 'Intermediate'}
          </span>
          <span className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>~{studySet.readTimeMinutes || 4} min read</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Structured AI Synthesis</span>
        </div>
      </div>

      {/* Title & Summary */}
      <div className="mt-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {studySet.topic}
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {studySet.summary}
        </p>
      </div>

      {/* Progress & Stat Metrics */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Flashcards Mastered */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Flashcards</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {masteredCardsCount} <span className="text-xs font-normal text-slate-400">/ {studySet.flashcards?.length || 0}</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {studySet.flashcards?.length > 0 ? Math.round((masteredCardsCount / studySet.flashcards.length) * 100) : 0}% Mastered
          </div>
        </div>

        {/* Metric 2: Quiz Score */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Quiz Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {quizScore !== null ? `${quizScore}` : '—'} 
            {totalQuizQuestions > 0 && <span className="text-xs font-normal text-slate-400">/ {totalQuizQuestions}</span>}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            {quizScore !== null ? `${Math.round((quizScore / (totalQuizQuestions || 1)) * 100)}% Accuracy` : 'Not attempted'}
          </div>
        </div>

        {/* Metric 3: Concepts Mastered */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Concepts</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {masteredConceptsCount} <span className="text-xs font-normal text-slate-400">/ {studySet.keyConcepts?.length || 0}</span>
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
            Core definitions
          </div>
        </div>

        {/* Metric 4: Total Study Blocks */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Activity</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Active
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            Ready to review
          </div>
        </div>
      </div>
    </div>
  );
}

