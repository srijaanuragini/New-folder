import React, { useState } from 'react';
import { Wand2, XCircle, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { SAMPLE_TOPICS } from '../utils/sampleData.js';

export function InputSection({
  onGenerate,
  isLoading,
  provider,
  setProvider,
}) {
  const [inputText, setInputText] = useState('');

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onGenerate(inputText.trim(), { provider });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleLoadSample = (sample) => {
    setInputText(sample.text);
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Study Material Input
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste lecture notes, articles, or any topic. MindPulse transforms it into an interactive study suite.
          </p>
        </div>

        {/* Model Provider Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Model:</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="auto">Auto / Smart Mock</option>
            <option value="gemini">Google Gemini 1.5</option>
            <option value="groq">Groq (Llama 3.1)</option>
            <option value="openai">OpenAI (GPT-4o-mini)</option>
            <option value="ollama">Local Ollama</option>
          </select>
        </div>
      </div>

      {/* Free-form Input Area */}
      <div className="mt-4 relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your messy notes, lecture summary, or textbook chapter here... (e.g. Mitochondria produces cellular energy through oxidative phosphorylation...)"
          rows={4}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
        />

        {inputText && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Clear text"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Preset Chips & Action Bar */}
      <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sample Topics */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Samples:
          </span>
          {SAMPLE_TOPICS.map((sample) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span>{sample.icon}</span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Ctrl + Enter
          </span>
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || isLoading}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md transition-all ${
              !inputText.trim() || isLoading
                ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-500/25'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Study Set</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

