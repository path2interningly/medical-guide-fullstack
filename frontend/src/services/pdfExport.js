import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a single card to PDF
 */
export async function exportCardToPDF(card, filename) {
  try {
    // Create a temporary div to render the card
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm';
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Calibri, Aptos, sans-serif';
    
    // Format card content
    tempDiv.innerHTML = `
      <div style="margin-bottom: 10px;">
        <h1 style="margin: 0 0 15px 0; font-size: 24px; color: #1f2937; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
          ${card.title}
        </h1>
      </div>
      <div style="color: #374151; line-height: 1.6; font-size: 11pt; margin-bottom: 15px;">
        ${card.content ? card.content.replace(/<[^>]+>/g, '<br/>') : 'No content'}
      </div>
      ${card.aiSources && card.aiSources.length > 0 ? `
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10pt; color: #6b7280;">
          <strong>Sources:</strong> ${card.aiSources.join(', ')}
        </div>
      ` : ''}
      <div style="margin-top: 20px; font-size: 9pt; color: #9ca3af; text-align: right;">
        Exported from Med in a Pocket • ${new Date().toLocaleDateString()}
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210 - 20; // A4 width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;
    
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= 280;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 280;
    }
    
    pdf.save(`${filename || card.title}.pdf`);
    document.body.removeChild(tempDiv);
    
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export card to PDF');
  }
}

/**
 * Export multiple cards to a single PDF
 */
export async function exportCardsToPDF(cards, filename = 'medical-cards.pdf') {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      if (i > 0) pdf.addPage();
      
      let yPosition = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;

      // Title
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont(undefined, 'bold');
      const titleLines = pdf.splitTextToSize(card.title, maxWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 7 + 5;

      // Divider line
      pdf.setDrawColor(79, 70, 229);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Content
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont(undefined, 'normal');
      const cleanContent = card.content ? card.content.replace(/<[^>]+>/g, '') : 'No content';
      const contentLines = pdf.splitTextToSize(cleanContent, maxWidth);
      pdf.text(contentLines, margin, yPosition);
      yPosition += contentLines.length * 5 + 10;

      // Sources
      if (card.aiSources && card.aiSources.length > 0) {
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.setFont(undefined, 'bold');
        pdf.text('Sources:', margin, yPosition);
        yPosition += 5;
        
        pdf.setFont(undefined, 'normal');
        const sourceLines = pdf.splitTextToSize(card.aiSources.join(', '), maxWidth);
        pdf.text(sourceLines, margin, yPosition);
      }
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Batch PDF export error:', error);
    throw new Error('Failed to export cards to PDF');
  }
}
