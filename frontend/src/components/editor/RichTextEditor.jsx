import React, { useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// TinyMCE self-hosted imports
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/skins/ui/oxide/skin.min.css';

// Plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

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
        value={value}
        onEditorChange={onChange}
        init={{
          height: 600,
          menubar: 'file edit view insert format tools table help',
          branding: false,
          promotion: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar:
            'undo redo | fontfamily fontsize | ' +
            'bold italic underline strikethrough forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | ' +
            'table | link image media | ' +
            'removeformat code fullscreen',
          fontsize_formats: fontSizes,
          font_family_formats: fontFormats,
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
              margin: 12px 0;
              border: 1px solid #d1d5db;
            }
            table td, table th {
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: left;
            }
            table th {
              background: #dbeafe;
              font-weight: 600;
              color: #1e40af;
            }
            table tr:nth-child(even) {
              background: #f9fafb;
            }
            table tr:nth-child(odd) {
              background: #ffffff;
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
