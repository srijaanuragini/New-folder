import { extractAndParseJson } from './jsonRepair.js';
import { validateStudySet, repairAndNormalizeStudySet } from '../types/schema.js';

let latestRequestId = 0;
let activeAbortController = null;

/**
 * Generate a complete structured study set from raw notes.
 * Enforces race-condition prevention and strict validation.
 */
export async function generateStudySet(notes, options = {}) {
  // Abort any in-flight request
  if (activeAbortController) {
    activeAbortController.abort('New request initiated');
  }

  activeAbortController = new AbortController();
  const currentReqId = ++latestRequestId;
  const signal = options.signal || activeAbortController.signal;

  try {
    const savedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('mindpulse_api_key')) || '';
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes,
        provider: options.provider || 'gemini',
        apiKey: options.apiKey || savedKey,
        customPrompt: options.customPrompt || ''
      }),
      signal
    });

    // Check race condition: Did a newer request get launched while this one was waiting?
    if (currentReqId !== latestRequestId) {
      console.warn(`[Race Condition Guard] Stale response discarded (Req #${currentReqId} < Latest #${latestRequestId})`);
      throw new DOMException('Stale request aborted by newer request', 'AbortError');
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `Server responded with status ${response.status}`);
    }

    const rawResponse = await response.json();
    return processAndValidateApiResponse(rawResponse, notes.slice(0, 30));
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.error(`[API Generation Error req #${currentReqId}]`, err);
    throw err;
  }
}

/**
 * Refine an existing study set with iterative instructions.
 */
export async function refineStudySet(currentData, instruction, options = {}) {
  if (activeAbortController) {
    activeAbortController.abort('New refinement initiated');
  }

  activeAbortController = new AbortController();
  const currentReqId = ++latestRequestId;
  const signal = options.signal || activeAbortController.signal;

  try {
    const savedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('mindpulse_api_key')) || '';
    const response = await fetch('/api/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentData,
        instruction,
        provider: options.provider || 'gemini',
        apiKey: options.apiKey || savedKey
      }),
      signal
    });

    if (currentReqId !== latestRequestId) {
      console.warn(`[Race Condition Guard] Stale refinement discarded (Req #${currentReqId} < Latest #${latestRequestId})`);
      throw new DOMException('Stale refinement aborted by newer request', 'AbortError');
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `Server responded with status ${response.status}`);
    }

    const rawResponse = await response.json();
    return processAndValidateApiResponse(rawResponse, currentData.topic);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.error(`[API Refinement Error req #${currentReqId}]`, err);
    throw err;
  }
}

/**
 * Trigger Chaos / Resilience Test for the evaluator
 */
export async function triggerChaosTest(testType) {
  const currentReqId = ++latestRequestId;
  const controller = new AbortController();
  
  // Set 8-second timeout for the chaos test
  const timeoutId = setTimeout(() => controller.abort('Chaos request timed out'), 8000);

  try {
    const response = await fetch('/api/chaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testType }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (currentReqId !== latestRequestId) {
      throw new DOMException('Stale chaos response discarded', 'AbortError');
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`[HTTP ${response.status}] ${errBody.message || errBody.error || 'Server error'}`);
    }

    const rawText = await response.text();
    // Parse response and run validation
    const parsedResult = extractAndParseJson(rawText);
    if (!parsedResult.success) {
      throw new Error(`Malformed JSON from model: ${parsedResult.error}`);
    }

    const validation = validateStudySet(parsedResult.data);
    if (!validation.success) {
      const errorMsg = validation.errors.map(e => `${e.path}: ${e.message}`).join(', ');
      throw new Error(`Schema Violation from model: ${errorMsg}`);
    }

    return validation.data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Common pipeline for extracting, parsing, and validating AI responses
 */
function processAndValidateApiResponse(rawResponse, fallbackTopic) {
  // If response is already an object or string
  let parsedObject = rawResponse;

  if (typeof rawResponse === 'string') {
    const parseResult = extractAndParseJson(rawResponse);
    if (!parseResult.success) {
      throw new Error(`Invalid JSON output: ${parseResult.error}`);
    }
    parsedObject = parseResult.data;
  }

  // Schema validation
  const validation = validateStudySet(parsedObject);
  if (validation.success) {
    return validation.data;
  }

  // Attempt self-healing normalization
  console.warn('[Schema Warning] Strict validation failed, attempting self-healing normalization:', validation.errors);
  try {
    const repaired = repairAndNormalizeStudySet(parsedObject, fallbackTopic);
    return repaired;
  } catch (repairErr) {
    const errorDetails = validation.errors.map(e => `${e.path}: ${e.message}`).join(', ');
    throw new Error(`AI generated invalid data structure: ${errorDetails}`);
  }
}

