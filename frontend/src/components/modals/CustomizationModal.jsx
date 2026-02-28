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
  { name: 'Aptos', class: 'font-aptos', style: { fontFamily: 'Aptos, Calibri, Arial, sans-serif' } },
  { name: 'Times', class: 'font-times', style: { fontFamily: 'Times New Roman, Times, serif' } },
  { name: 'Menlo', class: 'font-menlo', style: { fontFamily: 'Menlo, Monaco, monospace' } },
  { name: 'Pacifico', class: 'font-pacifico', style: { fontFamily: 'Pacifico, cursive' } },
  { name: 'Dancing Script', class: 'font-dancing', style: { fontFamily: 'Dancing Script, cursive' } },
  { name: 'Lobster', class: 'font-lobster', style: { fontFamily: 'Lobster, cursive' } },
  { name: 'Amatic SC', class: 'font-amatic', style: { fontFamily: 'Amatic SC, cursive' } },
  { name: 'Great Vibes', class: 'font-greatvibes', style: { fontFamily: 'Great Vibes, cursive' } },
  { name: 'Parisienne', class: 'font-parisienne', style: { fontFamily: 'Parisienne, cursive' } },
  { name: 'Satisfy', class: 'font-satisfy', style: { fontFamily: 'Satisfy, cursive' } },
  { name: 'California Poppy', class: 'font-california-poppy', style: { fontFamily: 'California Poppy, cursive' } },
  { name: 'African Daisy', class: 'font-african-daisy', style: { fontFamily: 'African Daisy, cursive' } },
  { name: 'Evening Primrose', class: 'font-evening-primrose', style: { fontFamily: 'Evening Primrose, cursive' } },
  { name: 'Desert Rose', class: 'font-desert-rose', style: { fontFamily: 'Desert Rose, cursive' } },
  { name: 'English Bluebell', class: 'font-english-bluebell', style: { fontFamily: 'English Bluebell, cursive' } },
  { name: 'Coral Bells', class: 'font-coral-bells', style: { fontFamily: 'Coral Bells, cursive' } },
  { name: 'French Marigold', class: 'font-french-marigold', style: { fontFamily: 'French Marigold, cursive' } },
  { name: 'Grape Hyacinth', class: 'font-grape-hyacinth', style: { fontFamily: 'Grape Hyacinth, cursive' } },
  { name: 'Dutch Iris', class: 'font-dutch-iris', style: { fontFamily: 'Dutch Iris, cursive' } },
  { name: 'Kallir Lily', class: 'font-kallir-lily', style: { fontFamily: 'Kallir Lily, cursive' } },
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
];

const gradientPatterns = [
  { name: 'Vertical', css: direction => `linear-gradient(180deg, ${direction})` },
  { name: 'Horizontal', css: direction => `linear-gradient(90deg, ${direction})` },
  { name: 'Diagonal', css: direction => `linear-gradient(45deg, ${direction})` },
  { name: 'Radial', css: direction => `radial-gradient(circle, ${direction})` },
  { name: 'Donut', css: direction => `radial-gradient(ellipse at center, ${direction})` },
];

const sampleImages = [
  { name: 'Nature', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'City', url: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=800&q=80' },
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
      <div className="rounded-lg shadow-2xl p-0 flex max-w-3xl w-full h-[600px]" style={{ background: 'var(--palette-color1)', color: 'var(--palette-color2)', fontFamily: 'var(--custom-font, inherit)' }}>
        {/* Sidebar Tabs */}
        <div className="flex flex-col w-40 h-full p-4 gap-2 border-r bg-gradient-to-b from-gray-50 to-gray-200">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`w-full py-2 px-3 rounded-lg font-semibold text-left`}
              style={{ background: 'var(--palette-color3)', color: 'var(--palette-color4)', fontFamily: 'var(--custom-font, inherit)', boxShadow: activeCategory === cat.key ? '0 0 0 2px var(--palette-color5)' : 'none' }}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
          <button className="mt-8 py-2 px-3 rounded-lg font-semibold" style={{ background: 'var(--palette-color6)', color: 'var(--palette-color7)', fontFamily: 'var(--custom-font, inherit)' }} onClick={handleReset}>Reset to Default</button>
        </div>
        {/* Main Customization Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Live Preview */}
          <div className="mb-6">
            <div className="rounded-lg shadow p-4" style={{ background: 'var(--palette-color8)', color: 'var(--palette-color9)', fontFamily: 'var(--custom-font, inherit)' }}>
              <span style={{ color: 'var(--palette-color10)', fontFamily: 'var(--custom-font, inherit)', fontSize: '1.25rem', fontWeight: 600 }}>
                Med in a Pocket
              </span>
              <button style={{ marginLeft: 16, background: 'var(--palette-color11)', color: 'var(--palette-color12)', fontFamily: 'var(--custom-font, inherit)', borderRadius: '8px', padding: '0.5rem 1rem', border: 'none', fontWeight: 500 }}>
                Sample Button
              </button>
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
              <div className="grid grid-cols-2 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex gap-1">
                    {[0,1,2,3].map(j => (
                      <input key={j} type="color" value={previewSettings[`accent${i}_${j}`] || '#ffffff'} onChange={e => handleChange(`accent${i}_${j}`, e.target.value)} className="w-8 h-8 border rounded" />
                    ))}
                    <button className="btn-outline ml-2" onClick={() => handleChange('accent', [`accent${i}_0`, `accent${i}_1`, `accent${i}_2`, `accent${i}_3`].map(k => previewSettings[k] || '#fff'))}>Apply</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeCategory === 'background' && (
            <div>
              <h3 className="font-bold mb-2">Background</h3>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Gradient Pattern</label>
                <div className="flex gap-2 mb-2">
                  {gradientPatterns.map(pattern => (
                    <button key={pattern.name} className="px-3 py-2 rounded border" onClick={() => handleChange('gradientPattern', pattern.name)}>
                      {pattern.name}
                    </button>
                  ))}
                </div>
                <label className="block font-semibold mb-2">Gradient Colors</label>
                <div className="flex gap-2 mb-2">
                  {[0,1,2,3].map(i => (
                    <input key={i} type="color" value={previewSettings[`gradientColor${i}`] || '#ffffff'} onChange={e => handleChange(`gradientColor${i}`, e.target.value)} className="w-10 h-10 border rounded" />
                  ))}
                </div>
                <button className="btn-outline mb-4" onClick={() => handleChange('background', gradientPatterns.find(p => p.name === previewSettings.gradientPattern)?.css([0,1,2,3].map(i => previewSettings[`gradientColor${i}`] || '#fff').join(', ')))}>
                  Apply Gradient
                </button>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Sample Images</label>
                <div className="flex gap-2 mb-2">
                  {sampleImages.map(img => (
                    <button key={img.name} className="w-20 h-12 rounded border bg-cover bg-center" style={{ backgroundImage: `url(${img.url})` }} onClick={() => handleChange('background', `url(${img.url})`)}></button>
                  ))}
                </div>
                <label className="block font-semibold mb-2">Upload Image</label>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => handleChange('background', `url(${ev.target.result})`);
                    reader.readAsDataURL(file);
                  }
                }} />
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
