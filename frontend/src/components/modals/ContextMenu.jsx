import { useState, useEffect } from 'react';

export default function ContextMenu({ x, y, items, onClose }) {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Adjust position if menu goes off-screen
    const handlePositioning = () => {
      let newX = x;
      let newY = y;

      // Rough estimate for menu size
      if (x + 200 > window.innerWidth) {
        newX = window.innerWidth - 210;
      }
      if (y + items.length * 40 > window.innerHeight) {
        newY = window.innerHeight - items.length * 40 - 10;
      }

      setPosition({ x: newX, y: newY });
    };

    handlePositioning();
    window.addEventListener('resize', handlePositioning);
    return () => window.removeEventListener('resize', handlePositioning);
  }, [x, y, items.length]);

  useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[150px]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => {
            item.action();
            onClose();
          }}
          className="w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-800 text-sm first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
