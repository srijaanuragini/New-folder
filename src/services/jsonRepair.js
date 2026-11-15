/**
 * Robust JSON extraction and repair engine.
 * Solves real-world LLM output quirks:
 * - Markdown fences (```json ... ```)
 * - Conversational preambles ("Here is the requested study set:")
 * - Conversational postscripts ("Hope this helps your exam preparation!")
 * - Trailing commas in arrays and objects
 * - Truncated/unclosed brackets or quotes
 */

export function extractAndParseJson(rawInput) {
  if (!rawInput) {
    return {
      success: false,
      error: 'Empty response received from the AI model.',
      errorType: 'empty',
      raw: ''
    };
  }

  let text = typeof rawInput === 'string' ? rawInput.trim() : JSON.stringify(rawInput);

  // 1. Remove markdown fences ```json ... ```
  if (text.includes('```')) {
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      text = fenceMatch[1].trim();
    } else {
      text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    }
  }

  // 2. Find the outermost JSON curly braces if conversational text surrounds it
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  // 3. Attempt direct native parse first
  try {
    const parsed = JSON.parse(text);
    return { success: true, data: parsed, raw: text };
  } catch (initialErr) {
    // 4. Heuristic repair attempt
    const repairedText = attemptJsonRepair(text);
    try {
      const repairedParsed = JSON.parse(repairedText);
      return { success: true, data: repairedParsed, raw: text, wasRepaired: true };
    } catch (secondErr) {
      return {
        success: false,
        error: `Malformed JSON: ${initialErr.message}`,
        errorType: 'syntax',
        raw: text,
      };
    }
  }
}

/**
 * Heuristic repair for common model JSON truncation & formatting issues
 */
function attemptJsonRepair(str) {
  let cleaned = str;

  // Remove trailing commas before closing brackets or braces
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Fix unquoted property names: { foo: "bar" } -> { "foo": "bar" }
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // Count open vs close braces and brackets
  let openBraces = (cleaned.match(/\{/g) || []).length;
  let closeBraces = (cleaned.match(/\}/g) || []).length;
  let openBrackets = (cleaned.match(/\[/g) || []).length;
  let closeBrackets = (cleaned.match(/\]/g) || []).length;

  // Append missing closing brackets/braces if truncated
  while (openBrackets > closeBrackets) {
    cleaned += ']';
    closeBrackets++;
  }
  while (openBraces > closeBraces) {
    cleaned += '}';
    closeBraces++;
  }

  return cleaned;
}

