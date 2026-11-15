export const SAMPLE_TOPICS = [
  {
    title: 'React Hooks & Lifecycle',
    icon: '⚡',
    description: 'Component lifecycle, hooks execution order, and memory leak prevention.',
    text: `React hooks allow functional components to maintain state and execute side effects. 
useState declares reactive state variables, triggering reconciliation when mutated via setter functions. 
useEffect handles synchronization with non-React systems like DOM manipulation, timers, and data fetching. The dependency array specifies reactive variables that trigger effect re-execution; omitting it causes execution on every render, while an empty array runs once on mount. Cleanups must be returned to prevent memory leaks.
useCallback memoizes function instances, and useMemo caches expensive calculated computations.
Rules of Hooks dictate calling hooks at the top level of functional components or custom hooks, never inside conditionals or loops.`
  },
  {
    title: 'Photosynthesis & Light Reactions',
    icon: '🌿',
    description: 'Light-dependent photolysis, electron transport chain, and Calvin cycle.',
    text: `Photosynthesis converts solar light energy into chemical energy stored in glucose.
It occurs in plant chloroplasts across two distinct stages: light-dependent reactions in thylakoid membranes, and the light-independent Calvin cycle in the stroma.
During light reactions, photolysis in Photosystem II splits water molecules into oxygen, protons, and electrons. The electron transport chain pumps protons into the thylakoid lumen, generating a proton gradient that drives ATP synthase to form ATP. High-energy electrons reduce NADP+ into NADPH.
In the Calvin cycle, the enzyme RuBisCO fixes atmospheric CO2 into 3-PGA, which ATP and NADPH reduce into G3P sugars.`
  },
  {
    title: 'Quantum Computing Principles',
    icon: '🔬',
    description: 'Superposition, entanglement, qubits, and quantum gate teleportation.',
    text: `Quantum computing leverages quantum mechanical principles to process computational data exponentially faster than classical computers for specialized problems.
The fundamental unit is the qubit, which can exist in a superposition of |0> and |1> states simultaneously.
Quantum entanglement creates non-local correlations between qubits such that measuring one instantaneously determines the state of the entangled partner regardless of distance.
Quantum interference amplifies probability amplitudes for correct answers while cancelling incorrect paths through unitary quantum gates (like Hadamard, CNOT, and Phase shift gates).
Primary challenges include quantum decoherence caused by thermal noise and quantum error correction thresholds.`
  },
  {
    title: 'Treaty of Versailles (1919)',
    icon: '📜',
    description: 'Post-WWI geopolitical restructuring, War Guilt clause, and League of Nations.',
    text: `The Treaty of Versailles signed in June 1919 formally ended World War I between Germany and the Allied Powers.
Negotiated primarily by the 'Big Three' (David Lloyd George of Britain, Georges Clemenceau of France, and Woodrow Wilson of the US), it imposed severe financial reparations and military limitations on Germany.
Article 231, known as the 'War Guilt Clause', assigned sole responsibility for initiating the conflict to Germany and its allies.
Germany surrendered Alsace-Lorraine to France, demilitarized the Rhineland, and surrendered overseas colonies.
Woodrow Wilson championed the creation of the League of Nations, though the US Senate ultimately rejected ratifying the treaty.`
  }
];

export const INITIAL_STUDY_SET = {
  topic: 'React Hooks & Lifecycle Architecture',
  difficulty: 'Intermediate',
  readTimeMinutes: 5,
  summary: `React Hooks enable stateful logic, synchronization, and memoization inside functional components. Understanding the dependency array semantics, closure captures, and cleanup phases is essential for writing bug-free, performant React applications without memory leaks.`,
  keyConcepts: [
    {
      id: 'c1',
      term: 'useState Hook',
      definition: 'Preserves component state across re-renders and provides a setter function that schedules UI updates.',
      category: 'Core Principle'
    },
    {
      id: 'c2',
      term: 'useEffect Hook',
      definition: 'Executes side effects after DOM paint, allowing data fetching, subscriptions, and DOM interactions.',
      category: 'Core Principle'
    },
    {
      id: 'c3',
      term: 'Effect Cleanup Phase',
      definition: 'A function returned by useEffect that runs prior to component unmount or before the effect re-runs.',
      category: 'Application'
    },
    {
      id: 'c4',
      term: 'Rules of Hooks',
      definition: 'Call hooks only at the top level of React functions; never invoke them inside conditionals, loops, or nested callbacks.',
      category: 'Core Principle'
    },
    {
      id: 'c5',
      term: 'useCallback vs useMemo',
      definition: 'useCallback memoizes function references, whereas useMemo memoizes the computed return value of a calculation.',
      category: 'Vocabulary'
    }
  ],
  flashcards: [
    {
      id: 'f1',
      question: 'What happens when useEffect is called without any dependency array?',
      answer: 'The effect runs after every single render cycle, potentially causing infinite re-render loops if state is updated inside.',
      hint: 'Think of unconditional execution'
    },
    {
      id: 'f2',
      question: 'Why must cleanup functions be returned in subscriptions or timers?',
      answer: 'To prevent memory leaks and dangling event listeners when components unmount or re-render.',
      hint: 'Prevents zombie listeners'
    },
    {
      id: 'f3',
      question: 'What does passing an updater callback to setState (e.g. setCount(c => c + 1)) solve?',
      answer: 'It avoids stale closures by ensuring access to the most recent queued state snapshot.',
      hint: 'Stale closure protection'
    },
    {
      id: 'f4',
      question: 'How do you tell useEffect to execute exclusively once when the component mounts?',
      answer: 'Pass an empty dependency array: [] as the second argument.',
      hint: 'Empty array brackets'
    },
    {
      id: 'f5',
      question: 'Can you call a React Hook inside an ordinary helper function?',
      answer: 'No, hooks can only be called inside React functional components or custom hooks prefixed with "use".',
      hint: 'Top level rule'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Which argument array guarantees an effect runs only on mount and cleans up on unmount?',
      options: ['No array provided', 'An empty array []', 'An array containing all component props', 'An array with null'],
      correctAnswerIndex: 1,
      explanation: 'An empty dependency array [] indicates that the effect has no dependencies on reactive state or props, so it only runs once after initial mount.'
    },
    {
      id: 'q2',
      question: 'What is the primary danger of violating the Rules of Hooks by placing useState inside an if-statement?',
      options: [
        'React relies on stable call order between renders to match state variables to internal fiber nodes.',
        'It causes CSS styles to fail rendering.',
        'It converts the browser DOM into SVG elements.',
        'It causes immediate JavaScript garbage collection of parent components.'
      ],
      correctAnswerIndex: 0,
      explanation: 'React tracks hook state by call index in a linked list. Changing call order causes state pointers to become desynchronized.'
    },
    {
      id: 'q3',
      question: 'When should you choose useMemo over standard inline variable calculation?',
      options: [
        'For every single primitive variable in your component.',
        'Only when the calculation is demonstrably expensive or used as a reference equality dependency.',
        'When you want to replace CSS stylesheets.',
        'Whenever you make an asynchronous fetch call.'
      ],
      correctAnswerIndex: 1,
      explanation: 'useMemo introduces memory and comparison overhead; it is only beneficial for computationally heavy operations or preventing referential inequality rerenders.'
    }
  ]
};

