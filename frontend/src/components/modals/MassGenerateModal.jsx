import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateMultipleCards } from '../../services/ai';
import { useCards } from '../../context/CardsContext';

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
  const [expandedCard, setExpandedCard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setExtractedText('');
      setChatHistory([]);
      setUserInput('');
      setGeneratedCards([]);
      setSelectedCards(new Set());
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
    let contextPrompt = userInput.trim();
    if (extractedText) {
      contextPrompt = `Based on this document:\n\n${extractedText.substring(0, 15000)}\n\n${userInput.trim()}`;
    }

    const userMessage = { role: 'user', content: userInput.trim() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setIsProcessing(true);
    setError('');

    try {
      const cards = await generateMultipleCards(
        contextPrompt,
        extractedText ? 'document' : 'prompt',
        (msg) => setProgress(msg)
      );

      setGeneratedCards(cards);
      setSelectedCards(new Set(cards.map((_, idx) => idx)));
      
      const assistantMessage = { 
        role: 'assistant', 
        content: `Generated ${cards.length} cards from your request. Review and select the cards you want to save.`
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
        addCard({
          title: card.title,
          content: card.content,
          specialty: currentSpecialty,
          tags: [],
          color: 'blue',
          aiGenerated: true,
          aiSources: card.sources || []
        });
      }
    });

    onClose();
  };

  if (!isOpen) return null;

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
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={file ? "Ask me to generate cards from the document..." : "Type your request or upload a document first..."}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !userInput.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Generated Cards Preview Panel */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h3 className="text-lg font-bold text-gray-800">Generated Cards Preview</h3>
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
                          <div className="prose prose-sm max-w-none">
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {card.content}
                            </div>
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
