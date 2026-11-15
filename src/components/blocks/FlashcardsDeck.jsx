import React, { useState } from 'react';
import { RotateCw, CheckCircle2, ChevronLeft, ChevronRight, Shuffle, Filter, Lightbulb, Keyboard } from 'lucide-react';

export function FlashcardsDeck({
  flashcards = [],
  currentIndex = 0,
  isFlipped = false,
  onFlip,
  onNext,
  onPrev,
  masteredIds = new Set(),
  onToggleMastery,
  showNeedsReviewOnly = false,
  onToggleFilter,
}) {
  const [showHint, setShowHint] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <p className="text-sm font-medium">No flashcards available in this view.</p>
        {showNeedsReviewOnly && (
          <button
            onClick={onToggleFilter}
            className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Show All Cards
          </button>
        )}
      </div>
    );
  }

  const currentCard = flashcards[currentIndex] || flashcards[0];
  const isMastered = masteredIds.has(currentCard.id);
  const progressPercent = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  const handleCardClick = (e) => {
    // Prevent flipping if user clicked a button inside the card
    if (e.target.closest('button')) return;
    setShowHint(false);
    onFlip();
  };

  return (
    <div className="space-y-4">
      {/* Deck Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Filter & Keyboard hints */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleFilter}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showNeedsReviewOnly
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showNeedsReviewOnly ? 'Filtering: Needs Review' : 'Filter: All Cards'}</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
            <Keyboard className="w-3 h-3" />
            <span>Space / Arrow keys</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[320px] sm:min-h-[360px] cursor-pointer" onClick={handleCardClick}>
        <div
          className={`relative w-full h-full min-h-[320px] sm:min-h-[360px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
            
            {/* Top Bar of Front */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Question
              </span>

              {isMastered && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mastered</span>
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="my-auto text-center px-2 sm:px-6">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {currentCard.question}
              </h3>

              {/* Optional Hint */}
              {currentCard.hint && (
                <div className="mt-4">
                  {showHint ? (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800 animate-fade-in">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span><strong>Hint:</strong> {currentCard.hint}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Need a hint?</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Bar of Front */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
              <span className="text-[11px] hidden sm:inline">Click card or press Space to reveal answer</span>
              <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-semibold ml-auto">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Card</span>
              </div>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50/90 to-white dark:from-slate-900 dark:to-slate-950 border-2 border-indigo-300 dark:border-indigo-800 rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl">
            
            {/* Top Bar of Back */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Answer & Key Insight
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastery(currentCard.id);
                }}
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isMastered
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMastered ? 'Mastered!' : 'Mark as Mastered'}</span>
              </button>
            </div>

            {/* Answer Text */}
            <div className="my-auto text-center px-2 sm:px-6">
              <p className="text-base sm:text-xl font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            {/* Bottom Bar of Back */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
              <span className="text-[11px] hidden sm:inline">Click to flip back to question</span>
              <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-semibold ml-auto">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center space-x-3 pt-2">
        <button
          onClick={onPrev}
          title="Previous card (Left Arrow)"
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onFlip}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all inline-flex items-center space-x-2"
        >
          <RotateCw className="w-4 h-4" />
          <span>Flip Card</span>
        </button>

        <button
          onClick={onNext}
          title="Next card (Right Arrow)"
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

