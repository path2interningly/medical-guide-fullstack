import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateMultipleCards } from '../../services/ai';
import { useCards } from '../../context/CardsContext';
import { filterCardsByScope } from '../../utils/scopeFilter';

/**
 * MassGenerateModal - Chat-based interface for generating multiple cards
 * Supports document upload and chat-based refinement
 */
export default function MassGenerateModal({ isOpen, onClose, currentSpecialty }) {
  const { t } = useTranslation();
  const { addCard } = useCards();

  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [cardSections, setCardSections] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [cardsGenerated, setCardsGenerated] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const sectionTitles = {
    consultations: 'Consultations by Symptom',
    prescriptions: 'Prescriptions & Orders',
    investigations: 'Investigations & Interpretations',
    procedures: 'Technical Procedures',
    templates: 'Templates & Forms',
    calculators: 'Calculators & Scores',
    urgences: 'Emergencies & Algorithms'
  };
  const sectionKeys = Object.keys(sectionTitles);
  const MAX_CARDS = 200;

  const normalizeSections = (sections) => {
    if (!Array.isArray(sections)) return [];
    return sections.filter((key) => sectionKeys.includes(key));
  };

  const splitIntoChunks = (text, maxLength = 8000) => {
    if (!text) return [];
    if (text.length <= maxLength) return [text];
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let current = '';
    for (const para of paragraphs) {
      const next = current ? `${current}\n\n${para}` : para;
      if (next.length > maxLength) {
        if (current) chunks.push(current);
        current = para;
      } else {
        current = next;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

  const buildUserConstraints = (input) => {
    const lower = input.toLowerCase();
    const wantsPrescriptions = /prescription|prescribe|medication|dose|dosing|mg|q\d+h|tablet|capsule|po|iv|im|sc|subcut|topical/.test(lower);

    if (wantsPrescriptions) {
      return [
        '- Output ONLY prescription-related content. Omit all non-prescription topics.',
        '- Every card must include: medication name, dose, route, frequency, duration, and indication(s).',
        '- If a medication is not explicitly mentioned in the document, do not invent it.'
      ].join('\n');
    }

    return '- Follow the USER REQUEST exactly. Do not include unrelated topics.';
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setExtractedText('');
      setChatHistory([]);
      setUserInput('');
      setGeneratedCards([]);
      setSelectedCards(new Set());
      setCardSections({});
      setExpandedCard(null);
      setError('');
      setProgress('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      // Dynamically import fileParser functions only when needed
      const { extractTextFromFile, validateFile, getFileSize } = await import('../../services/fileParser');
      
      validateFile(selectedFile);
      setFile(selectedFile);
      setError('');
      setIsProcessing(true);
      setProgress('Extracting text from document...');

      const text = await extractTextFromFile(selectedFile);
      setExtractedText(text);
      
      // Add system message about document
      const docMessage = {
        role: 'system',
        content: `📄 Document uploaded: ${selectedFile.name} (${getFileSize(selectedFile.size)})\n\nDocument content extracted successfully. You can now ask me to generate cards from this document.`
      };
      setChatHistory([docMessage]);
      setProgress('');
      
    } catch (err) {
      setError(err.message);
      setFile(null);
      setExtractedText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    // Prepare context with document if available
    const userRequest = userInput.trim();
    const hardConstraints = buildUserConstraints(userRequest);
    const requestBlock = `USER REQUEST (follow exactly):\n${userRequest}`;
    const constraintsBlock = `HARD CONSTRAINTS:\n${hardConstraints}`;
    let contextPrompt = `${constraintsBlock}\n\n${requestBlock}`;
    const docChunks = extractedText ? splitIntoChunks(extractedText) : [];

    const userMessage = { role: 'user', content: userInput.trim() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setIsProcessing(true);
    setError('');

    try {
      let cards = [];
      let savedCount = 0;
      const seen = new Set(); // Track duplicates across chunks
      
        setTotalChunks(docChunks.length);
        setCurrentChunk(0);
        setCardsGenerated(0);
      
      if (docChunks.length > 1) {
        for (let i = 0; i < docChunks.length; i++) {
                    setCurrentChunk(i + 1);
          if (cards.length >= MAX_CARDS) break;
          setProgress(`Generating cards from document chunk ${i + 1} of ${docChunks.length}...`);
          const chunkPrompt = `Based on this document chunk (${i + 1}/${docChunks.length}):\n\n${docChunks[i]}\n\n${constraintsBlock}\n\n${requestBlock}`;
          const remaining = Math.max(0, MAX_CARDS - cards.length);
          const targetCount = Math.min(30, remaining);
          const chunkCards = await generateMultipleCards(
            chunkPrompt,
            'document',
            (msg) => setProgress(msg),
            { targetCount, chunkIndex: i, chunkTotal: docChunks.length }
          );
          
          // Deduplicate and add to display
          const newCards = chunkCards.filter((card) => {
            const key = (card.title || '').toLowerCase().trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          
          cards = [...cards, ...newCards];
                    setCardsGenerated(cards.length);
          
          // Update live preview in modal
          setGeneratedCards([...cards]);
          setSelectedCards(new Set(cards.map((_, idx) => idx)));
          
          // Auto-save as backup (in case of refresh)
          if (newCards.length > 0) {
            newCards.forEach((card) => {
              const preferredSections = normalizeSections(card.sections);
              const sectionsToSave = preferredSections.length > 0 ? preferredSections : ['consultations'];
              sectionsToSave.forEach((section) => {
                addCard({
                  title: card.title,
                  content: card.content,
                  specialty: currentSpecialty,
                  section,
                  tags: [],
                  color: 'blue',
                  aiGenerated: true,
                  aiSources: card.sources || []
                });
              });
            });
            savedCount += newCards.length;
            setProgress(`✅ ${cards.length} cards generated (chunk ${i + 1}/${docChunks.length}) - auto-saved as backup`);
          }
        }
      } else {
        // Prompt-only or single-document mode with multi-batch generation
        // Extract target count from request (e.g., "Top 75", "75 prescriptions")
        const targetMatch = userRequest.match(/(?:top|generate|create|list|want)\s+(\d+)/i);
        const requestedCount = targetMatch ? parseInt(targetMatch[1]) : 50;

        // If user provided an explicit list, batch by that list to avoid duplicates
        const listCandidates = userRequest
          .split(/\n|,|;|•|\u2022|\u00b7/)
          .map((item) => item.trim())
          .filter((item) => item.length > 2 && item.length < 80);
        const listItems = Array.from(new Set(listCandidates));

        const targetPerBatch = listItems.length > 0 ? 10 : 12;
        const totalTarget = listItems.length > 0 ? Math.min(listItems.length, requestedCount) : Math.min(requestedCount, 150);
        const numBatches = Math.ceil(totalTarget / targetPerBatch);
        
        setTotalChunks(numBatches);
        setCurrentChunk(0);
        setCardsGenerated(0);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
          if (cards.length >= totalTarget || cards.length >= MAX_CARDS) break;
          
          setCurrentChunk(batchNum + 1);
          const remainingNeeded = totalTarget - cards.length;
          const batchTarget = Math.min(targetPerBatch, remainingNeeded);
          setProgress(`🤖 Generating batch ${batchNum + 1} of ${numBatches} (${cards.length}/${totalTarget} cards so far)...`);
          
          // Build batch prompt with aggressive volume instruction
          let batchContext = contextPrompt;
          if (extractedText) {
            batchContext = `Based on this document:\n\n${extractedText}\n\n${constraintsBlock}\n\n${requestBlock}`;
          }
          
          // Add CRITICAL batch instruction emphasizing volume and uniqueness
          const listSlice = listItems.length > 0
            ? listItems.slice(batchNum * targetPerBatch, batchNum * targetPerBatch + batchTarget)
            : [];
          const listBlock = listSlice.length > 0
            ? `\n\nITEMS FOR THIS BATCH (CREATE ONE CARD PER ITEM, DO NOT COMBINE):\n- ${listSlice.join('\n- ')}`
            : '';

          const batchInstruction = `\n\n⚠️⚠️⚠️ CRITICAL - BATCH ${batchNum + 1} OF ${numBatches} ⚠️⚠️⚠️\nProgress: ${cards.length}/${totalTarget} cards completed\n\nYOU MUST generate EXACTLY ${batchTarget} BRAND NEW, UNIQUE cards that are COMPLETELY DIFFERENT from all previous batches.\n\nRULES:\n1. Each card covers ONE single item/medication/topic ONLY - not combinations\n2. Completely different from anything you generated before\n3. Do NOT repeat or similar items\n4. Generate the FULL ${batchTarget} cards - do not stop early\n5. Include variations: different drugs, indications, dosages, populations\n\nThis is mandatory and will be checked for uniqueness.`;
          const batchPrompt = batchContext + listBlock + batchInstruction;
          
          const batchCards = await generateMultipleCards(
            batchPrompt,
            extractedText ? 'document' : 'prompt',
            (msg) => setProgress(msg),
            { targetCount: batchTarget }
          );
          
          // Filter out duplicates
          const batchBefore = batchCards.length;
          const newBatchCards = batchCards.filter((card) => {
            const key = (card.title || '').toLowerCase().trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          
          console.log(`[Batch ${batchNum + 1}] Generated: ${batchBefore}, After dedup: ${newBatchCards.length}`);
          
          cards = [...cards, ...newBatchCards];
          setCardsGenerated(cards.length);
          setGeneratedCards([...cards]);
          
          setProgress(`✅ ${cards.length} cards generated (batch ${batchNum + 1}/${numBatches})`);
        }

        // If user provided a list, run a targeted retry for missing items
        if (listItems.length > 0 && cards.length < totalTarget) {
          const normalize = (text) => (text || '').toLowerCase();
          const covered = new Set();
          cards.forEach((card) => {
            const blob = `${card.title} ${card.content}`.toLowerCase();
            listItems.forEach((item) => {
              if (blob.includes(item.toLowerCase())) covered.add(item.toLowerCase());
            });
          });

          const missingItems = listItems.filter((item) => !covered.has(item.toLowerCase()));
          if (missingItems.length > 0) {
            const retryBatches = Math.ceil(missingItems.length / targetPerBatch);
            for (let retry = 0; retry < retryBatches; retry++) {
              if (cards.length >= totalTarget || cards.length >= MAX_CARDS) break;
              const retrySlice = missingItems.slice(retry * targetPerBatch, retry * targetPerBatch + targetPerBatch);
              const retryTarget = retrySlice.length;
              setProgress(`🔁 Retrying missing items (${retrySlice.length} items)...`);

              const retryListBlock = `\n\nMISSING ITEMS (ONE CARD EACH, DO NOT COMBINE):\n- ${retrySlice.join('\n- ')}`;
              const retryInstruction = `\n\n⚠️ MANDATORY: Generate EXACTLY ${retryTarget} cards, one per item above. Do NOT skip any item.`;
              const retryPrompt = batchContext + retryListBlock + retryInstruction;

              const retryCards = await generateMultipleCards(
                retryPrompt,
                extractedText ? 'document' : 'prompt',
                (msg) => setProgress(msg),
                { targetCount: retryTarget }
              );

              const retryNew = retryCards.filter((card) => {
                const key = (card.title || '').toLowerCase().trim();
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              cards = [...cards, ...retryNew];
              setCardsGenerated(cards.length);
              setGeneratedCards([...cards]);
              setProgress(`✅ ${cards.length} cards generated (retry ${retry + 1}/${retryBatches})`);
            }
          }
        }
      }

      // Deduplicate by title
      const finalSeen = new Set();
      const beforeDedupe = cards.length;
      cards = cards.filter((card) => {
        const key = (card.title || '').toLowerCase().trim();
        if (!key || finalSeen.has(key)) return false;
        finalSeen.add(key);
        return true;
      });
      console.log(`[Cards] Before final dedup: ${beforeDedupe}, After: ${cards.length}`);

      // Apply scope filtering (e.g., prescriptions only)
      const beforeScope = cards.length;
      cards = filterCardsByScope(cards, userRequest);
      console.log(`[Cards] Before scope filter: ${beforeScope}, After: ${cards.length}`);

      setGeneratedCards(cards);
      setSelectedCards(new Set(cards.map((_, idx) => idx)));
      const initialSections = cards.reduce((acc, card, idx) => {
        const preferredSections = normalizeSections(card.sections);
        acc[idx] = preferredSections.length > 0 ? preferredSections : ['consultations'];
        return acc;
      }, {});
      setCardSections(initialSections);
      
      const assistantMessage = { 
        role: 'assistant', 
        content: savedCount > 0 
          ? `Generated ${cards.length} cards! Note: They've been auto-saved to Consultations as backup. Review them below and click Save to confirm (or they're already saved if you close).`
          : `Generated ${cards.length} cards from your request. Review and select the cards you want to save.`
      };
      setChatHistory([...newHistory, assistantMessage]);
      
      setProgress('');
    } catch (err) {
      setError(err.message || 'Failed to generate cards');
      setChatHistory(newHistory.slice(0, -1));
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCardSelection = (index) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedCards(newSelection);
  };

  const selectAll = () => {
    setSelectedCards(new Set(generatedCards.map((_, idx) => idx)));
  };

  const selectNone = () => {
    setSelectedCards(new Set());
  };

  const handleSaveCards = () => {
    if (selectedCards.size === 0) {
      setError('Please select at least one card to save.');
      return;
    }

    generatedCards.forEach((card, index) => {
      if (selectedCards.has(index)) {
        const sections = cardSections[index]?.length ? cardSections[index] : ['consultations'];
        sections.forEach((section) => {
          addCard({
            title: card.title,
            content: card.content,
            specialty: currentSpecialty,
            section,
            tags: [],
            color: 'blue',
            aiGenerated: true,
            aiSources: card.sources || []
          });
        });
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  const toggleCardSection = (index, sectionKey) => {
    setCardSections(prev => {
      const current = new Set(prev[index] || []);
      if (current.has(sectionKey)) {
        current.delete(sectionKey);
      } else {
        current.add(sectionKey);
      }
      return { ...prev, [index]: Array.from(current) };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">📚 Mass Card Generator</h2>
            <p className="text-sm text-gray-600 mt-1">
              {file ? `📄 ${file.name} - Chat to generate cards` : 'Upload a document or start chatting to generate multiple cards'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Section */}
          <div className="w-1/2 border-r flex flex-col">
            {/* File Upload Button */}
            <div className="p-4 border-b bg-gray-50">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 font-medium transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                📎 {file ? 'Change Document' : 'Upload Document'}
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && !file && (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-2">💬</div>
                  <div className="font-semibold">Upload a document or start chatting</div>
                  <div className="text-sm mt-2 space-y-1">
                    <div>Example: "Create cards for all pathologies with clinical findings and treatment"</div>
                    <div>Or: "Extract prescription protocols from this document"</div>
                  </div>
                </div>
              )}

              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.role === 'system'
                        ? 'bg-purple-50 text-gray-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">✨</div>
                      <span>{progress || 'Generating cards...'}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={file ? "Ask me to generate cards from the document...\n\nTip: Paste lists, describe what you want, give examples..." : "Type your request or upload a document first..."}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isProcessing}
                  rows="4"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !userInput.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors self-end h-fit"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Generated Cards Preview Panel */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Generated Cards Preview</h3>
                {isProcessing && totalChunks > 0 && (
                  <span className="text-sm font-semibold text-purple-600">
                    {cardsGenerated} cards • Chunk {currentChunk}/{totalChunks}
                  </span>
                )}
              </div>
              
              {isProcessing && totalChunks > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{progress || 'Processing...'}</span>
                    <span>{Math.round((currentChunk / totalChunks) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${(currentChunk / totalChunks) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {generatedCards.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <span>({selectedCards.size} of {generatedCards.length} selected)</span>
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={selectAll}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={selectNone}
                      className="text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Select None
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {generatedCards.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-gray-500">
                  <div>
                    <div className="text-4xl mb-2">📋</div>
                    <div className="font-semibold">No cards generated yet</div>
                    <div className="text-sm mt-2">
                      Chat on the left to generate cards from your document
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedCards.map((card, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg transition-all ${
                        selectedCards.has(index)
                          ? 'border-purple-400 bg-white shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="flex items-start gap-3 p-4 cursor-pointer"
                        onClick={() => toggleCardSelection(index)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCards.has(index)}
                          onChange={() => toggleCardSelection(index)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            {card.title}
                            <span className="text-xs text-purple-500">✨</span>
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCard(expandedCard === index ? null : index);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                          >
                            {expandedCard === index ? '▼ Hide Details' : '▶ Show Details'}
                          </button>
                        </div>
                      </div>
                      
                      {expandedCard === index && (
                        <div 
                          className="px-4 pb-4 border-t border-gray-200 pt-3 mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-2">Choose tabs for this card:</div>
                            <div className="flex flex-wrap gap-2">
                              {sectionKeys.map((key) => {
                                const isSelected = (cardSections[index] || []).includes(key);
                                return (
                                  <button
                                    key={key}
                                    onClick={() => toggleCardSection(index, key)}
                                    className={`px-2.5 py-1 text-xs rounded-full border transition ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                                    title={sectionTitles[key]}
                                  >
                                    {sectionTitles[key]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="prose prose-sm max-w-none select-text">
                            <div
                              className="text-sm text-gray-700 bg-white p-3 rounded border select-text"
                              dangerouslySetInnerHTML={{ __html: card.content }}
                            />
                            {card.sources && card.sources.length > 0 && (
                              <div className="text-xs text-gray-400 mt-3 pt-2 border-t">
                                <strong>Sources:</strong> {card.sources.join(', ')}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedCard(null)}
                            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                          >
                            ✕ Close
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {generatedCards.length > 0 && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCards}
              disabled={selectedCards.size === 0}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
            >
              Save {selectedCards.size} Card{selectedCards.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
