import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw, PlusCircle, Lightbulb } from 'lucide-react';

const REFINEMENT_PRESETS = [
  { label: '🎯 Add Harder Questions', prompt: 'Add 3 challenging, higher-difficulty diagnostic quiz questions with deeper explanations.' },
  { label: '💡 Simplify Explanations', prompt: 'Simplify the definitions and explanations to make them accessible for a beginner.' },
  { label: '🧠 Add Mnemonics', prompt: 'Add memorable mnemonic hints to each flashcard to boost active recall.' },
  { label: '🔍 Focus on Edge Cases', prompt: 'Add flashcards and quiz questions addressing subtle edge cases and common misconceptions.' },
];

export function RefinementBar({ onRefine, isRefining }) {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onRefine(instruction.trim());
    setInstruction('');
  };

  const handleApplyPreset = (promptText) => {
    if (isRefining) return;
    onRefine(promptText);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Iterative Refinement Loop
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            Follow-up AI Edits
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Modifies the existing study set without losing your progress
        </span>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {REFINEMENT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={isRefining}
            onClick={() => handleApplyPreset(preset.prompt)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all font-medium disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Refinement Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isRefining}
            placeholder="Give a follow-up prompt (e.g. 'Add 2 more flashcards about photolysis', 'Make questions harder')..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!instruction.trim() || isRefining}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all ${
            !instruction.trim() || isRefining
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20'
          }`}
        >
          {isRefining ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Refining...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Refine</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

