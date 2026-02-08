import { useState, useEffect } from 'react';

export default function EditCardModal({ isOpen, onClose, onSave, card }) {
  const [formData, setFormData] = useState({
    title: { en: '', fr: '' },
    content: { en: '', fr: '' },
    tags: [],
    urgency: 'standard',
    references: []
  });

  useEffect(() => {
    if (card) {
      setFormData({
        ...formData,
        ...card,
        title: { en: card.title?.en || '', fr: card.title?.fr || '' },
        content: { en: card.content?.en || '', fr: card.content?.fr || '' },
        references: card.references || []
      });
    }
  }, [card]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Card</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Title (English)</label>
            <input
              type="text"
              value={formData.title?.en || ''}
              onChange={(e) => setFormData({
                ...formData,
                title: { ...formData.title, en: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title (French)</label>
            <input
              type="text"
              value={formData.title?.fr || ''}
              onChange={(e) => setFormData({
                ...formData,
                title: { ...formData.title, fr: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Content (English)</label>
            <textarea
              value={formData.content?.en || ''}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, en: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Content (French)</label>
            <textarea
              value={formData.content?.fr || ''}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, fr: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Urgency</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({...formData, urgency: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">References & Sources</label>
            {(formData.references || []).map((ref, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Source Name (e.g. UpToDate)"
                  value={ref.name || ''}
                  onChange={e => {
                    const refs = [...formData.references];
                    refs[idx] = { ...refs[idx], name: e.target.value };
                    setFormData({ ...formData, references: refs });
                  }}
                  className="px-2 py-1 border rounded w-1/3"
                />
                <input
                  type="text"
                  placeholder="Type (guideline, textbook, official, custom)"
                  value={ref.type || ''}
                  onChange={e => {
                    const refs = [...formData.references];
                    refs[idx] = { ...refs[idx], type: e.target.value };
                    setFormData({ ...formData, references: refs });
                  }}
                  className="px-2 py-1 border rounded w-1/4"
                />
                <input
                  type="text"
                  placeholder="URL or details"
                  value={ref.url || ref.details || ''}
                  onChange={e => {
                    const refs = [...formData.references];
                    if (ref.url) refs[idx].url = e.target.value;
                    else refs[idx].details = e.target.value;
                    setFormData({ ...formData, references: refs });
                  }}
                  className="px-2 py-1 border rounded w-1/3"
                />
                <button type="button" onClick={() => {
                  const refs = [...formData.references];
                  refs.splice(idx, 1);
                  setFormData({ ...formData, references: refs });
                }} className="px-2 py-1 bg-red-200 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setFormData({ ...formData, references: [...(formData.references || []), {}] })} className="px-3 py-1 bg-blue-200 rounded">Add Reference</button>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
