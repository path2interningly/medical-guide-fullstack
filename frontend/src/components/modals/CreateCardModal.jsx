import { useState, useEffect, useRef } from 'react';
import { generateCardContent } from '../../services/ai';
import RichTextEditor from '../editor/RichTextEditor';

export default function CreateCardModal({ specialty, section, onCreateCard, onClose, editingCard }) {
  const [mode, setMode] = useState(editingCard?.chatHistory ? 'ai' : 'select');
  const [chatHistory, setChatHistory] = useState(editingCard?.chatHistory || []);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Card preview state
  const [previewCard, setPreviewCard] = useState(editingCard ? {
    title: editingCard.title?.en || editingCard.title?.fr || editingCard.title,
    content: editingCard.content?.en || editingCard.content?.fr || editingCard.content,
    sources: editingCard.aiSources || [],
    aiGenerated: editingCard.aiGenerated || false
  } : null);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showTemplates, setShowTemplates] = useState(!editingCard);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick template suggestions for common medical topics
  const templates = [
    {
      emoji: '💊',
      title: 'Pharmacology',
      prompt: 'Pharmacokinetics and pharmacodynamics of [medication name]',
      placeholder: 'e.g., metformin, lisinopril'
    },
    {
      emoji: '🔍',
      title: 'Differential Diagnosis',
      prompt: 'Differential diagnosis and workup for [chief complaint/presentation]',
      placeholder: 'e.g., acute abdominal pain, dyspnea'
    },
    {
      emoji: '⚡',
      title: 'Emergency Protocol',
      prompt: 'Emergency management protocol for [condition]',
      placeholder: 'e.g., anaphylaxis, STEMI, stroke'
    },
    {
      emoji: '🩺',
      title: 'Clinical Approach',
      prompt: 'Clinical approach and management of [disease/condition]',
      placeholder: 'e.g., diabetes type 2, COPD exacerbation'
    },
    {
      emoji: '🧪',
      title: 'Lab Interpretation',
      prompt: 'Interpretation and workup of [abnormal lab finding]',
      placeholder: 'e.g., elevated troponin, hyponatremia'
    },
    {
      emoji: '📋',
      title: 'Physical Exam',
      prompt: 'Physical examination findings and clinical signs of [condition]',
      placeholder: 'e.g., heart failure, appendicitis'
    }
  ];

  const handleTemplateSelect = (template, customText) => {
    const finalPrompt = template.prompt.replace('[medication name]', customText)
      .replace('[chief complaint/presentation]', customText)
      .replace('[condition]', customText)
      .replace('[disease/condition]', customText)
      .replace('[abnormal lab finding]', customText);
    setUserInput(finalPrompt);
    setShowTemplates(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: userInput.trim() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setIsGenerating(true);
    setError(null);

    try {
      let streamedContent = '';
      
      // Pass existing content if editing
      const currentContent = previewCard ? {
        title: previewCard.title,
        content: previewCard.content
      } : null;
      
      const result = await generateCardContent(
        userInput.trim(),
        chatHistory,
        (chunk) => {
          streamedContent += chunk;
          // Update preview in real-time
          const parsed = parseStreamingContent(streamedContent);
          setPreviewCard(prev => ({
            ...prev,
            ...parsed,
            aiGenerated: true
          }));
        },
        currentContent
      );

      // Final update with complete response
      setPreviewCard({
        title: result.title,
        content: result.content,
        sources: result.sources,
        aiGenerated: true
      });

      const assistantMessage = { role: 'assistant', content: result.fullResponse };
      setChatHistory([...newHistory, assistantMessage]);
    } catch (err) {
      setError(err.message);
      setChatHistory(newHistory.slice(0, -1)); // Remove user message on error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (!previewCard) return;

    const cardData = {
      title: previewCard.title,
      content: previewCard.content,
      specialty,
      section,
      references: previewCard.sources.map(s => ({ name: s })),
      aiGenerated: previewCard.aiGenerated,
      aiSources: previewCard.sources,
      chatHistory: chatHistory,
      contentType: 'text'
    };

    if (editingCard) {
      // Update existing card
      onCreateCard({ ...editingCard, ...cardData });
    } else {
      onCreateCard(cardData);
    }
    onClose();
  };

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    setEditedTitle(previewCard.title);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      setPreviewCard(prev => ({ ...prev, title: editedTitle.trim(), aiGenerated: false }));
    }
    setIsEditingTitle(false);
  };

  const handleManualEdit = () => {
    // AI content is already HTML, no conversion needed
    setMode('manual');
  };

  // Helper to parse streaming content in real-time
  const parseStreamingContent = (text) => {
    let title = '';
    let content = text;
    let sources = [];

    const titleMatch = text.match(/^TITLE:\s*(.+?)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      content = content.replace(/^TITLE:\s*.+?\n/m, '').trim();
    }

    const sourcesMatch = text.match(/SOURCES:\s*(.+?)$/m);
    if (sourcesMatch) {
      sources = sourcesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      content = content.replace(/\nSOURCES:\s*.+?$/m, '').trim();
    }

    return { title, content, sources };
  };

  // Render preview content with proper HTML formatting
  const renderPreviewContent = (content) => {
    if (!content) return '';
    
    // Convert markdown-style sections to HTML
    let html = content
      .replace(/^([A-Z][A-Z\s]+)$/gm, '<h3 style="color: #2563eb; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em;">$1</h3>')
      .replace(/^• (.+)$/gm, '<li style="margin-left: 1.5em;">$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-left: 1.5em; list-style-type: decimal;">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>');
    
    return html;
  };

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6">Create New Card</h2>
          <div className="space-y-3">
            <button
              onClick={() => setMode('ai')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-left"
            >
              ✨ Create with AI
              <div className="text-xs opacity-90 mt-1">Chat-based card generation</div>
            </button>
            <button
              onClick={() => setMode('manual')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-left"
            >
              📝 Create Manually
              <div className="text-xs opacity-90 mt-1">Traditional form entry</div>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // AI Chat Mode - Integrated Interface
  if (mode === 'ai') {
    const isEditingMode = !!editingCard;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <h2 className="text-2xl font-bold">✨ {isEditingMode ? 'Enhance Card with AI' : 'Generate Card with AI'}</h2>
              <p className="text-xs text-gray-500 mt-1">{isEditingMode ? 'Add or modify existing content' : 'Create from scratch via AI chat'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Chat Section */}
            <div className="w-1/2 border-r flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="text-4xl mb-2">💬</div>
                    <div className="font-semibold">Start a conversation</div>
                    <div className="text-sm mt-2">
                      Example: "detailed algorithm of pap test and HPV results for colposcopy"
                    </div>
                  </div>
                )}

                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">✨</div>
                        <span>Generating...</span>
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
              <div className="p-4 border-t">
                {/* Quick Templates */}
                {showTemplates && chatHistory.length === 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-blue-700">Quick Start Templates</span>
                      <button onClick={() => setShowTemplates(false)} className="text-blue-600 text-xs hover:underline">Hide</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {templates.map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const input = prompt(`${template.emoji} ${template.title}\n\n${template.prompt}\n\nEnter: ${template.placeholder}`);
                            if (input?.trim()) handleTemplateSelect(template, input.trim());
                          }}
                          className="p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 text-left transition-colors"
                        >
                          <div className="text-lg mb-1">{template.emoji}</div>
                          <div className="text-xs font-medium text-gray-700">{template.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!showTemplates && chatHistory.length === 0 && (
                  <button onClick={() => setShowTemplates(true)} className="text-xs text-blue-600 hover:underline mb-2">
                    Show templates
                  </button>
                )}
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
                    placeholder={previewCard ? "Add to this card or ask for changes..." : "Describe the card you want to create..."}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isGenerating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="w-1/2 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                {!previewCard ? (
                  <div className="text-center text-gray-400 mt-12">
                    <div className="text-5xl mb-3">📄</div>
                    <div className="font-semibold">Preview will appear here</div>
                    <div className="text-sm mt-2">Start chatting with AI to generate a card</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      {isEditingTitle ? (
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onBlur={handleTitleSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTitleSave();
                            if (e.key === 'Escape') setIsEditingTitle(false);
                          }}
                          autoFocus
                          className="w-full text-2xl font-bold border-b-2 border-blue-500 outline-none"
                        />
                      ) : (
                        <h3
                          onDoubleClick={handleTitleDoubleClick}
                          className="text-2xl font-bold cursor-pointer hover:text-blue-600 flex items-center gap-2"
                          title="Double-click to edit"
                        >
                          {previewCard.title}
                          {previewCard.aiGenerated && (
                            <span className="text-sm text-purple-500">✨</span>
                          )}
                        </h3>
                      )}
                      
                      {previewCard.sources.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Sources: {previewCard.sources.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-li:my-0 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-blue-700 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_span]:inline [&_table]:text-xs [&_table]:border-collapse [&_table]:w-full [&_table_th]:bg-blue-100 [&_table_th]:border [&_table_th]:border-gray-300 [&_table_td]:border [&_table_td]:border-gray-300 [&_ul]:ml-4 [&_ol]:ml-4 select-text">
                      <div 
                        className="text-sm text-gray-700 bg-white p-4 rounded border space-y-2 select-text"
                        dangerouslySetInnerHTML={{ __html: previewCard.content }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {previewCard && (
                <div className="p-4 border-t space-y-2 bg-gray-50">
                  <button
                    onClick={handleAccept}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  >
                    ✓ Accept & Save Card
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleManualEdit}
                      className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      ✏️ Fine-tune Manually
                    </button>
                    <button
                      onClick={() => setPreviewCard(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                      🔄 Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manual mode - keeping existing functionality
  return <ManualCardForm specialty={specialty} section={section} onCreateCard={onCreateCard} onClose={onClose} editingCard={previewCard || editingCard} onBack={() => setMode('select')} />;
}

function ManualCardForm({ specialty, section, onCreateCard, onClose, editingCard, onBack }) {
  const [title, setTitle] = useState(editingCard?.title?.en || editingCard?.title || '');
  const [content, setContent] = useState(editingCard?.content?.en || editingCard?.content || '');
  const [references, setReferences] = useState(editingCard?.references || editingCard?.aiSources || []);
  const [newRef, setNewRef] = useState('');

  const handleAddReference = () => {
    if (newRef.trim()) {
      setReferences([...references, newRef.trim()]);
      setNewRef('');
    }
  };

  const handleRemoveReference = (idx) => {
    setReferences(references.filter((_, i) => i !== idx));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      setIsSaving(true);
      onCreateCard({
        id: editingCard?.id || Date.now().toString(),
        title,
        content,
        references,
        aiSources: references,
        specialty,
        section,
        favorite: editingCard?.favorite || false,
        createdAt: editingCard?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        urgency: editingCard?.urgency || 'standard',
        tags: editingCard?.tags || [],
        aiGenerated: false
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📝 Document Editor</h2>
            <p className="text-sm text-gray-500 mt-1">Full-featured editor with Word-like capabilities</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 text-sm">Card Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full px-4 py-2.5 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Rich Text Editor for Content */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700 text-sm">
              Content * 
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start typing your medical card content..."
            />
          </div>

          {/* References & Sources */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">References & Sources</label>
            <div className="space-y-2 mb-3">
              {references.map((ref, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="flex-1 text-sm">{typeof ref === 'string' ? ref : ref.name}</span>
                  <button
                    onClick={() => handleRemoveReference(idx)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddReference()}
                placeholder="Add a reference or source (e.g., UpToDate, SOGC 2024)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddReference}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
          {onBack && (
            <button
              onClick={() => {setMode('ai');}}
              className="px-5 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium transition-colors"
            >
              ← Back to AI Mode
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            {isSaving ? 'Saving...' : (editingCard?.id ? 'Update Card' : 'Create Card')}
          </button>
        </div>
      </div>
    </div>
  );
}
