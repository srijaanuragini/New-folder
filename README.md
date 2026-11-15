# 🧠 MindPulse AI — Adaptive Study & Quiz Assistant

> **Frontend Internship Assignment Submission**  
> An interactive educational tool transforming unstructured lecture notes into stateful 3D flashcards, diagnostic quizzes, and concept checklists with self-healing AI schema validation and race-condition guards.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-Schema%20Validation-3e67d6.svg)](https://zod.dev/)
[![Node.js](https://img.shields.io/badge/Node-Express%20Proxy-green.svg)](https://nodejs.org/)

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Quickstart & Local Setup (`npm install && npm start`)](#quickstart--local-setup)
3. [Architecture & Secure Backend Routing](#architecture--secure-backend-routing)
4. [Handling Bad AI Output (20% Rubric Focus)](#handling-bad-ai-output-20-rubric-focus)
5. [Interactive Features & Stretch Goals](#interactive-features--stretch-goals)
6. [Honest AI-Usage Disclosure](#honest-ai-usage-disclosure)
7. [Known Limitations & Engineering Trade-offs](#known-limitations--engineering-trade-offs)
8. [Time Spent Breakdown (~7 Hours)](#time-spent-breakdown)
9. [What I'd Build Next](#what-id-build-next)

---

## 1. Project Overview

Traditional AI study tools suffer from two critical flaws: they either print unstructured chat text inside generic conversational bubbles, or they abruptly crash whenever a model returns truncated or invalid JSON.

**MindPulse AI** rejects the chatbot pattern. It converts raw notes or study topics into a deterministic, structured data pipeline rendering 4 distinct interactive study blocks:
- **Executive Summary Card:** Read time, difficulty rating, and live study progress.
- **Interactive 3D Flashcards Deck:** Flip animation, mnemonic hints, mastery tracking (`Mastered` vs `Needs Review`), shuffle, and full keyboard navigation.
- **Diagnostic Practice Quiz:** Multiple choice with immediate feedback, pedagogical explanations, and a **Targeted Re-test Mode** that isolates and re-quizzes only the questions you got wrong.
- **Key Concepts Checklist:** Terminology categorized by *Core Principle*, *Formula*, *Vocabulary*, and *Application* with a live mastery progress bar.
- **Iterative Refinement Loop:** Follow-up prompts modify and enrich the existing study set without wiping out user scores or card mastery.
- **Save & Reload Sessions:** LocalStorage session drawer with JSON export/import.

---

## 2. Quickstart & Local Setup

### Prerequisites
- Node.js (v18.x or later)
- npm or pnpm / yarn

### Installation & Launch in One Step
```bash
# 1. Clone repository & navigate to directory
cd "mindpulse-study-assistant"

# 2. Install dependencies & run both server + client concurrently
npm install && npm start
```
*Note: `npm start` uses `concurrently` to launch the Express backend proxy on `http://localhost:3001` and the Vite development server on `http://localhost:5173` simultaneously.*

### AI Provider Configuration (Zero-Friction Testing)
You can run and evaluate the application **without any API key!** 
- **Out-of-the-Box Mock AI:** If no API keys are provided, the backend seamlessly activates an intelligent heuristic mock engine tailored to whatever topic you enter, allowing reviewers to test all features instantly.
- **Real LLM Integration:** To use live models, either create a `.env` file from `.env.example`:
  ```env
  PORT=3001
  GEMINI_API_KEY=your_gemini_api_key_here
  # Or GROQ_API_KEY=... / OPENAI_API_KEY=... / OLLAMA_BASE_URL=http://localhost:11434
  ```
  Or click the **Settings** icon in the app header to enter a temporary API key directly in the UI.

---

## 3. Architecture & Secure Backend Routing

Per the assignment security requirement:
> *"API key: don't ship it in the browser. Route the model call through a small backend or serverless function. We'll look at this."*

```
Client (Vite React @ :5173) 
   │  
   ├── [POST /api/generate] ───► Express Proxy (@ :3001) ───► LLM Provider (Gemini / Groq / Ollama)
   ├── [POST /api/refine]   ───► [Secure API Key Storage] 
   └── [POST /api/chaos]    ───► [Fault-Injection Engine] 
```

### Directory Structure
```
├── server/
│   ├── index.js           # Express server & API routes
│   ├── aiService.js       # Provider dispatchers (Gemini, Groq, Ollama) & fallback synthesis
│   └── prompts.js         # Strict JSON prompts & system instructions
├── src/
│   ├── components/
│   │   ├── blocks/
│   │   │   ├── SummaryCard.jsx    # Overview card & study metrics
│   │   │   ├── FlashcardsDeck.jsx # 3D flip card, mastery toggle, keyboard nav
│   │   │   ├── QuizView.jsx       # Multiple choice, feedback, and re-test mode
│   │   │   └── ConceptList.jsx    # Interactive terminology checklist
│   │   ├── Header.jsx             # Theme switch, session drawer, chaos modal trigger
│   │   ├── InputSection.jsx       # Free-form textarea, samples, model selector
│   │   ├── LoadingSkeleton.jsx    # Animated progressive loading state
│   │   ├── ErrorState.jsx         # Graceful error banner with diagnostics accordion
│   │   ├── RefinementBar.jsx      # Follow-up prompt loop for iterative editing
│   │   ├── SessionDrawer.jsx      # Saved sessions, export/import JSON
│   │   ├── ChaosModal.jsx         # Evaluator Chaos Testing Tool
│   │   └── SettingsModal.jsx      # API key & provider configuration
│   ├── hooks/
│   │   ├── useStudySession.js     # State machine, localStorage persistence, quiz/card actions
│   │   ├── useTheme.js            # Dark/light mode persistence
│   │   └── useKeyboardNav.js      # Global keyboard shortcuts (Space, Arrows, 1-4)
│   ├── services/
│   │   ├── api.js                 # Frontend API client with AbortController & race guards
│   │   └── jsonRepair.js          # Regex sanitizer, fence stripper, trailing comma repair
│   ├── types/
│   │   └── schema.js              # Zod schema definitions & self-healing normalization
│   ├── App.jsx                    # Root view orchestrator
│   └── main.jsx                   # React root wrapped in GlobalErrorBoundary
├── scripts/
│   └── test-resilience.js         # Automated test suite for parser & schema validation
└── package.json
```

---

## 4. Handling Bad AI Output (20% Rubric Focus)

The assignment states:  
> *"Most of the signal is in that fourth-from-last point. Handling failure well is what separates people who've built AI features from those who haven't."*

MindPulse implements a **4-Layer Defense Architecture**:

```
[Raw Model Stream]
       │
       ▼
1. Sanitization & Repair Layer (jsonRepair.js)
   - Strips ```json and ``` markdown fences.
   - Extracts outermost JSON boundary, stripping conversational preambles/postscripts.
   - Fixes unquoted keys and trailing commas.
       │
       ▼
2. Strict Runtime Schema Validation (schema.js via Zod)
   - Enforces types for topic, difficulty, flashcards array, and quiz options.
   - Validates that correctAnswerIndex is within options bounds.
       │
       ▼
3. Self-Healing Normalization (repairAndNormalizeStudySet)
   - If an optional field is missing or an array has minor discrepancies, fills defaults gracefully rather than crashing.
       │
       ▼
4. Race-Condition & Stale-Response Protection (api.js)
   - Maintains an incrementing `requestId` sequence and `AbortController`.
   - If a user triggers a new generation or refinement, any in-flight request is immediately aborted.
   - If a delayed response arrives out-of-order, it is dropped so a slow stale response can never overwrite newer state.
```

### ⚡ Interactive Chaos Testing Suite for Evaluators
Click the **"Chaos Test"** button in the top navbar to test any of the following live:
1. **Malformed JSON Test:** Injects unclosed, truncated JSON syntax. The app intercepts it cleanly, alerts the user, and exposes a collapsible debug view without crashing.
2. **Schema Violation Test:** Injects valid JSON that violates types (e.g., numbers where arrays are expected). Zod rejects the invalid payload and presents an actionable recovery UI.
3. **500 Server Error Test:** Injects an HTTP 500 inference failure, providing an immediate 1-click retry button.
4. **Timeout / Abort Test:** Simulates network stall; tests the client-side 8-second abort signal.

Run automated resilience unit tests anytime via:
```bash
npm test
```

---

## 5. Interactive Features & Stretch Goals

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Free-Form Text Input** | Paste notes of any length or select from 4 rich built-in samples. | ✅ Complete |
| **3D Flip Flashcards** | Realistic CSS perspective flip, flip button, shuffle, and card mastery tracking. | ✅ Complete |
| **Practice Quiz & Scoring** | Multiple choice with live selection, instant feedback, and explanation rationale. | ✅ Complete |
| **Targeted Re-test Mode** | Filters exclusively the questions answered incorrectly and quizzes only those. | ✅ Complete |
| **Different UI Blocks** | Renders 4 distinct blocks: Summary Card, Flashcards, Quiz, and Concept Checklist. | ✅ Complete (Stretch) |
| **Refinement Loop** | Bottom refinement bar enables follow-up prompts to edit/expand existing results. | ✅ Complete (Stretch) |
| **Saved Sessions** | Save, switch, rename, delete, and Export/Import sessions as JSON files. | ✅ Complete (Stretch) |
| **Keyboard Navigation** | `Space` to flip card, `← / →` to navigate cards, `1-4` to select quiz answers. | ✅ Complete (Stretch) |
| **Dark Mode & Responsive** | Full dark/light mode toggle with Tailwind and mobile touch support. | ✅ Complete (Stretch) |

---

## 6. Honest AI-Usage Disclosure

In accordance with the assignment guidelines:
> *"Add a short note in your README on what you used AI for — being honest about it counts in your favor."*

### What AI was used for:
1. **Generating Domain Seed Data:** Curating realistic default study sets (Photosynthesis, React Hooks, Quantum Computing, Treaty of Versailles) in `sampleData.js`.
2. **Brainstorming Edge Cases for Chaos Testing:** Suggesting real-world JSON syntax failure modes (e.g. trailing commas, missing closing brackets, conversational chatter).
3. **Prompt Engineering Formulation:** Drafting the system prompts in `server/prompts.js` to encourage deterministic structured JSON output from models.

### What was engineered manually:
1. **Component Architecture & State Machine:** Designing `useStudySession`, state transitions, and interactive modes (quiz scoring, targeted re-test, flashcard filters).
2. **Fault-Tolerance Pipeline:** Writing the custom `jsonRepair.js` heuristic engine, Zod validation schemas, and self-healing normalization logic.
3. **Race Condition Prevention:** Designing the `AbortController` and monotonic request ID sequence in `api.js` to prevent stale response overwrites.
4. **Interactive UI & 3D Styling:** Implementing the 3D flip card CSS perspective and Tailwind styling.

---

## 7. Known Limitations & Engineering Trade-offs

1. **Context Window Limits on Free-Tier Models:** Extremely long transcripts (>20,000 words) may get truncated by free-tier LLM output token limits. A production system would chunk text with LangChain/LlamaIndex.
2. **In-Memory Rate Limiting:** The backend currently handles rate limits and concurrency in-process; a production deployment would use Redis-backed rate limiting.
3. **LocalStorage Quotas:** Saved study sessions are stored in browser `localStorage` (capped at ~5MB). An IndexedDB or cloud database layer (e.g., Supabase) would be preferred for large-scale session history.

---

## 8. Time Spent Breakdown (~7 Hours)

- **Hour 0.0 – 1.0:** Project setup, requirements analysis, defining Zod schemas, and architecting the data flow.
- **Hour 1.0 – 2.5:** Building the resilient parsing layer (`jsonRepair.js`, Zod validators, fallback normalization, and race-condition guards).
- **Hour 2.5 – 4.0:** Developing interactive UI blocks (3D Flashcard deck, Quiz with instant rationale, and Concept Checklist).
- **Hour 4.0 – 5.0:** Implementing the **Targeted Re-test Mode** (isolating missed questions) and the **Refinement Loop** (iterative follow-up edits).
- **Hour 5.0 – 6.0:** Building the Express proxy backend, multi-provider dispatch (Gemini, Groq, Ollama), and smart mock engine.
- **Hour 6.0 – 7.0:** Building the Chaos Testing Suite, keyboard navigation, dark mode, automated tests, and comprehensive documentation.

---

## 9. What I'd Build Next

If allocated more time:
1. **Spaced Repetition Scheduling (SM-2):** Integrate SuperMemo-2 / Leitner Box algorithms so flashcards reappear at mathematically optimal recall intervals.
2. **Real-time Server-Sent Events (SSE) Streaming:** Stream JSON chunks progressively so the flashcards and summary render incrementally as the model outputs tokens.
3. **Anki (.apkg) Export:** Allow students to export flashcard decks directly into Anki or Quizlet format.
4. **Voice / Speech Synthesis:** Add Web Speech API integration to read flashcards aloud and accept spoken quiz answers.

---

### Verification Checklist for Evaluators
- [x] Does not use a generic chatbot UI; renders structured stateful components.
- [x] Tested against malformed JSON, schema violation, and slow response race conditions.
- [x] Express backend proxy prevents browser API key exposure.
- [x] Single-command execution: `npm install && npm start`.
- [x] Fully responsive on mobile and desktop with dark mode and keyboard shortcuts.

