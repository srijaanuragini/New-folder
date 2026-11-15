import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation.
 * Enhances accessibility and power-user study efficiency.
 */
export function useKeyboardNav({
  activeTab,
  onFlipCard,
  onNextCard,
  onPrevCard,
  onSelectQuizOption,
  quizOptionCount = 4,
  isEnabled = true,
}) {
  useEffect(() => {
    if (!isEnabled) return;

    function handleKeyDown(e) {
      // Don't intercept when user is typing in textarea or input
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      // Flashcards Deck Navigation
      if (activeTab === 'flashcards') {
        if (e.code === 'Space') {
          e.preventDefault();
          onFlipCard?.();
        } else if (e.code === 'ArrowRight' || e.key === 'l') {
          e.preventDefault();
          onNextCard?.();
        } else if (e.code === 'ArrowLeft' || e.key === 'h') {
          e.preventDefault();
          onPrevCard?.();
        }
      }

      // Quiz Navigation: Keys '1', '2', '3', '4' select options
      if (activeTab === 'quiz') {
        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= quizOptionCount) {
          e.preventDefault();
          onSelectQuizOption?.(keyNum - 1);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onFlipCard, onNextCard, onPrevCard, onSelectQuizOption, quizOptionCount, isEnabled]);
}

