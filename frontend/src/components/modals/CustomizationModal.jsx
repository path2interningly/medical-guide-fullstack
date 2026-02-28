import { useState } from 'react';

const fontOptions = [
  { name: 'Inter', class: 'font-sans', style: { fontFamily: 'Inter, Helvetica, Arial, sans-serif' } },
  { name: 'Garamond', class: 'font-garamond', style: { fontFamily: 'Garamond, Georgia, serif' } },
  { name: 'Georgia', class: 'font-serif', style: { fontFamily: 'Georgia, Times New Roman, serif' } },
  { name: 'Courier New', class: 'font-courier', style: { fontFamily: 'Courier New, Courier, monospace' } },
  { name: 'Fira Mono', class: 'font-mono', style: { fontFamily: 'Fira Mono, Menlo, Monaco, monospace' } },
  { name: 'Oswald', class: 'font-display', style: { fontFamily: 'Oswald, Impact, sans-serif' } },
  { name: 'Comic Sans', class: 'font-handwriting', style: { fontFamily: 'Comic Sans MS, Caveat, cursive' } },
  { name: 'Playfair', class: 'font-stylistic', style: { fontFamily: 'Playfair Display, Garamond, serif' } },
  { name: 'Roboto', class: 'font-roboto', style: { fontFamily: 'Roboto, Arial, sans-serif' } },
  { name: 'Lato', class: 'font-lato', style: { fontFamily: 'Lato, Arial, sans-serif' } },
  { name: 'Montserrat', class: 'font-montserrat', style: { fontFamily: 'Montserrat, Arial, sans-serif' } },
  { name: 'Dyslexie', class: 'font-dyslexia', style: { fontFamily: 'OpenDyslexic, Arial, sans-serif' } },
  { name: 'Aptos', class: 'font-aptos', style: { fontFamily: 'Aptos, Calibri, Arial, sans-serif' } },
  { name: 'Times', class: 'font-times', style: { fontFamily: 'Times New Roman, Times, serif' } },
  { name: 'Menlo', class: 'font-menlo', style: { fontFamily: 'Menlo, Monaco, monospace' } },
];

const accentPalettes = [
  { name: 'Blue', colors: ['#2563eb', '#60a5fa'] },
  { name: 'Pink', colors: ['#ec4899', '#f472b6'] },
  { name: 'Green', colors: ['#059669', '#34d399'] },
  { name: 'Purple', colors: ['#7c3aed', '#c4b5fd'] },
  { name: 'Orange', colors: ['#f59e42', '#fbbf24'] },
  { name: 'Red', colors: ['#dc2626', '#fca5a5'] },
  { name: 'Teal', colors: ['#14b8a6', '#5eead4'] },
  { name: 'Yellow', colors: ['#facc15', '#fde68a'] },
  { name: 'Gray', colors: ['#6b7280', '#d1d5db'] },
  { name: 'Indigo', colors: ['#4f46e5', '#a5b4fc'] },
  { name: 'Cyan', colors: ['#06b6d4', '#a7f3d0'] },
  { name: 'Lime', colors: ['#84cc16', '#bef264'] },
  { name: 'Amber', colors: ['#f59e42', '#fbbf24'] },
  { name: 'Rose', colors: ['#f43f5e', '#fda4af'] },
  { name: 'Violet', colors: ['#8b5cf6', '#ddd6fe'] },
];

const categories = [
  { key: 'font', label: 'Font', gradient: 'from-pink-400 to-purple-400' },
  { key: 'accent', label: 'Accent', gradient: 'from-blue-400 to-green-400' },
  { key: 'background', label: 'Background', gradient: 'from-yellow-400 to-orange-400' },
  { key: 'button', label: 'Button', gradient: 'from-purple-400 to-pink-400' },
  { key: 'accessibility', label: 'Accessibility', gradient: 'from-gray-400 to-blue-400' },
];

export default function CustomizationModal({ isOpen, onClose, settings, onUpdate, onReset, onSaveTheme }) {
  const [activeCategory, setActiveCategory] = useState('font');
  const [previewSettings, setPreviewSettings] = useState(settings);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setPreviewSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate(previewSettings);
    onSaveTheme(previewSettings);
    onClose();
  };

  const handleReset = () => {
    setPreviewSettings({});
    onReset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-0 flex max-w-3xl w-full h-[600px]">
        {/* Sidebar Tabs */}
        <div className="flex flex-col w-40 h-full p-4 gap-2 border-r bg-gradient-to-b from-gray-50 to-gray-200">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`w-full py-2 px-3 rounded-lg font-semibold text-left bg-gradient-to-r ${cat.gradient} ${activeCategory === cat.key ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
          <button className="mt-8 py-2 px-3 rounded-lg font-semibold bg-red-100 text-red-700" onClick={handleReset}>Reset to Default</button>
        </div>
        {/* Main Customization Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Live Preview */}
          <div className="mb-6">
            <div className="rounded-lg shadow p-4" style={{ background: previewSettings.background || '#f9fafb' }}>
              <span style={{ color: previewSettings.textColor || '#1e293b', fontFamily: fontOptions.find(f => f.class === previewSettings.font)?.style.fontFamily || 'Inter' }}>
                Live Preview: The quick brown fox jumps over the lazy dog.
              </span>
              <button className={previewSettings.buttonStyle || 'btn-default'} style={{ marginLeft: 16 }}>Button</button>
            </div>
          </div>
          {/* Category Controls */}
          {activeCategory === 'font' && (
            <div>
              <h3 className="font-bold mb-2">Font</h3>
              <div className="grid grid-cols-2 gap-2">
                {fontOptions.map(font => (
                  <button
                    key={font.class}
                    style={font.style}
                    className={`w-full py-2 px-3 rounded border ${previewSettings.font === font.class ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-200'}`}
                    onClick={() => handleChange('font', font.class)}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeCategory === 'accent' && (
            <div>
              <h3 className="font-bold mb-2">Accent Palette</h3>
              <div className="grid grid-cols-3 gap-2">
                {accentPalettes.map(pal => (
                  <button
                    key={pal.name}
                    className={`w-full h-12 rounded-lg border ${previewSettings.accent === pal.name ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-200'}`}
                    style={{ background: `linear-gradient(90deg, ${pal.colors.join(', ')})` }}
                    onClick={() => handleChange('accent', pal.name)}
                  >
                    <span className="font-semibold text-white drop-shadow" style={{ textShadow: '0 1px 2px #0006' }}>{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeCategory === 'background' && (
            <div>
              <h3 className="font-bold mb-2">Background</h3>
              <div className="flex gap-2">
                <button className="bg-custom-solid w-20 h-12 rounded border" onClick={() => handleChange('background', '#f9fafb')}></button>
                <button className="bg-custom-gradient w-20 h-12 rounded border" onClick={() => handleChange('background', 'linear-gradient(90deg, #7c3aed, #059669, #2563eb, #f9fafb)')}></button>
                <button className="bg-custom-pattern w-20 h-12 rounded border" onClick={() => handleChange('background', 'repeating-linear-gradient(45deg, #e0e7ff, #e0e7ff 10px, #f9fafb 10px, #f9fafb 20px)')}></button>
                <button className="bg-custom-image w-20 h-12 rounded border" onClick={() => handleChange('background', 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80)')}></button>
                <button className="bg-custom-highlight w-20 h-12 rounded border" onClick={() => handleChange('background', '#fef3c7')}></button>
              </div>
            </div>
          )}
          {activeCategory === 'button' && (
            <div>
              <h3 className="font-bold mb-2">Button Style</h3>
              <div className="flex gap-2">
                <button className="btn-default" onClick={() => handleChange('buttonStyle', 'btn-default')}>Default</button>
                <button className="btn-rounded" onClick={() => handleChange('buttonStyle', 'btn-rounded')}>Rounded</button>
                <button className="btn-outline" onClick={() => handleChange('buttonStyle', 'btn-outline')}>Outline</button>
                <button className="btn-solid" onClick={() => handleChange('buttonStyle', 'btn-solid')}>Solid</button>
                <button className="btn-gradient" onClick={() => handleChange('buttonStyle', 'btn-gradient')}>Gradient</button>
              </div>
            </div>
          )}
          {activeCategory === 'accessibility' && (
            <div>
              <h3 className="font-bold mb-2">Accessibility</h3>
              <div className="flex gap-2">
                <button className="font-dyslexia border px-3 py-2 rounded" onClick={() => handleChange('font', 'font-dyslexia')}>Dyslexia-Friendly</button>
                <button className="font-mono border px-3 py-2 rounded" onClick={() => handleChange('font', 'font-mono')}>Monospace</button>
                <button className="bg-black text-white px-3 py-2 rounded" onClick={() => handleChange('background', '#000')}>High Contrast</button>
              </div>
            </div>
          )}
          <div className="mt-8 flex gap-4">
            <button className="btn-default" onClick={handleSave}>Save & Apply</button>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
