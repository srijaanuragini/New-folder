import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, CheckCircle, ShieldAlert } from 'lucide-react';

export function ErrorState({ error, onRetry, onUseFallback }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const isJsonError = error.type === 'json' || error.type === 'malformed_json';
  const isSchemaError = error.type === 'schema' || error.type === 'bad_shape';
  const isTimeoutError = error.type === 'timeout';

  let title = 'AI Processing Error';
  let badge = 'Fault Handled';
  let description = error.message;

  if (isJsonError) {
    title = 'Malformed AI Output (JSON Syntax Error)';
    badge = 'Parser Guard';
    description = 'The AI model generated response text that could not be parsed as valid JSON. The self-healing parser intercepted this before any component crashed.';
  } else if (isSchemaError) {
    title = 'Schema Validation Error (Invalid Structure)';
    badge = 'Schema Guard';
    description = 'The AI model returned valid JSON, but it failed strict Zod schema validation (e.g., missing required fields or incorrect data types).';
  } else if (isTimeoutError) {
    title = 'Model Request Timeout';
    badge = 'Timeout Guard';
    description = 'The AI provider took too long to complete generation. The request was cleanly aborted to prevent UI freeze.';
  }

  return (
    <div className="w-full my-6 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-5 sm:p-6 shadow-sm transition-all duration-200">
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-base text-red-900 dark:text-red-200">
              {title}
            </h3>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-200/60 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-300/40 dark:border-red-800/40">
              {badge}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300/90 leading-relaxed mb-4">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>
            )}

            {onUseFallback && (
              <button
                onClick={onUseFallback}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Load Safe Fallback Demo</span>
              </button>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center space-x-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline px-2 py-1"
            >
              <span>{showDetails ? 'Hide Diagnostics' : 'Inspect Diagnostics'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Diagnostics Accordion */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-red-200/60 dark:border-red-900/40">
              <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Debug Information:</span>
              </div>
              <pre className="text-[11px] p-3 rounded-lg bg-red-100/60 dark:bg-slate-950 text-red-900 dark:text-red-300 font-mono overflow-x-auto whitespace-pre-wrap border border-red-200/50 dark:border-red-900/30">
                {JSON.stringify({
                  errorType: error.type || 'unclassified',
                  message: error.message,
                  rawResponse: error.raw || '(none)',
                  handledBy: 'Safe Error Boundary & Schema Interceptor'
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

