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
 * @param {Function} onChunk - Callback for streaming chunks
 * @param {Object} currentContent - Existing content when editing {title, content}
 * @returns {Promise<Object>} - Parsed response with title, content, sources
 */
export async function generateCardContent(prompt, chatHistory = [], onChunk = null, currentContent = null) {

  const isEditing = currentContent && currentContent.content;
  
  const systemPrompt = isEditing
    ? `You are a medical education assistant helping EDIT and ENHANCE existing study cards for medical students during clinical rotations.

IMPORTANT EDITING RULES:
1. PRESERVE all existing content unless explicitly asked to remove or change something
2. When user asks to "add" or "include" something, ADD it to the existing content without removing anything
3. When user asks to "change" or "fix" something, only modify that specific part
4. Default behavior: ENHANCE and ADD to existing content
5. ALWAYS return the FULL updated card content (do NOT return only the new section)
6. The output must include all original sections unchanged unless the user explicitly asked to change them
7. If the user specifies placement (e.g., "insert between Diagnostic Approach and Common Causes"), you MUST insert in that exact location

CURRENT CONTENT:
${currentContent?.content || ''}

OUTPUT FORMAT - Generate only valid, visually engaging HTML:
- Start with title tag: <strong>🎯 Card Title</strong>
- Use <h3> with color and margin for section headers
- Use relevant EMOJIS throughout (🔍 📋 ⚠️ 💊 🩺 ⚡ 🧪 etc.)
- Use <strong>bold</strong> and <u>underline</u> for key terms
- Use <ul><li> for bullet points
- Use <ol><li> for numbered lists
- Use <table border='1' style='border-collapse: collapse; width: 100%; margin: 0.5em 0;'> for data/comparisons
- Add visual hierarchy with inline styling: colors, backgrounds, spacing
- Use <span style='color: #dc2626;'>highlighted text</span> for important warnings
- Use <span style='background-color: #fef3c7; padding: 2px 4px;'>yellow highlighting</span> for key points

Make it visually interesting and scannable like professional medical content. Clean, semantic HTML only. No markdown.

CRITICAL: Return the complete updated HTML for the entire card, including the original content plus your additions/edits.`
    : `You are a medical education assistant creating quick-reference study cards for medical students during clinical rotations.

Your goal: Create concise, accurate, clinically useful cards that are VISUALLY ENGAGING and easy to scan - similar to ChatGPT-4.5's professional formatting.

OUTPUT FORMAT - Generate only valid, visually engaging HTML:
- Start with title tag: <strong>🎯 Card Title</strong>
- Use <h3> with color and margin for section headers, add emojis
- INTEGRATE relevant EMOJIS throughout content (🔍 📋 ⚠️ 💊 🩺 ⚡ 🧪 📌 🎯 ✓ ❌ etc.)
- Use <strong>bold</strong> and <u>underline</u> for key medical terms
- Use <ul><li> for bullet points with emojis
- Use <ol><li> for numbered lists/protocols
- Use <table border='1' style='border-collapse: collapse; width: 100%; margin: 0.5em 0;'> for:
  * Differential diagnoses
  * Drug comparison/dosing
  * Lab value interpretation
  * Treatment algorithms
- Add visual hierarchy:
  * <span style='color: #dc2626;'>Red text</span> for warnings/contraindications
  * <span style='color: #059669;'>Green text</span> for positive findings/normal values
  * <span style='background-color: #fef3c7; padding: 2px 6px; border-radius: 3px;'>Yellow highlights</span> for key points
  * <span style='background-color: #dbeafe; padding: 2px 6px; border-radius: 3px;'>Blue highlights</span> for remember/note
- Use spacing: <br><br> between sections
- End with sources: <p><strong>📚 Sources:</strong> Source1, Source2</p>

Design for visual scannability - medical students should quickly spot critical info. Professional formatting like ChatGPT. Clean, semantic HTML only. No markdown.`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
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

  // Extract title from <strong> tag or first line
  const titleMatch = response.match(/<strong>(.+?)<\/strong>/);
  if (titleMatch) {
    title = titleMatch[1].trim();
    content = content.replace(titleMatch[0], '').trim();
  }

  // Extract sources from <strong>Sources:</strong> tag
  const sourcesMatch = response.match(/<strong>Sources:<\/strong>\s*([^<]+)/);
  if (sourcesMatch) {
    sources = sourcesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    content = content.replace(/<p>.*?<strong>Sources:<\/strong>.*?<\/p>/i, '').trim();
  }

  // If no title extracted, generate one from first <h3> or first words
  if (!title) {
    const h3Match = content.match(/<h3>(.+?)<\/h3>/);
    if (h3Match) {
      title = h3Match[1];
    } else {
      const textContent = content.replace(/<[^>]+>/g, '').substring(0, 60);
      title = textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
    }
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
export async function generateMultipleCards(text, mode = 'prompt', onProgress = null, options = {}) {

  const {
    targetCount = null,
    chunkIndex = null,
    chunkTotal = null
  } = options;

  const chunkHint = (chunkIndex !== null && chunkTotal !== null)
    ? `This is chunk ${chunkIndex + 1} of ${chunkTotal}.`
    : '';
  const targetHint = targetCount ? `Aim to produce approximately ${targetCount} cards from this input.` : '';

  const systemPrompt = mode === 'document' 
    ? `You are a medical education assistant. Extract key medical information from the provided document and create multiple study cards.

IMPORTANT - Your response MUST be valid JSON only, an array of card objects. No other text.

CRITICAL OUTPUT RULES:
1. Each card MUST be a self-contained, complete card with FULL HTML content (not partial snippets).
2. Use the SAME visual formatting as single-card generation: emojis, colored section headers, tables, bold, underline, highlights.
3. Divide the document into distinct topics/sections and generate 1 card per topic.
4. Preserve the original content; do NOT summarize away key details.
5. Follow the user's instructions EXACTLY and prioritize their scope above all else. If they ask for prescriptions only, output ONLY prescription-related content and omit everything else.
6. When the user asks for prescriptions, include medication name, dose, route, frequency, duration, and the related indication(s), using whatever structure best fits the user's request.
7. If the user explicitly requests a tab/section (e.g., "prescriptions"), set sections accordingly for ALL cards. Otherwise, choose the most relevant sections for each card.

Each card object must include:
- title (string)
- content (string, HTML only)
- sources (array of strings, MUST be real, verifiable sources)
Optional fields:
- sections (array of section keys chosen from: consultations, prescriptions, investigations, procedures, templates, calculators, urgences)

SOURCES REQUIREMENTS - USE REAL, VERIFIABLE CITATIONS:
- For prescriptions/medications: Use "Product Monograph", "CPS (Compendium of Pharmaceuticals and Specialties)", "UpToDate", "Lexicomp", "Micromedex"
- For clinical guidelines: Cite actual organizations like "ACOG Guidelines", "SOGC Guidelines", "CDC Guidelines", "WHO Guidelines", "AHA/ACC Guidelines"
- For obstetrics/gynecology: Use "Williams Obstetrics", "ACOG Practice Bulletins", "SOGC Clinical Practice Guidelines"
- For general medicine: Use "Harrison's Principles of Internal Medicine", "UpToDate", "DynaMed"
- For emergency medicine: Use "Tintinalli's Emergency Medicine", "ACLS Guidelines"
- ONLY cite sources that actually exist and that a medical professional could verify
- Include specific guideline numbers when applicable (e.g., "ACOG Practice Bulletin #222")
- If you're not certain of a real source, use the most appropriate textbook or clinical resource for that topic

HTML FORMAT REQUIREMENTS:
- Start content with <strong>🎯 Card Title</strong>
- Use <h3> with color (#1e40af), font-weight 600, and spacing
- Use emojis throughout (🔍 📋 ⚠️ 💊 🩺 ⚡ 🧪 📌 ✓ ❌)
- Use <strong> and <u> for key terms
- Use tables for comparisons (border='1', border-collapse: collapse; width:100%)
- Use <span style='color: #dc2626;'> for warnings
- Use <span style='background-color: #fef3c7; padding: 2px 6px; border-radius: 3px;'> for highlights
- End with sources: <p><strong>📚 Sources:</strong> ...</p>

${chunkHint}
${targetHint}

Format your ENTIRE response as a valid JSON array. Create as many cards as needed for full coverage (no hard limit).

⚠️ JSON FORMATTING RULES (CRITICAL):
- ONLY output valid JSON array, nothing else
- Properly escape all quotes inside strings: use \\" for quotes in content
- Remove ALL trailing commas before ] or }
- Ensure all strings are properly closed with matching quotes
- Do NOT include markdown code blocks or any text outside the JSON array`
    : `You are a medical education assistant. Based on the user request, create multiple study cards.

IMPORTANT - Your response MUST be valid JSON only, an array of card objects. No other text.

CRITICAL OUTPUT RULES:
1. Each card MUST be a self-contained, complete card with FULL HTML content (not partial snippets).
2. Use the SAME visual formatting as single-card generation: emojis, colored section headers, tables, bold, underline, highlights.
3. If the request includes multiple topics, split into separate cards (1 topic per card).
4. ⚠️ VOLUME IS MANDATORY ⚠️: The targetHint below specifies EXACTLY how many cards to generate. You MUST generate that many cards. Do NOT stop early. If you're asked for 30 cards, generate 30 complete cards.
5. ⚠️ ONE ITEM = ONE CARD: Each card must cover ONE single medication/item/topic ONLY. Do NOT combine multiple items into a single card. If given a list of medications, generate one card per medication.
6. If user gives a list (e.g., "Estradiol, Levonorgestrel, Norethindrone"), create separate cards for EACH item - NOT one combined card about all of them.
7. If the user explicitly requests a tab/section, set sections accordingly for ALL cards. Otherwise, choose the most relevant sections for each card.

${targetHint}

Each card object must include:
- title (string)
- content (string, HTML only)
- sources (array of strings, MUST be real, verifiable sources)
Optional fields:
- sections (array of section keys chosen from: consultations, prescriptions, investigations, procedures, templates, calculators, urgences)

SOURCES REQUIREMENTS - USE REAL, VERIFIABLE CITATIONS:
- For prescriptions/medications: Use "Product Monograph", "CPS (Compendium of Pharmaceuticals and Specialties)", "UpToDate", "Lexicomp", "Micromedex"
- For clinical guidelines: Cite actual organizations like "ACOG Guidelines", "SOGC Guidelines", "CDC Guidelines", "WHO Guidelines", "AHA/ACC Guidelines"
- For obstetrics/gynecology: Use "Williams Obstetrics", "ACOG Practice Bulletins", "SOGC Clinical Practice Guidelines"
- For general medicine: Use "Harrison's Principles of Internal Medicine", "UpToDate", "DynaMed"
- For emergency medicine: Use "Tintinalli's Emergency Medicine", "ACLS Guidelines"
- ONLY cite sources that actually exist and that a medical professional could verify
- Include specific guideline numbers when applicable (e.g., "ACOG Practice Bulletin #222")
- If you're not certain of a real source, use the most appropriate textbook or clinical resource for that topic

HTML FORMAT REQUIREMENTS:
- Start content with <strong>🎯 Card Title</strong>
- Use <h3> with color (#1e40af), font-weight 600, and spacing
- Use emojis throughout (🔍 📋 ⚠️ 💊 🩺 ⚡ 🧪 📌 ✓ ❌)
- Use <strong> and <u> for key terms
- Use tables for comparisons (border='1', border-collapse: collapse; width:100%)
- Use <span style='color: #dc2626;'> for warnings
- Use <span style='background-color: #fef3c7; padding: 2px 6px; border-radius: 3px;'> for highlights
- End with sources: <p><strong>📚 Sources:</strong> ...</p>

${chunkHint}
${targetHint}

Format your ENTIRE response as a valid JSON array.

⚠️ JSON FORMATTING RULES (CRITICAL):
- ONLY output valid JSON array, nothing else
- Properly escape all quotes inside strings: use \\" for quotes in content
- Remove ALL trailing commas before ] or }
- Ensure all strings are properly closed with matching quotes
- Do NOT include markdown code blocks or any text outside the JSON array`;

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
        max_tokens: 16000
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

    let cards;
    try {
      cards = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // Try to fix common JSON errors
      console.warn('Initial JSON parse failed, attempting repair...', parseError);
      
      try {
        // Remove trailing commas before ] or }
        let fixed = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix unescaped quotes in strings (basic attempt)
          .replace(/(['"])(.*?)\1/gs, (match, quote, content) => {
            // Don't process if already properly escaped
            if (content.includes('\\' + quote)) return match;
            // Escape unescaped quotes
            const escaped = content.replace(new RegExp(quote, 'g'), '\\' + quote);
            return quote + escaped + quote;
          });
        
        cards = JSON.parse(fixed);
        console.log('JSON repair successful');
      } catch (repairError) {
        // Last resort: try to extract individual card objects
        console.warn('JSON repair failed, attempting object extraction...', repairError);
        
        const cardMatches = jsonMatch[0].matchAll(/\{[^}]*"title"[^}]*"content"[^}]*\}/g);
        cards = [];
        
        for (const match of cardMatches) {
          try {
            const cleanMatch = match[0]
              .replace(/,(\s*})/g, '$1')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            
            const card = JSON.parse(cleanMatch);
            if (card.title && card.content) {
              cards.push(card);
            }
          } catch (e) {
            console.warn('Failed to parse individual card:', e);
          }
        }
        
        if (cards.length === 0) {
          throw new Error(`JSON parsing failed: ${parseError.message}`);
        }
        
        console.log(`Extracted ${cards.length} cards using fallback method`);
      }
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error('No cards were generated');
    }

    onProgress?.(`Generated ${cards.length} cards successfully!`);

    return cards.map(card => ({
      title: card.title || 'Untitled',
      content: card.content || '',
      sources: Array.isArray(card.sources) ? card.sources : [],
      sections: Array.isArray(card.sections) ? card.sections : [],
      aiGenerated: true
    }));

  } catch (error) {
    console.error('Mass generation error:', error);
    throw error;
  }
}
