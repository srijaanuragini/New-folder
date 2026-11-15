import { useState, useEffect, useCallback, useRef } from 'react';
import { generateStudySet, refineStudySet, triggerChaosTest } from '../services/api.js';
import { INITIAL_STUDY_SET } from '../utils/sampleData.js';

const STORAGE_KEY = 'mindpulse_sessions_v1';
const ACTIVE_SESSION_KEY = 'mindpulse_active_id';

export function useStudySession() {
  const [studySet, setStudySet] = useState(INITIAL_STUDY_SET);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'refining' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'flashcards' | 'quiz' | 'concepts'
  
  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredCardIds, setMasteredCardIds] = useState(() => new Set());
  const [showNeedsReviewOnly, setShowNeedsReviewOnly] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);
  const [retestQuestionIds, setRetestQuestionIds] = useState([]);

  // Concept checklist state
  const [masteredConceptIds, setMasteredConceptIds] = useState(() => new Set());

  // Saved sessions collection
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
  });

  // Track last attempted action for 1-click retry
  const lastActionRef = useRef(null);

  // Save sessions to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to persist sessions to localStorage', e);
    }
  }, [sessions]);

  // Generate new study set
  const generate = useCallback(async (notes, options = {}) => {
    if (!notes || !notes.trim()) return;

    setStatus('loading');
    setError(null);
    lastActionRef.current = { type: 'generate', notes, options };

    try {
      const result = await generateStudySet(notes, options);
      setStudySet(result);
      setStatus('success');
      
      // Reset interactive state for the new set
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      setMasteredCardIds(new Set());
      setQuizAnswers({});
      setIsQuizSubmitted(false);
      setIsRetestMode(false);
      setRetestQuestionIds([]);
      setMasteredConceptIds(new Set());

      // Auto-save new session
      const newSession = {
        id: `sess_${Date.now()}`,
        topic: result.topic,
        createdAt: new Date().toISOString(),
        data: result,
      };
      setSessions(prev => [newSession, ...prev.slice(0, 19)]); // keep latest 20
      setActiveSessionId(newSession.id);
      localStorage.setItem(ACTIVE_SESSION_KEY, newSession.id);
    } catch (err) {
      if (err.name === 'AbortError') return; // Request was cleanly cancelled by newer action
      setStatus('error');
      setError({
        message: err.message || 'An error occurred while generating study set.',
        raw: err.rawResponse || '',
        type: err.message.includes('JSON') ? 'json' : err.message.includes('Schema') ? 'schema' : 'network'
      });
    }
  }, []);

  // Refine existing study set (Stretch Goal 3: Follow-up prompt loop)
  const refine = useCallback(async (instruction, options = {}) => {
    if (!instruction || !instruction.trim() || !studySet) return;

    setStatus('refining');
    setError(null);
    lastActionRef.current = { type: 'refine', instruction, options };

    try {
      const updated = await refineStudySet(studySet, instruction, options);
      setStudySet(updated);
      setStatus('success');

      // Update current session in storage
      if (activeSessionId) {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, topic: updated.topic, data: updated } : s));
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setError({
        message: err.message || 'Failed to refine study set.',
        raw: '',
        type: 'refine'
      });
    }
  }, [studySet, activeSessionId]);

  // Retry the last failed action
  const retryLastAction = useCallback(() => {
    if (!lastActionRef.current) return;
    if (lastActionRef.current.type === 'generate') {
      generate(lastActionRef.current.notes, lastActionRef.current.options);
    } else if (lastActionRef.current.type === 'refine') {
      refine(lastActionRef.current.instruction, lastActionRef.current.options);
    }
  }, [generate, refine]);

  // Run chaos / error handling stress tests
  const runChaosTest = useCallback(async (testType) => {
    setStatus('loading');
    setError(null);
    try {
      const result = await triggerChaosTest(testType);
      setStudySet(result);
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setError({
        message: err.message || 'Chaos test error triggered.',
        raw: err.message,
        type: testType
      });
    }
  }, []);

  // Flashcard controls
  const visibleCards = showNeedsReviewOnly 
    ? (studySet?.flashcards || []).filter(c => !masteredCardIds.has(c.id))
    : (studySet?.flashcards || []);

  const flipCard = useCallback(() => {
    setIsCardFlipped(prev => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (visibleCards.length === 0) return;
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % visibleCards.length);
  }, [visibleCards.length]);

  const prevCard = useCallback(() => {
    if (visibleCards.length === 0) return;
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + visibleCards.length) % visibleCards.length);
  }, [visibleCards.length]);

  const toggleCardMastery = useCallback((cardId) => {
    setMasteredCardIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  // Quiz controls
  const handleSelectQuizOption = useCallback((optionIndex) => {
    if (isQuizSubmitted) return;
    const currentQuestions = isRetestMode
      ? (studySet?.quiz || []).filter(q => retestQuestionIds.includes(q.id))
      : (studySet?.quiz || []);
    
    const activeQ = currentQuestions[currentCardIndex];
    if (activeQ) {
      setQuizAnswers(prev => ({ ...prev, [activeQ.id]: optionIndex }));
    }
  }, [isQuizSubmitted, isRetestMode, studySet, retestQuestionIds, currentCardIndex]);

  const answerQuizQuestion = useCallback((questionId, optionIndex) => {
    if (isQuizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, [isQuizSubmitted]);

  const submitQuiz = useCallback(() => {
    setIsQuizSubmitted(true);
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setIsRetestMode(false);
    setRetestQuestionIds([]);
  }, []);

  // Re-test wrong answers (Core Requirement!)
  const startRetest = useCallback(() => {
    const wrongIds = (studySet?.quiz || [])
      .filter(q => quizAnswers[q.id] !== q.correctAnswerIndex)
      .map(q => q.id);

    if (wrongIds.length === 0) return;

    setRetestQuestionIds(wrongIds);
    setIsRetestMode(true);
    setIsQuizSubmitted(false);
    // Clear answers for missed questions only
    setQuizAnswers(prev => {
      const next = { ...prev };
      wrongIds.forEach(id => delete next[id]);
      return next;
    });
  }, [studySet, quizAnswers]);

  // Concept checklist toggle
  const toggleConceptMastery = useCallback((conceptId) => {
    setMasteredConceptIds(prev => {
      const next = new Set(prev);
      if (next.has(conceptId)) {
        next.delete(conceptId);
      } else {
        next.add(conceptId);
      }
      return next;
    });
  }, []);

  // Session switching & persistence (Stretch Goal 4)
  const loadSession = useCallback((sessionId) => {
    const target = sessions.find(s => s.id === sessionId);
    if (target && target.data) {
      setStudySet(target.data);
      setActiveSessionId(target.id);
      localStorage.setItem(ACTIVE_SESSION_KEY, target.id);
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      setMasteredCardIds(new Set());
      setQuizAnswers({});
      setIsQuizSubmitted(false);
      setIsRetestMode(false);
      setMasteredConceptIds(new Set());
      setError(null);
      setStatus('success');
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, [activeSessionId]);

  const exportCurrentSession = useCallback(() => {
    if (!studySet) return;
    const blob = new Blob([JSON.stringify(studySet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studySet.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_set.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [studySet]);

  const importSessionFromJson = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      setStudySet(parsed);
      const newSession = {
        id: `sess_${Date.now()}`,
        topic: parsed.topic || 'Imported Study Set',
        createdAt: new Date().toISOString(),
        data: parsed,
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setStatus('success');
    } catch (e) {
      setError({ message: 'Failed to import JSON: Invalid format.', type: 'import' });
    }
  }, []);

  return {
    studySet,
    status,
    error,
    activeTab,
    setActiveTab,
    generate,
    refine,
    retryLastAction,
    runChaosTest,
    // Flashcard deck
    currentCardIndex,
    setCurrentCardIndex,
    isCardFlipped,
    flipCard,
    nextCard,
    prevCard,
    masteredCardIds,
    toggleCardMastery,
    showNeedsReviewOnly,
    setShowNeedsReviewOnly,
    visibleCards,
    // Quiz
    quizAnswers,
    answerQuizQuestion,
    handleSelectQuizOption,
    submitQuiz,
    resetQuiz,
    isQuizSubmitted,
    isRetestMode,
    startRetest,
    retestQuestionIds,
    // Concept checklist
    masteredConceptIds,
    toggleConceptMastery,
    // Sessions
    sessions,
    activeSessionId,
    loadSession,
    deleteSession,
    exportCurrentSession,
    importSessionFromJson
  };
}

