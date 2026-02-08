import React, { useMemo, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Register custom formats
const LineHeightStyle = Quill.import('formats/lineheight');
LineHeightStyle.whitelist = ['1', '1.15', '1.5', '1.75', '2', '2.5', '3'];
Quill.register(LineHeightStyle, true);

/**
 * RichTextEditor - Full-featured text editor with Google Docs/Word-like capabilities
 * Features: Fonts, font sizes, line height, formatting, lists with nested numbering, colors, etc.
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Start typing...', className = '' }) {
  
  // Custom toolbar with comprehensive options
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        // Font family
        [{ 'font': ['', 'sans-serif', 'serif', 'monospace', 'script'] }],
        
        // Font size (more granular options)
        [{ 'size': ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '32px', '36px', '40px', '44px', '48px'] }],
        
        // Headers
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
        // Text formatting
        ['bold', 'italic', 'underline', 'strike'],
        
        // Text color and background
        [{ 'color': [] }, { 'background': [] }],
        
        // Script (superscript/subscript)
        [{ 'script': 'sub' }, { 'script': 'super' }],
        
        // Lists and indentation (NESTED NUMBER FORMAT SUPPORT)
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        
        // Alignment
        [{ 'align': [] }],
        
        // Line height
        [{ 'lineheight': ['1', '1.15', '1.5', '1.75', '2', '2.5', '3'] }],
        
        // Block elements
        ['blockquote', 'code-block'],
        
        // Links, images, videos
        ['link', 'image', 'video'],
        
        // Clean formatting
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'check', 'indent',
    'align', 'lineheight',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'clean'
  ];

  // Custom image handler for local file uploads
  function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const quill = this.quill;
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', e.target.result);
          quill.setSelection(range.index + 1);
        };
        reader.readAsDataURL(file);
      }
    };
  }

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <style>{`
        .rich-text-editor-wrapper {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        .rich-text-editor-wrapper .ql-toolbar {
          border: none;
          border-bottom: 1px solid #d1d5db;
          background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .rich-text-editor-wrapper .ql-container {
          border: none;
          background: white;
          font-size: 11pt;
          font-family: 'Calibri', 'Aptos', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          min-height: 400px;
          max-height: 70vh;
          overflow-y: auto;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          min-height: 400px;
          padding: 96px 96px 96px 120px;
          max-width: 816px;
          margin: 0 auto;
          line-height: 1.5;
          background: white;
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
          left: 120px;
        }

        .rich-text-editor-wrapper .ql-toolbar button {
          width: 32px;
          height: 28px;
          padding: 4px;
          border: 1px solid transparent;
          border-radius: 2px;
          background: transparent;
          transition: all 0.15s;
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover {
          background: #e3f2fd;
          border-color: #90caf9;
        }

        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          background: #bbdefb;
          border-color: #64b5f6;
        }

        .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #444;
        }

        .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: #444;
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke {
          stroke: #1976d2;
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill {
          fill: #1976d2;
        }

        .rich-text-editor-wrapper .ql-picker {
          border: 1px solid #d1d5db;
          border-radius: 2px;
          background: white;
        }

        .rich-text-editor-wrapper .ql-picker-label {
          padding: 4px 8px;
          padding-right: 20px;
        }

        .rich-text-editor-wrapper .ql-picker:hover {
          border-color: #90caf9;
        }

        /* Separator lines between toolbar groups */
        .rich-text-editor-wrapper .ql-formats {
          margin-right: 8px;
          padding-right: 8px;
          border-right: 1px solid #e5e7eb;
        }

        .rich-text-editor-wrapper .ql-formats:last-child {
          border-right: none;
        }

        /* Table support styles */
        .rich-text-editor-wrapper .ql-editor table {
          border-collapse: collapse;
          width: 100%;
        }

        .rich-text-editor-wrapper .ql-editor table td,
        .rich-text-editor-wrapper .ql-editor table th {
          border: 1px solid #ddd;
          padding: 8px;
        }

        .rich-text-editor-wrapper .ql-editor table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }

        /* Enhanced list styles with nested numbering */
        .rich-text-editor-wrapper .ql-editor ol {
          list-style-type: decimal;
          margin-left: 1.5em;
        }

        .rich-text-editor-wrapper .ql-editor ol ol {
          list-style-type: decimal;
          margin-left: 1.5em;
        }

        .rich-text-editor-wrapper .ql-editor ol ol ol {
          list-style-type: decimal;
          margin-left: 1.5em;
        }

        .rich-text-editor-wrapper .ql-editor ol li {
          list-style-type: decimal;
          margin-bottom: 0.25em;
        }

        .rich-text-editor-wrapper .ql-editor ul {
          list-style-type: disc;
          margin-left: 1.5em;
        }

        .rich-text-editor-wrapper .ql-editor ul li {
          list-style-type: disc;
          margin-bottom: 0.25em;
        }

        .rich-text-editor-wrapper .ql-editor ul ul {
          list-style-type: circle;
        }

        .rich-text-editor-wrapper .ql-editor ul ul ul {
          list-style-type: square;
        }

        /* Code block styling */
        .rich-text-editor-wrapper .ql-editor pre.ql-syntax {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 12px;
          border-radius: 0.375rem;
          overflow-x: auto;
        }

        /* Blockquote styling */
        .rich-text-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin-left: 0;
          color: #4b5563;
        }

        /* Image handling */
        .rich-text-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }

        /* Link styling */
        .rich-text-editor-wrapper .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .rich-text-editor-wrapper .ql-editor a:hover {
          color: #2563eb;
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
