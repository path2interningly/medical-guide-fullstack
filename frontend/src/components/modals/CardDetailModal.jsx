import React, { useState, useEffect } from 'react';
import { exportCardToPDF } from '../../services/pdfExport';

/**
 * CardDetailModal - Shows full card content with formatting
 * Parses content for visual enhancement (color-coded sections, icons, diagrams)
 */
export default function CardDetailModal({ card, isOpen, onClose, onContinueWithAI, onManualEdit }) {
  const [isExporting, setIsExporting] = useState(false);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Load Mermaid for diagrams
  useEffect(() => {
    if (isOpen && !mermaidLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
      script.async = true;
      script.onload = () => {
        window.mermaid?.contentLoaded();
        setMermaidLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [isOpen, mermaidLoaded]);

  useEffect(() => {
    if (isOpen && mermaidLoaded) {
      window.mermaid?.contentLoaded();
    }
  }, [isOpen, mermaidLoaded, card?.content]);

  if (!isOpen || !card) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportCardToPDF(card, `${card.title}.pdf`);
    } catch (error) {
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Enhanced content rendering with section styling
  const renderContent = (content) => {
    if (!content) return null;

    const raw = typeof content === 'string' ? content : (content.en || content.fr || content);

    // If content already contains HTML tags, keep it as-is
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      return raw;
    }

    const sectionStyles = {
      'INITIAL ASSESSMENT': 'bg-blue-50 border-l-4 border-blue-500',
      'IMMEDIATE STEPS': 'bg-orange-50 border-l-4 border-orange-500',
      'RED FLAGS': 'bg-red-50 border-l-4 border-red-500',
      'DIAGNOSIS': 'bg-purple-50 border-l-4 border-purple-500',
      'MANAGEMENT': 'bg-green-50 border-l-4 border-green-500',
      'MONITORING': 'bg-yellow-50 border-l-4 border-yellow-500',
      'FOLLOW-UP': 'bg-indigo-50 border-l-4 border-indigo-500',
      'ALGORITHM': 'bg-gray-50 border-l-4 border-gray-500',
      'KEY POINTS': 'bg-teal-50 border-l-4 border-teal-500',
      'WORKUP': 'bg-slate-50 border-l-4 border-slate-500',
      'PEARLS': 'bg-cyan-50 border-l-4 border-cyan-500',
      'PITFALLS': 'bg-rose-50 border-l-4 border-rose-500'
    };

    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const buildMermaid = (lines) => {
      const edges = [];
      const nodeMap = new Map();

      const getNode = (label) => {
        const key = label.trim();
        if (!nodeMap.has(key)) {
          nodeMap.set(key, `n_${nodeMap.size + 1}`);
        }
        return nodeMap.get(key);
      };

      lines.forEach((line) => {
        const cleaned = line.replace(/^[•\-\*\s]+/, '');
        const parts = cleaned.split(/->|→/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          for (let i = 0; i < parts.length - 1; i++) {
            const from = parts[i];
            const to = parts[i + 1];
            edges.push({ from, to });
          }
        }
      });

      if (edges.length === 0) return '';

      const linesOut = ['graph TD'];
      edges.forEach(({ from, to }) => {
        const fromId = getNode(from);
        const toId = getNode(to);
        linesOut.push(`${fromId}[${from}]-->${toId}[${to}]`);
      });
      return linesOut.join('\n');
    };

    const buildTable = (tableLines) => {
      const rows = tableLines
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0));

      if (rows.length === 0) return '';

      const isSeparator = (row) => row.every(cell => /^-+$/.test(cell));
      const header = rows.length > 1 && isSeparator(rows[1]) ? rows[0] : null;
      const bodyRows = header ? rows.slice(2) : rows;

      const thead = header
        ? `<thead><tr>${header.map(h => `<th class=\"px-4 py-3 bg-blue-100 border border-gray-300 font-bold text-left\">${h}</th>`).join('')}</tr></thead>`
        : '';

      const tbody = `<tbody>${bodyRows.map((row, idx) => `<tr class=\"${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}\">${row.map(cell => `<td class=\"px-4 py-3 border border-gray-300\">${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;

      return `<div class=\"overflow-x-auto my-4\"><table class=\"w-full border-collapse border border-gray-300 rounded\">${thead}${tbody}</table></div>`;
    };

    const buildHtmlFromLines = (lines, sectionTitle) => {
      let htmlOut = '';
      let listType = null;
      let listItems = [];
      let tableBuffer = [];
      let mermaidBuffer = [];

      const flushList = () => {
        if (listItems.length === 0) return;
        const tag = listType === 'ol' ? 'ol' : 'ul';
        htmlOut += `<${tag} class=\"ml-6 mb-3 space-y-1\">${listItems.join('')}</${tag}>`;
        listItems = [];
        listType = null;
      };

      const flushTable = () => {
        if (tableBuffer.length === 0) return;
        flushList();
        htmlOut += buildTable(tableBuffer);
        tableBuffer = [];
      };

      const flushMermaid = () => {
        if (mermaidBuffer.length === 0) return;
        flushList();
        const mermaid = buildMermaid(mermaidBuffer);
        if (mermaid) {
          htmlOut += `<div class=\"my-4 p-3 bg-gray-50 border rounded\"><div class=\"text-sm text-gray-600 mb-2 font-semibold\">Flowchart</div><div class=\"mermaid\">${mermaid}</div></div>`;
        } else {
          htmlOut += `<pre class=\"bg-gray-50 border border-gray-200 rounded p-3 text-xs whitespace-pre-wrap\">${mermaidBuffer.join('\n')}</pre>`;
        }
        mermaidBuffer = [];
      };

      lines.forEach((line) => {
        if (!line) return;

        const isTableLine = line.includes('|') && line.split('|').length >= 3;
        const isArrowLine = line.includes('->') || line.includes('→');
        const isNumbered = /^\d+(\.\d+)*\.?\s+/.test(line);
        const isBullet = /^(•|\-|\*)\s+/.test(line);

        if (isTableLine) {
          flushList();
          flushMermaid();
          tableBuffer.push(line);
          return;
        }

        if (tableBuffer.length > 0 && !isTableLine) {
          flushTable();
        }

        if (isArrowLine || /ALGORITHM|FLOWCHART|WORKUP/.test(sectionTitle)) {
          mermaidBuffer.push(line);
          return;
        }

        if (mermaidBuffer.length > 0 && !isArrowLine) {
          flushMermaid();
        }

        if (isNumbered) {
          if (listType !== 'ol') {
            flushList();
            listType = 'ol';
          }
          listItems.push(`<li>${line.replace(/^\d+(\.\d+)*\.?\s+/, '')}</li>`);
          return;
        }

        if (isBullet) {
          if (listType !== 'ul') {
            flushList();
            listType = 'ul';
          }
          listItems.push(`<li>${line.replace(/^(•|\-|\*)\s+/, '')}</li>`);
          return;
        }

        flushList();
        htmlOut += `<p class=\"mb-2\">${line}</p>`;
      });

      flushTable();
      flushMermaid();
      flushList();

      return htmlOut;
    };

    const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    let html = '';
    let currentSection = null;
    let buffer = [];

    const flushSection = () => {
      if (!currentSection && buffer.length === 0) return;

      const sectionTitle = currentSection || 'OVERVIEW';
      const style = sectionStyles[sectionTitle] || 'bg-white border-l-4 border-gray-200';

      const contentHtml = buildHtmlFromLines(buffer, sectionTitle);

      html += `
        <div class=\"my-3 p-4 rounded ${style}\">
          <div class=\"font-bold text-gray-800 mb-2\">${sectionTitle}</div>
          <div class=\"space-y-1\">${contentHtml}</div>
        </div>
      `;

      buffer = [];
    };

    lines.forEach((line) => {
      const upper = line.toUpperCase();
      const isHeader = sectionStyles[upper] || (/^[A-Z\s]{4,}$/.test(upper) && upper.length < 40);

      if (isHeader) {
        flushSection();
        currentSection = upper;
      } else {
        buffer.push(line);
      }
    });

    flushSection();
    return html;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex-1 pr-4">
            <h2 className="text-3xl font-bold text-gray-900">
              {card.title?.en || card.title?.fr || card.title}
            </h2>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinueWithAI?.();
                }}
                className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md font-medium"
                title="Continue editing with AI"
              >
                ✨ Continue with AI
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManualEdit?.();
                }}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md font-medium"
                title="Edit manually with rich text editor"
              >
                📝 Manual Edit
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-4xl font-light leading-none flex-shrink-0 ml-4"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white select-text">
          {/* Tags */}
          {card.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {card.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Main Content with Enhanced Styling */}
          <div className="prose prose-lg max-w-none text-gray-800 select-text">
            <div 
              className="leading-relaxed space-y-4 select-text"
              dangerouslySetInnerHTML={{ 
                __html: renderContent(card.content) 
              }}
            />
            
            {/* Mermaid Diagram Support */}
            {(() => {
              const rawContent = card.content?.en || card.content?.fr || card.content || '';
              const mermaidMatch = rawContent.match(/```mermaid\s*([\s\S]*?)```/i)
                || rawContent.match(/<div class="mermaid">([\s\S]*?)<\/div>/i)
                || rawContent.match(/<pre class="mermaid">([\s\S]*?)<\/pre>/i);
              const mermaidText = mermaidMatch ? mermaidMatch[1].trim() : '';
              if (!mermaidText) return null;
              return (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-4 font-semibold">📊 Diagram:</p>
                  <div className="mermaid">{mermaidText}</div>
                </div>
              );
            })()}
          </div>

          {/* Sources/References */}
          {(card.aiSources?.length > 0 || card.references?.length > 0) && (
            <div className="mt-8 pt-6 border-t-2 border-gray-300">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                📚 Sources & References
              </h3>
              <ul className="space-y-2">
                {(card.aiSources || card.references || []).map((source, idx) => (
                  <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">→</span>
                    <span>{typeof source === 'string' ? source : (source.name || source.type || source)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2 shadow-sm"
            title="Export card to PDF"
          >
            {isExporting ? '⏳ Exporting...' : '📄 Export PDF'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
