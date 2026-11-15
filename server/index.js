import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processStudyMaterial, processRefinement } from './aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const activeProviders = [];
  if (process.env.GEMINI_API_KEY) activeProviders.push('gemini');
  if (process.env.GROQ_API_KEY) activeProviders.push('groq');
  if (process.env.OPENAI_API_KEY) activeProviders.push('openai');
  if (process.env.OLLAMA_BASE_URL) activeProviders.push('ollama');

  res.json({
    status: 'ok',
    version: '1.0.0',
    activeProviders: activeProviders.length > 0 ? activeProviders : ['mock-intelligent'],
    timestamp: new Date().toISOString()
  });
});

// Primary generation endpoint
app.post('/api/generate', async (req, res) => {
  const { notes, provider, apiKey, customPrompt } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request: notes text cannot be empty.'
    });
  }

  try {
    const studySet = await processStudyMaterial({ notes, provider, apiKey, customPrompt });
    res.json(studySet);
  } catch (err) {
    console.error('Generation endpoint error:', err.message);
    res.status(500).json({
      error: 'AI Service Error',
      message: err.message || 'Failed to process study material with AI provider.'
    });
  }
});

// Refinement endpoint (Stretch goal: iterative follow-up prompts)
app.post('/api/refine', async (req, res) => {
  const { currentData, instruction, provider, apiKey } = req.body;

  if (!currentData || !instruction) {
    return res.status(400).json({
      error: 'Invalid request: currentData and instruction are required.'
    });
  }

  try {
    const refinedSet = await processRefinement({ currentData, instruction, provider, apiKey });
    res.json(refinedSet);
  } catch (err) {
    console.error('Refinement endpoint error:', err.message);
    res.status(500).json({
      error: 'AI Refinement Error',
      message: err.message || 'Failed to refine study set.'
    });
  }
});

// Chaos / Resilience testing endpoint for the evaluator!
// Enables testing of malformed JSON, schema violation, server failure, and timeouts.
app.post('/api/chaos', async (req, res) => {
  const { testType } = req.body;

  switch (testType) {
    case 'malformed_json':
      // Return HTTP 200 but raw text that is NOT valid JSON
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send('{"topic": "Quantum Computing", "brokenJson": [1, 2, 3, "unclosed string');

    case 'bad_shape':
      // Return valid JSON but completely violates expected schema (missing required fields, wrong types)
      return res.status(200).json({
        topic: 12345, // should be string
        summary: null,
        flashcards: "this should be an array but is a string",
        quiz: [
          { question: "Missing options and answers" }
        ]
      });

    case 'server_error':
      return res.status(500).json({
        error: 'Simulated 500 Internal Server Error',
        message: 'The AI inference server encountered an unhandled exception or rate limit.'
      });

    case 'timeout':
      // Delay response for 15 seconds to test client abort / timeout handling
      await new Promise((resolve) => setTimeout(resolve, 15000));
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request timed out after waiting for model response.'
      });

    default:
      return res.status(400).json({ error: `Unknown chaos test type: ${testType}` });
  }
});

app.listen(PORT, () => {
  console.log(`[MindPulse AI Server] Running on http://localhost:${PORT}`);
});

