import React, { useState } from 'react';
import { Header } from './components/Header.jsx';
import { InputSection } from './components/InputSection.jsx';
import { LoadingSkeleton } from './components/LoadingSkeleton.jsx';
import { ErrorState } from './components/ErrorState.jsx';
import { RefinementBar } from './components/RefinementBar.jsx';
import { SessionDrawer } from './components/SessionDrawer.jsx';
import { ChaosModal } from './components/ChaosModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { SummaryCard } from './components/blocks/SummaryCard.jsx';
import { FlashcardsDeck } from './components/blocks/FlashcardsDeck.jsx';
import { QuizView } from './components/blocks/QuizView.jsx';
import { ConceptList } from './components/blocks/ConceptList.jsx';
import { useStudySession } from './hooks/useStudySession.js';
import { useTheme } from './hooks/useTheme.js';
import { useKeyboardNav } from './hooks/useKeyboardNav.js';
import { INITIAL_STUDY_SET } from './utils/sampleData.js';
import { BookOpen, Layers, HelpCircle, CheckSquare, Sparkles } from 'lucide-react';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [provider, setProvider] = useState('auto');
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [isChaosModalOpen, setIsChaosModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const {
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
    importSessionFromJson,
  } = useStudySession();

  // Active keyboard navigation
  useKeyboardNav({
    activeTab,
    onFlipCard: flipCard,
    onNextCard: nextCard,
    onPrevCard: prevCard,
    onSelectQuizOption: handleSelectQuizOption,
    quizOptionCount: 4,
    isEnabled: !isChaosModalOpen && !isSettingsModalOpen && !isSessionDrawerOpen,
  });

  // Calculate quick stats
  let quizScore = null;
  const quizQuestions = studySet?.quiz || [];
  if (isQuizSubmitted && quizQuestions.length > 0) {
    quizScore = quizQuestions.filter(q => quizAnswers[q.id] === q.correctAnswerIndex).length;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navigation */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenSessions={() => setIsSessionDrawerOpen(true)}
        onOpenChaos={() => setIsChaosModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        sessionCount={sessions.length}
        currentTopic={studySet?.topic}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Step 1: Free-form Input Area */}
        <InputSection
          onGenerate={generate}
          isLoading={status === 'loading'}
          provider={provider}
          setProvider={setProvider}
        />

        {/* Error Boundary / Exception Handled Notification */}
        {status === 'error' && (
          <ErrorState
            error={error}
            onRetry={retryLastAction}
            onUseFallback={() => {
              loadSession('initial');
            }}
          />
        )}

        {/* Loading State / Skeleton */}
        {status === 'loading' && <LoadingSkeleton />}

        {/* Main Content Workspace (Rendered if not loading) */}
        {status !== 'loading' && studySet && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Interactive Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Overview & Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'flashcards'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Flashcards Deck</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800">
                  {studySet.flashcards?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Diagnostic Quiz</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800">
                  {studySet.quiz?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('concepts')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'concepts'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Concept Checklist</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800">
                  {studySet.keyConcepts?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SummaryCard
                  studySet={studySet}
                  masteredCardsCount={masteredCardIds.size}
                  quizScore={quizScore}
                  totalQuizQuestions={quizQuestions.length}
                  masteredConceptsCount={masteredConceptIds.size}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Flashcards preview */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        Flashcard Highlights
                      </h3>
                      <button
                        onClick={() => setActiveTab('flashcards')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Launch Deck →
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Flip through {studySet.flashcards?.length || 0} cards with 3D animation, mnemonic hints, and active recall tracking.
                    </p>
                  </div>

                  {/* Quick Quiz preview */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        Practice Quiz & Re-test
                      </h3>
                      <button
                        onClick={() => setActiveTab('quiz')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Start Quiz →
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Test comprehension with multiple-choice questions, live scoring, and focused re-testing for wrong answers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'flashcards' && (
              <FlashcardsDeck
                flashcards={visibleCards}
                currentIndex={currentCardIndex}
                isFlipped={isCardFlipped}
                onFlip={flipCard}
                onNext={nextCard}
                onPrev={prevCard}
                masteredIds={masteredCardIds}
                onToggleMastery={toggleCardMastery}
                showNeedsReviewOnly={showNeedsReviewOnly}
                onToggleFilter={() => setShowNeedsReviewOnly(!showNeedsReviewOnly)}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizView
                quiz={studySet.quiz}
                answers={quizAnswers}
                onAnswer={answerQuizQuestion}
                isSubmitted={isQuizSubmitted}
                onSubmit={submitQuiz}
                onReset={resetQuiz}
                isRetestMode={isRetestMode}
                onStartRetest={startRetest}
                retestQuestionIds={retestQuestionIds}
              />
            )}

            {activeTab === 'concepts' && (
              <ConceptList
                keyConcepts={studySet.keyConcepts}
                masteredIds={masteredConceptIds}
                onToggleMastery={toggleConceptMastery}
              />
            )}

            {/* Stretch Goal 3: Refinement Loop */}
            <RefinementBar
              onRefine={refine}
              isRefining={status === 'refining'}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>MindPulse AI</strong> — Frontend Internship Assignment Submission
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Secure Backend Gateway</span>
            <span>•</span>
            <span>Zod Schema Validation</span>
            <span>•</span>
            <span>Race Condition Guards</span>
          </div>
        </div>
      </footer>

      {/* Slide-over Drawers & Modals */}
      <SessionDrawer
        isOpen={isSessionDrawerOpen}
        onClose={() => setIsSessionDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onLoadSession={(id) => {
          loadSession(id);
          setIsSessionDrawerOpen(false);
        }}
        onDeleteSession={deleteSession}
        onExportSession={exportCurrentSession}
        onImportSession={(json) => {
          importSessionFromJson(json);
          setIsSessionDrawerOpen(false);
        }}
      />

      <ChaosModal
        isOpen={isChaosModalOpen}
        onClose={() => setIsChaosModalOpen(false)}
        onRunChaosTest={runChaosTest}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        provider={provider}
        setProvider={setProvider}
      />
    </div>
  );
}

