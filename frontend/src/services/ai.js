/**
 * AI Service - OpenRouter API Integration
 * Handles card generation with streaming support
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate card content using OpenRouter API
 * @param {string} prompt - User's request
 * @param {Array} chatHistory - Previous messages for context
 * @param {string} apiKey - OpenRouter API key
 * @param {Function} onChunk - Callback for streaming chunks
 * @returns {Promise<Object>} - Parsed response with title, content, sources
 */
export async function generateCardContent(prompt, chatHistory = [], apiKey, onChunk = null) {
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Please add it in Settings.');
  }

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
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Med in a Pocket'
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: messages,
        stream: !!onChunk,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    if (onChunk) {
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      return parseAIResponse(fullContent);
    } else {
      // Handle non-streaming response
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      return parseAIResponse(content);
    }
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
export function getApiKey() {
  // Check environment variable first (more secure)
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }

  // Fall back to localStorage (set via Settings UI)
  try {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.openRouterApiKey || null;
    }
  } catch (e) {
    console.error('Failed to get API key:', e);
  }
  return null;
}

/**
 * Generate multiple cards from text content or prompt
 * @param {string} text - Source text or prompt
 * @param {string} mode - 'prompt' or 'document'
 * @param {string} apiKey - OpenRouter API key
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Array>} - Array of card objects
 */
export async function generateMultipleCards(text, mode = 'prompt', apiKey, onProgress = null) {
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured.');
  }

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

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Med in a Pocket - Mass Generate'
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: messages,
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

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
