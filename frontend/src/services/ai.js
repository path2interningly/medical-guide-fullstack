/**
 * AI Service - OpenRouter API Integration
 * Handles card generation with streaming support
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const AI_PROXY_URL = `${API_BASE_URL}/ai/chat`;

/**
 * Generate card content using OpenRouter API
 * @param {string} prompt - User's request
 * @param {Array} chatHistory - Previous messages for context
 * @param {string} apiKey - OpenRouter API key
 * @param {Function} onChunk - Callback for streaming chunks
 * @returns {Promise<Object>} - Parsed response with title, content, sources
 */
export async function generateCardContent(prompt, chatHistory = [], onChunk = null) {

  const messages = [
    {
      role: 'system',
      content: `You are a medical education assistant helping create study cards. 

Your responses should:
1. Be accurate and based on current medical guidelines (SOGC, UpToDate, Toronto Notes, etc.)
2. Use clear formatting with emojis, bullet points, and visual hierarchy
3. Include algorithms/flowcharts when appropriate (using text-based trees)
4. Be concise but comprehensive for medical students/residents

IMPORTANT: Start your response with a suggested title on the first line in this format:
TITLE: [Your suggested title here]

Then provide the content. At the end, if you referenced specific sources, list them like:
SOURCES: Source1, Source2, Source3

Example:
TITLE: Cervical Screening Algorithm
[content here...]
SOURCES: SOGC 2024, UpToDate, Toronto Notes`
    },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL || 'anthropic/claude-3.5-sonnet',
        messages,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.content || '';
    if (onChunk && content) {
      onChunk(content);
    }
    return parseAIResponse(content);
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

/**
 * Parse AI response to extract title, content, and sources
 * @param {string} response - Full AI response
 * @returns {Object} - { title, content, sources }
 */
function parseAIResponse(response) {
  let title = '';
  let content = response;
  let sources = [];

  // Extract title
  const titleMatch = response.match(/^TITLE:\s*(.+?)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
    content = content.replace(/^TITLE:\s*.+?\n/m, '').trim();
  }

  // Extract sources
  const sourcesMatch = response.match(/SOURCES:\s*(.+?)$/m);
  if (sourcesMatch) {
    sources = sourcesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    content = content.replace(/\nSOURCES:\s*.+?$/m, '').trim();
  }

  // If no title extracted, generate one from first line or prompt
  if (!title) {
    const firstLine = content.split('\n')[0];
    title = firstLine.length > 60 ? firstLine.substring(0, 57) + '...' : firstLine;
  }

  return {
    title,
    content,
    sources,
    fullResponse: response
  };
}

/**
 * Get API key from settings
 * Checks environment variable first, then falls back to localStorage
 * @returns {string|null}
 */
function getAuthHeader() {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Generate multiple cards from text content or prompt
 * @param {string} text - Source text or prompt
 * @param {string} mode - 'prompt' or 'document'
 * @param {string} apiKey - OpenRouter API key
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Array>} - Array of card objects
 */
export async function generateMultipleCards(text, mode = 'prompt', onProgress = null) {

  const systemPrompt = mode === 'document' 
    ? `You are a medical education assistant. Extract key medical information from the provided document and create multiple study cards.

IMPORTANT: Your response MUST be valid JSON only - an array of card objects. No other text.

Each card should have:
- title: Short, descriptive title
- content: Detailed content with emojis, formatting, algorithms if appropriate
- sources: Array of source references (if applicable)

Format your ENTIRE response as valid JSON:
[
  {
    "title": "Card Title",
    "content": "Card content with details...",
    "sources": ["Source1", "Source2"]
  }
]

Create 3-10 cards depending on the document length and content richness.`
    : `You are a medical education assistant. Based on the user's request, create multiple study cards.

IMPORTANT: Your response MUST be valid JSON only - an array of card objects. No other text.

Each card should have:
- title: Short, descriptive title
- content: Detailed content with emojis, formatting, algorithms if appropriate
- sources: Array of source references (e.g., UpToDate, SOGC, Toronto Notes)

Format your ENTIRE response as valid JSON:
[
  {
    "title": "Card Title",
    "content": "Card content with details...",
    "sources": ["Source1", "Source2"]
  }
]`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ];

  try {
    onProgress?.('Generating cards...');

    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL || 'anthropic/claude-3.5-sonnet',
        messages,
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.content || '';

    onProgress?.('Parsing generated cards...');

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract valid JSON from AI response');
    }

    const cards = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error('No cards were generated');
    }

    onProgress?.(`Generated ${cards.length} cards successfully!`);

    return cards.map(card => ({
      title: card.title || 'Untitled',
      content: card.content || '',
      sources: Array.isArray(card.sources) ? card.sources : [],
      aiGenerated: true
    }));

  } catch (error) {
    console.error('Mass generation error:', error);
    throw error;
  }
}
