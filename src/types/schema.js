import { z } from 'zod';

// Zod Schema for Key Concept
export const KeyConceptSchema = z.object({
  id: z.string().default(() => `c_${Math.random().toString(36).substring(2, 9)}`),
  term: z.string().min(1, 'Term name is required'),
  definition: z.string().min(1, 'Definition is required'),
  category: z.enum(['Core Principle', 'Formula', 'Vocabulary', 'Application']).catch('Core Principle'),
});

// Zod Schema for Flashcard
export const FlashcardSchema = z.object({
  id: z.string().default(() => `f_${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().min(1, 'Question cannot be empty'),
  answer: z.string().min(1, 'Answer cannot be empty'),
  hint: z.string().optional().default(''),
});

// Zod Schema for Multiple Choice Quiz Question
export const QuizQuestionSchema = z.object({
  id: z.string().default(() => `q_${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().min(1, 'Quiz question cannot be empty'),
  options: z.array(z.string()).min(2, 'Must have at least 2 options'),
  correctAnswerIndex: z.number().int().min(0).max(10).default(0),
  explanation: z.string().default('Review your notes on this topic.'),
});

// Primary Schema for the full study set
export const StudySetSchema = z.object({
  topic: z.string().min(1, 'Topic title is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).catch('Intermediate'),
  readTimeMinutes: z.number().positive().default(4),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  keyConcepts: z.array(KeyConceptSchema).min(1, 'At least one key concept is required'),
  flashcards: z.array(FlashcardSchema).min(1, 'At least one flashcard is required'),
  quiz: z.array(QuizQuestionSchema).min(1, 'At least one quiz question is required'),
});

/**
 * Validates a study set against the strict Zod schema.
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateStudySet(rawData) {
  const result = StudySetSchema.safeParse(rawData);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorDetails = result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return { success: false, errors: errorDetails, zodError: result.error };
  }
}

/**
 * Self-healing repair function:
 * If an AI response has minor schema deviations (e.g., missing IDs, missing optional fields,
 * or options is an object instead of array), this function sanitizes and recovers the data
 * gracefully instead of abruptly failing.
 */
export function repairAndNormalizeStudySet(data, fallbackTopic = 'Study Topic') {
  if (!data || typeof data !== 'object') {
    throw new Error('Data is not a valid object');
  }

  const sanitized = {
    topic: typeof data.topic === 'string' && data.topic.trim() ? data.topic.trim() : fallbackTopic,
    difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(data.difficulty) ? data.difficulty : 'Intermediate',
    readTimeMinutes: typeof data.readTimeMinutes === 'number' && data.readTimeMinutes > 0 ? Math.round(data.readTimeMinutes) : 4,
    summary: typeof data.summary === 'string' && data.summary.trim() ? data.summary.trim() : 'Summary overview of the provided study material.',
    keyConcepts: [],
    flashcards: [],
    quiz: []
  };

  // Normalize key concepts
  if (Array.isArray(data.keyConcepts)) {
    sanitized.keyConcepts = data.keyConcepts.map((item, idx) => ({
      id: item?.id || `c_${idx + 1}`,
      term: typeof item?.term === 'string' ? item.term : `Concept ${idx + 1}`,
      definition: typeof item?.definition === 'string' ? item.definition : 'Definition unavailable.',
      category: ['Core Principle', 'Formula', 'Vocabulary', 'Application'].includes(item?.category) ? item.category : 'Core Principle'
    }));
  }

  // Normalize flashcards
  if (Array.isArray(data.flashcards)) {
    sanitized.flashcards = data.flashcards.map((item, idx) => ({
      id: item?.id || `f_${idx + 1}`,
      question: typeof item?.question === 'string' ? item.question : `Key Question ${idx + 1}`,
      answer: typeof item?.answer === 'string' ? item.answer : 'Answer not provided.',
      hint: typeof item?.hint === 'string' ? item.hint : ''
    }));
  }

  // Normalize quiz
  if (Array.isArray(data.quiz)) {
    sanitized.quiz = data.quiz.map((item, idx) => {
      let options = Array.isArray(item?.options) ? item.options : ['True', 'False'];
      if (options.length < 2) options = ['Option A', 'Option B'];
      
      let correctIdx = typeof item?.correctAnswerIndex === 'number' ? item.correctAnswerIndex : 0;
      if (correctIdx < 0 || correctIdx >= options.length) correctIdx = 0;

      return {
        id: item?.id || `q_${idx + 1}`,
        question: typeof item?.question === 'string' ? item.question : `Diagnostic Question ${idx + 1}`,
        options: options.map(opt => String(opt)),
        correctAnswerIndex: correctIdx,
        explanation: typeof item?.explanation === 'string' ? item.explanation : 'Correct answer verified against syllabus.'
      };
    });
  }

  // Fallback defaults if arrays ended up empty
  if (sanitized.keyConcepts.length === 0) {
    sanitized.keyConcepts.push({
      id: 'c_def',
      term: 'Primary Concept',
      definition: 'Foundational pillar extracted from the input text.',
      category: 'Core Principle'
    });
  }

  if (sanitized.flashcards.length === 0) {
    sanitized.flashcards.push({
      id: 'f_def',
      question: 'What is the main subject covered in this material?',
      answer: sanitized.summary.slice(0, 100),
      hint: 'Refer to the executive summary'
    });
  }

  if (sanitized.quiz.length === 0) {
    sanitized.quiz.push({
      id: 'q_def',
      question: 'Is this concept applicable to modern problem-solving?',
      options: ['Yes, highly relevant', 'No, completely obsolete', 'Only in historical context', 'Not applicable'],
      correctAnswerIndex: 0,
      explanation: 'The principles covered remain a vital component of foundational study.'
    });
  }

  return sanitized;
}

