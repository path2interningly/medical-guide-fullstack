import { useState, useEffect } from 'react';
import { useCards } from '../../context/CardsContext';
import CardDetailModal from '../modals/CardDetailModal';

export default function MedicalCard({ card, onEdit, onDelete, onMenu, onCopy }) {
    const [isPublic, setIsPublic] = useState(card.isPublic || false);

    const handleMakePublic = async (e) => {
      e.stopPropagation();
      // TODO: Add API call to publish card
      setIsPublic(true);
      // Optionally notify user
      alert('Card is now public!');
    };
  const { toggleFavorite, isFavorite, trackRecent } = useCards();
  const [note, setNote] = useState(() => {
    return localStorage.getItem(`card-note-${card.id}`) || '';
  });
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Abbreviate reference names for compact display
  const abbreviateReference = (refName) => {
    if (!refName) return '';
    const name = typeof refName === 'string' ? refName : refName.name || refName.type || '';
    
    // Common abbreviations
    const abbrevMap = {
      'uptodate': 'UtD',
      'toronto notes': 'TN',
      'uspstf': 'USPSTF',
      'sogc': 'SOGC',
      'asccp': 'ASCCP',
      'acog': 'ACOG',
      'who': 'WHO',
      'cdc': 'CDC',
      'nejm': 'NEJM',
      'jama': 'JAMA',
      'bmj': 'BMJ',
      'cochrane': 'Cochrane',
      'nice': 'NICE',
      'idsa': 'IDSA',
      'aap': 'AAP',
      'aha': 'AHA',
      'acc': 'ACC',
      'esc': 'ESC'
    };

    // Try to match known abbreviations
    const lowerName = name.toLowerCase();
    for (const [key, abbrev] of Object.entries(abbrevMap)) {
      if (lowerName.includes(key)) {
        return abbrev;
      }
    }

    // If no match, create abbreviation from first letters of significant words
    const words = name.split(/[\s-]+/).filter(w => w.length > 2 && !['the', 'and', 'guidelines', 'recommendations'].includes(w.toLowerCase()));
    if (words.length > 0) {
      return words.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
    }

    return name.slice(0, 4);
  };

  // Get abbreviated sources for display
  const getAbbreviatedSources = () => {
    const sources = card.aiSources || card.references || [];
    if (sources.length === 0) return null;
    
    const abbreviated = sources.map(s => abbreviateReference(s));
    const maxDisplay = 3;
    
    if (abbreviated.length > maxDisplay) {
      return abbreviated.slice(0, maxDisplay).join(', ') + ', +' + (abbreviated.length - maxDisplay);
    }
    return abbreviated.join(', ');
  };

  // Replace base64 images with emoji in preview
  const getPreviewContent = () => {
    const content = card.content?.en || card.content?.fr || card.content || '';
    
    // Check if content contains base64 images
    if (content.includes('data:image') || content.includes('base64')) {
      const withoutImages = content
        .replace(/<img[^>]*>/gi, ' 🖼️ [Image] ')
        .replace(/<[^>]+>/g, ' ') // Replace HTML tags with space to preserve word boundaries
        .replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '🖼️ [Image]');
      return withoutImages;
    }
    
    // For AI-generated cards, preserve line breaks and structure
    const withLineBreaks = content
      .replace(/<br\s*\/?>/gi, '\n')  // Convert <br> to newlines
      .replace(/<\/p>/gi, '\n\n')      // Convert </p> to double newlines
      .replace(/<\/div>/gi, '\n')      // Convert </div> to newlines
      .replace(/<\/li>/gi, '\n')       // Convert </li> to newlines
      .replace(/<li[^>]*>/gi, '• ')     // Convert <li> to bullets
      .replace(/<[^>]+>/g, '')          // Remove remaining HTML tags
      .replace(/\n{3,}/g, '\n\n')      // Normalize multiple newlines
      .trim();
    
    return withLineBreaks;
  };

  useEffect(() => {
    localStorage.setItem(`card-note-${card.id}`, note);
  }, [note, card.id]);

  const handleEdit = () => {
    trackRecent(card.id);
    onEdit(card);
  };

  const handleCardClick = () => {
    trackRecent(card.id);
    setShowDetailModal(true);
  };

  const urgencyColors = {
    standard: 'bg-white border-gray-200',
    high: 'bg-yellow-50 border-yellow-300',
    urgent: 'bg-red-50 border-red-300'
  };

  const urgencyBadges = {
    standard: '',
    high: ' Élevée',
    urgent: ' URGENT'
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`p-5 rounded-xl border-2 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${urgencyColors[card.urgency]}`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg flex-1 pr-2 text-gray-900 leading-tight">
            {card.title?.en || card.title?.fr || card.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getAbbreviatedSources() && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200" title="Click to see full sources">
                {getAbbreviatedSources()}
              </span>
            )}
          {onMenu && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenu(e);
              }}
              className="text-lg text-gray-500 hover:text-gray-700 transition"
              title="Click for options: Copy, Edit, Delete"
            >
              ⋯
            </button>
          )}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNoteTooltip(!showNoteTooltip);
              }}
              className="text-lg text-gray-400 hover:text-gray-600 transition"
              title={note ? 'View notes' : 'Add notes'}
            >
              💬
            </button>
            {showNoteTooltip && (
              <div className="absolute right-0 top-8 bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 shadow-lg">
                <p className="mb-1 font-semibold">Personal Notes:</p>
                <textarea
                  value={note}
                  onChange={(e) => {
                    e.stopPropagation();
                    setNote(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Add your notes here..."
                  className="w-full px-1 py-1 border rounded h-12 text-xs text-black"
                />
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(card.id);
            }}
            className={`text-xl transition hover:scale-125 ${isFavorite(card.id) ? 'text-yellow-500' : 'text-gray-400'}`}
            title={isFavorite(card.id) ? 'Bookmarked' : 'Bookmark'}
          >
            {isFavorite(card.id) ? '★' : '☆'}
          </button>
          {/* Make Public Button */}
          {!isPublic && (
            <button
              onClick={handleMakePublic}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-200 transition"
              title="Make this card public"
            >
              🌐 Make Public
            </button>
          )}
          {isPublic && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200" title="This card is public">
              🌐 Public
            </span>
          )}
        </div>
      </div>

      {card.urgency && urgencyBadges && card.urgency !== 'standard' && urgencyBadges[card.urgency] && (
        <div className="mb-2 text-sm font-semibold text-red-600">
          {urgencyBadges[card.urgency]}
        </div>
      )}

      <div className="text-sm text-gray-700 mb-3 leading-relaxed h-20 overflow-hidden relative select-text">
        <div 
          className="prose prose-sm max-w-none prose-headings:my-1 prose-p:my-1 prose-li:my-0 prose-li:leading-snug [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-blue-700 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_table]:text-xs [&_table]:border-collapse [&_table_th]:bg-gray-100 [&_table_td]:border [&_table_th]:border [&_ul]:ml-3 [&_ol]:ml-3 [&_li]:text-xs select-text"
          dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {card.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {card.tags.map((tag, idx) => (
            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Click hint */}
      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200 text-center">
        Click to expand →
      </div>
    </div>

    {/* Detail Modal */}
    <CardDetailModal 
      card={card}
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      onContinueWithAI={() => {
        setShowDetailModal(false);
        onEdit?.(card, 'ai');
      }}
      onManualEdit={() => {
        setShowDetailModal(false);
        onEdit?.(card, 'manual');
      }}
    />
    </>
  );
}
