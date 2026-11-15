/**
 * MindPulse AI - Automated Resilience & Schema Verification Suite
 * Run with: node scripts/test-resilience.js
 */

import { extractAndParseJson } from '../src/services/jsonRepair.js';
import { validateStudySet, repairAndNormalizeStudySet } from '../src/types/schema.js';

console.log('====================================================');
console.log('⚡ MindPulse AI - Resilience & Fault Tolerance Tests');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failCount++;
  }
}

// TEST 1: Stripping Markdown Code Fences
const test1Raw = '```json\n{"topic": "Physics 101", "difficulty": "Beginner", "readTimeMinutes": 3, "summary": "An introduction to kinematics and force vectors.", "keyConcepts": [{"id": "c1", "term": "Velocity", "definition": "Rate of change of displacement.", "category": "Core Principle"}], "flashcards": [{"id": "f1", "question": "What is acceleration?", "answer": "Rate of change of velocity."}], "quiz": [{"id": "q1", "question": "What is unit of force?", "options": ["Newton", "Joule"], "correctAnswerIndex": 0, "explanation": "Force is measured in Newtons."}]}\n```';
const parsed1 = extractAndParseJson(test1Raw);
assert(parsed1.success === true, 'Extract JSON from markdown code fences');
assert(parsed1.data.topic === 'Physics 101', 'Correct topic extracted');

// TEST 2: Handling conversational preambles and postscripts
const test2Raw = 'Here is your structured study set:\n{"topic": "Biology", "difficulty": "Intermediate", "readTimeMinutes": 4, "summary": "Cell division and mitosis phases.", "keyConcepts": [{"id": "c1", "term": "Mitosis", "definition": "A type of cell division.", "category": "Core Principle"}], "flashcards": [{"id": "f1", "question": "What is prophase?", "answer": "Chromosomes condense."}], "quiz": [{"id": "q1", "question": "Which phase follows metaphase?", "options": ["Anaphase", "Telophase"], "correctAnswerIndex": 0, "explanation": "Anaphase separates chromatids."}]}\nHope this helps your exam!';
const parsed2 = extractAndParseJson(test2Raw);
assert(parsed2.success === true, 'Isolate JSON from conversational text surrounding it');

// TEST 3: Repairing trailing commas
const test3Raw = '{"topic": "Chemistry", "difficulty": "Advanced", "readTimeMinutes": 5, "summary": "Thermodynamics and enthalpy changes.", "keyConcepts": [{"id": "c1", "term": "Enthalpy", "definition": "Total heat content.", "category": "Core Principle",},], "flashcards": [{"id": "f1", "question": "What is exothermic?", "answer": "Releases heat.",},], "quiz": [{"id": "q1", "question": "Is combustion exothermic?", "options": ["Yes", "No",], "correctAnswerIndex": 0, "explanation": "Combustion releases heat.",},],}';
const parsed3 = extractAndParseJson(test3Raw);
assert(parsed3.success === true, 'Heuristically repair trailing commas in objects and arrays');

// TEST 4: Zod Schema Rejection on Invalid Types
const invalidShape = {
  topic: 9999, // Should be string
  difficulty: "ImpossibleDifficulty", // Invalid enum
  summary: "Too short", // Min 10 chars
  keyConcepts: "not an array",
  flashcards: [],
  quiz: []
};
const valResult = validateStudySet(invalidShape);
assert(valResult.success === false, 'Zod catches invalid shape and rejects without crashing');
assert(valResult.errors.length > 0, 'Detailed validation error paths provided');

// TEST 5: Self-Healing Normalization
const repaired = repairAndNormalizeStudySet(invalidShape, 'Fallback Chemistry');
assert(repaired.topic === 'Fallback Chemistry', 'Self-healing provides valid fallback topic');
assert(repaired.difficulty === 'Intermediate', 'Self-healing normalizes invalid difficulty enum');
assert(Array.isArray(repaired.keyConcepts) && repaired.keyConcepts.length > 0, 'Self-healing ensures keyConcepts array is populated');
assert(Array.isArray(repaired.flashcards) && repaired.flashcards.length > 0, 'Self-healing ensures flashcards array is populated');
assert(Array.isArray(repaired.quiz) && repaired.quiz.length > 0, 'Self-healing ensures quiz array is populated');

console.log('\n====================================================');
console.log(`Summary: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================\n');

