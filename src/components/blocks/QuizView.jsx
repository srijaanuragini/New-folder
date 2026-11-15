import React, { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle, Award, RotateCcw, AlertTriangle, ArrowRight, Check, Zap } from 'lucide-react';

export function QuizView({
  quiz = [],
  answers = {},
  onAnswer,
  isSubmitted = false,
  onSubmit,
  onReset,
  isRetestMode = false,
  onStartRetest,
  retestQuestionIds = [],
}) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // If in re-test mode, filter to only the wrong questions
  const displayedQuestions = isRetestMode
    ? quiz.filter(q => retestQuestionIds.includes(q.id))
    : quiz;

  if (!displayedQuestions || displayedQuestions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Award className="w-12 h-12 mx-auto mb-2 text-indigo-500 opacity-60" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No questions to display
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isRetestMode ? 'You have answered all questions correctly!' : 'No quiz questions available.'}
        </p>
        {isRetestMode && (
          <button
            onClick={onReset}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
          >
            Reset Full Quiz
          </button>
        )}
      </div>
    );
  }

  // Calculate score
  let correctCount = 0;
  displayedQuestions.forEach(q => {
    if (answers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const totalCount = displayedQuestions.length;
  const answeredCount = Object.keys(answers).filter(id => 
    displayedQuestions.some(q => q.id === id)
  ).length;
  const isAllAnswered = answeredCount === totalCount;
  const scorePercent = Math.round((correctCount / totalCount) * 100);
  const wrongCount = totalCount - correctCount;

  const currentQ = displayedQuestions[activeQuestionIndex] || displayedQuestions[0];
  const selectedOption = answers[currentQ.id];
  const hasAnsweredCurrent = selectedOption !== undefined;

  return (
    <div className="space-y-6">
      {/* Quiz Status Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{isRetestMode ? 'Targeted Re-test Session' : 'Diagnostic Practice Quiz'}</span>
            </h3>
            {isRetestMode && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                Focus on Missed Questions
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">
              Answered: <strong className="text-slate-800 dark:text-slate-200">{answeredCount}</strong> / {totalCount}
            </span>

            {isSubmitted && (
              <span className={`px-2.5 py-1 rounded-lg ${
                scorePercent >= 70
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}>
                Score: {scorePercent}% ({correctCount}/{totalCount})
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.round((answeredCount / totalCount) * 100)}%` }}
          />
        </div>
      </div>

      {/* Question Stepper Indicator */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {displayedQuestions.map((q, idx) => {
          const isAns = answers[q.id] !== undefined;
          const isCorrect = isAns && answers[q.id] === q.correctAnswerIndex;
          const isCurrent = idx === activeQuestionIndex;

          let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-500';
          if (isSubmitted) {
            badgeColor = isCorrect
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white';
          } else if (isAns) {
            badgeColor = 'bg-indigo-600 text-white';
          }

          return (
            <button
              key={q.id}
              onClick={() => setActiveQuestionIndex(idx)}
              className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${badgeColor} ${
                isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'hover:opacity-80'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Question Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Question {activeQuestionIndex + 1} of {totalCount}
            </span>
            <h4 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {currentQ.question}
            </h4>
          </div>

          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
            Press 1-{currentQ.options?.length || 4} to select
          </span>
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options?.map((optionText, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrectOption = optIdx === currentQ.correctAnswerIndex;

            let optionStyle = 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm';

            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-semibold';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/70 text-red-950 dark:text-red-100 font-semibold';
              } else {
                optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500';
              }
            } else if (isSelected) {
              optionStyle = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-100 font-semibold ring-2 ring-indigo-500/40 shadow-md';
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isSubmitted}
                onClick={() => onAnswer(currentQ.id, optIdx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start space-x-3.5 ${optionStyle}`}
              >
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                  {optIdx + 1}
                </span>
                <span className="flex-1 text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-medium">
                  {optionText}
                </span>

                {isSubmitted && isCorrectOption && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pedagogical Explanation (Revealed after submission or answering) */}
        {(isSubmitted || hasAnsweredCurrent) && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 animate-fade-in">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Explanation & Key Rationale:</span>
            </div>
            <p className="leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Question Footer Nav */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={activeQuestionIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>

          <button
            onClick={() => setActiveQuestionIndex(prev => Math.min(totalCount - 1, prev + 1))}
            disabled={activeQuestionIndex === totalCount - 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Completion & Re-test Actions Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {isSubmitted ? 'Quiz Finished!' : 'Ready to Submit?'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isSubmitted 
              ? `You answered ${correctCount} of ${totalCount} correctly.`
              : `${answeredCount} of ${totalCount} questions answered.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isSubmitted ? (
            <button
              onClick={onSubmit}
              disabled={answeredCount === 0}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all ${
                answeredCount === 0
                  ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
              }`}
            >
              Submit Quiz
            </button>
          ) : (
            <>
              {/* Core Requirement: Re-test Wrong Answers! */}
              {wrongCount > 0 && onStartRetest && (
                <button
                  onClick={onStartRetest}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Re-test {wrongCount} Wrong Answer{wrongCount > 1 ? 's' : ''}</span>
                </button>
              )}

              <button
                onClick={onReset}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Full Quiz</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

