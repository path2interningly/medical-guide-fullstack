import { useState } from 'react';

export default function AICardChat({ specialty, section, onCreateCard, onClose, editingCard }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: `I'll help you create a ${specialty} card for the ${section} section. Describe what you'd like the card to contain, and I'll generate it with the formatting you specify (tables, bullet points, algorithms, etc.).`
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastGenerated, setLastGenerated] = useState({ title: '', content: '' });

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const generatedTitle = generateTitle(input);
      const generatedContent = generateContent(input);
      setLastGenerated({ title: generatedTitle, content: generatedContent });
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: `I've generated a card based on your description. Here's a draft. If you want a specific format (table, bullets, algorithm), tell me and I'll revise it.\n\n**Title**: ${generatedTitle}\n\n**Content**: ${generatedContent}`
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleCreateCard = () => {
    const title = lastGenerated.title || generateTitle(messages[messages.length - 1]?.text || '');
    const content = lastGenerated.content || generateContent(messages[messages.length - 1]?.text || '');

    setIsSaving(true);
    onCreateCard({
      id: editingCard?.id || Date.now().toString(),
      title: { en: title, fr: editingCard?.title?.fr || '' },
      content: { en: content, fr: editingCard?.content?.fr || '' },
      contentType: 'text',
      references: editingCard?.references || [],
      specialty,
      section,
      favorite: editingCard?.favorite || false,
      createdAt: editingCard?.createdAt || new Date().toISOString(),
      urgency: editingCard?.urgency || 'standard',
      tags: editingCard?.tags || []
    });
    setIsSaving(false);
  };

  const generateTitle = (text) => {
    const words = text.split(' ').slice(0, 6).join(' ').trim();
    return words.length > 0 ? words : 'New Card';
  };

  const generateContent = (text) => {
    const trimmed = text.trim();
    return trimmed;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold">✨ AI Card Generator</h2>
          <p className="text-sm opacity-90">Create cards with AI assistance</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe the card content..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              Send
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCard}
              disabled={messages.filter(m => m.type === 'ai').length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {isSaving ? 'Saving...' : 'Create Card'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
