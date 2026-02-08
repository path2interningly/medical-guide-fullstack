import React, { useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';

/**
 * RichTextEditor - Word-like editor with TinyMCE
 * Features: 20+ fonts, 1-88 font sizes, multi-level numbering, tables, paste-from-Word fidelity
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Start typing...', className = '' }) {
  const fontSizes = useMemo(() => Array.from({ length: 88 }, (_, i) => `${i + 1}px`).join(' '), []);

  const fontFormats = [
    'Aptos=aptos,calibri,sans-serif',
    'Calibri=calibri,sans-serif',
    'Arial=arial,helvetica,sans-serif',
    'Helvetica=helvetica,arial,sans-serif',
    'Times New Roman=times new roman,serif',
    'Georgia=georgia,serif',
    'Garamond=garamond,serif',
    'Palatino=palatino,serif',
    'Verdana=verdana,geneva,sans-serif',
    'Trebuchet MS=trebuchet ms,sans-serif',
    'Tahoma=tahoma,sans-serif',
    'Courier New=courier new,monospace',
    'Consolas=consolas,monospace',
    'Monaco=monaco,monospace',
    'Roboto=roboto,sans-serif',
    'Open Sans=open sans,sans-serif',
    'Lato=lato,sans-serif',
    'Montserrat=montserrat,sans-serif',
    'Poppins=poppins,sans-serif',
    'Merriweather=merriweather,serif'
  ].join(';');

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'}
        value={value}
        onEditorChange={onChange}
        init={{
          height: 600,
          menubar: 'file edit view insert format tools table help',
          branding: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'paste', 'help', 'wordcount', 'lineheight'
          ],
          toolbar:
            'undo redo | fontfamily fontsize lineheight | ' +
            'bold italic underline strikethrough forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | ' +
            'table | link image media | ' +
            'removeformat code fullscreen',
          fontsize_formats: fontSizes,
          font_family_formats: fontFormats,
          lineheight_formats: '1 1.15 1.5 1.75 2 2.5 3',
          advlist_bullet_styles: 'default,circle,disc,square',
          advlist_number_styles: 'default,lower-alpha,lower-roman,upper-alpha,upper-roman',
          lists_indent_on_tab: true,
          paste_data_images: true,
          paste_webkit_styles: 'all',
          paste_retain_style_properties: 'all',
          paste_merge_formats: false,
          content_style: `
            body {
              font-family: Calibri, Aptos, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              padding: 24px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table td, table th {
              border: 1px solid #d1d5db;
              padding: 8px;
            }
            table th {
              background: #f3f4f6;
              font-weight: 600;
            }
            ol { list-style-type: decimal; margin-left: 1.5em; }
            ol ol { list-style-type: decimal; }
            ul { list-style-type: disc; margin-left: 1.5em; }
            ul ul { list-style-type: circle; }
            ul ul ul { list-style-type: square; }
          `,
          placeholder
        }}
      />
    </div>
  );
}
