import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SlideData, Item, Hamper, TemplateSlide, PresentationDetails } from '@/types/presentation';
import logoImage from '@/assets/logo.png';
import { format } from 'date-fns';

// Helper function to format currency with rupee symbol
const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined) return 'N/A';
  return `\u20B9${amount}`; // Unicode rupee symbol
};

export const generatePDF = async (slides: SlideData[], clientName: string, details: PresentationDetails): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
  });

  // Set default font
  pdf.setFont('helvetica', 'normal');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Keep track of non-template slides for option numbering
  let optionIndex = 1;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    if (i > 0) {
      pdf.addPage();
    }

    // Add slide content based on type
    if (slide.type === 'template') {
      const templateSlide = slide.content as TemplateSlide;
      if (templateSlide.isRequirementsSlide) {
        templateSlide.details = details;
      }
      await renderTemplateSlide(pdf, templateSlide, pageWidth, pageHeight);
    } else if (slide.type === 'item') {
      // Add company logo for non-template slides
      try {
        const img = new Image();
        img.src = logoImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const logoWidth = 30;
        const logoHeight = (img.height / img.width) * logoWidth;
        pdf.addImage(logoImage, 'PNG', margin, margin, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
      }

      await renderItemSlide(pdf, slide.content as Item, pageWidth, pageHeight, margin, optionIndex++);

      // Add footer for non-template slides
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        'HappyWrap • www.happywrap.in',
        pageWidth / 2,
        pageHeight - margin,
        { align: 'center' }
      );
    } else {
      // Add company logo for non-template slides
      try {
        const img = new Image();
        img.src = logoImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const logoWidth = 30;
        const logoHeight = (img.height / img.width) * logoWidth;
        pdf.addImage(logoImage, 'PNG', margin, margin, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
      }

      await renderHamperSlide(pdf, slide.content as Hamper, pageWidth, pageHeight, margin);

      // Add footer for non-template slides
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        'HappyWrap • www.happywrap.in',
        pageWidth / 2,
        pageHeight - margin,
        { align: 'center' }
      );
    }
  }

  // Format the filename with client name and today's date
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const sanitizedClientName = clientName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
  const filename = `${sanitizedClientName} ${todayDate}.pdf`;

  // Save the PDF
  pdf.save(filename);
};

const renderTemplateSlide = async (
  pdf: jsPDF,
  template: TemplateSlide,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = template.imageUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Calculate dimensions to fit the image while maintaining aspect ratio
    const imageRatio = img.width / img.height;
    const pageRatio = pageWidth / pageHeight;
    
    let finalWidth = pageWidth;
    let finalHeight = pageHeight;
    
    if (imageRatio > pageRatio) {
      finalHeight = pageWidth / imageRatio;
    } else {
      finalWidth = pageHeight * imageRatio;
    }
    
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;
    
    pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);

    // If this is a requirements slide, add the content
    if (template.isRequirementsSlide && template.details) {
      const margin = 20;
      const leftPadding = 50;
      let currentY = margin + 40;

      // Client Name
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(template.details.clientName || 'N/A', margin + leftPadding, currentY);
      currentY += 25;

      // Requirements Details
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const details = [
        `Purpose : ${template.details.purpose || 'N/A'}`,
        `Expected Quantity : ${template.details.quantity || 'N/A'}`,
        `Budget (Excl. GST) : ${formatCurrency(template.details.budgetExclGst)}`,
        `Budget (Incl. GST) : ${formatCurrency(template.details.budgetInclGst)}`,
        `Deadline : ${template.details.deadline ? format(new Date(template.details.deadline), 'dd MMM yyyy') : 'N/A'}`,
        `Branding Required : ${template.details.brandingRequired ? 'Yes' : 'No'}`,
        `Custom Packaging : ${template.details.customPackaging ? 'Yes' : 'No'}`,
        `Delivery Location : ${template.details.deliveryLocation || 'N/A'}`
      ];

      details.forEach(detail => {
        pdf.text(detail, margin + leftPadding, currentY);
        currentY += 20;
      });

      // Remarks with different styling
      currentY += 5;
      pdf.text('Remarks :', margin + leftPadding, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(18);
      pdf.text(template.details.remarks || 'N/A', margin + leftPadding + 50, currentY);
    }
  } catch (error) {
    console.warn('Could not add template image to PDF:', error);
    pdf.setFontSize(14);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Template image could not be loaded', pageWidth / 2, pageHeight / 2, { align: 'center' });
  }
};

const renderItemSlide = async (
  pdf: jsPDF, 
  item: Item, 
  pageWidth: number, 
  pageHeight: number, 
  margin: number,
  slideIndex?: number
): Promise<void> => {
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // First add the option template background
  try {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = window.location.origin + '/assets/slides/option-template.png';
    
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = reject;
    });

    pdf.addImage(bgImg, 'PNG', 0, 0, pageWidth, pageHeight);
  } catch (error) {
    console.warn('Could not add option template background:', error);
  }

  // Option Number
  if (slideIndex) {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Option ${slideIndex}`, margin + 10, margin + 40);
  }

  // Item name
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  pdf.text(item.name, centerX, margin + 40, { align: 'center' });

  // Item image
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = item.imageUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const maxImageWidth = 100;
    const maxImageHeight = 80;
    const imageRatio = img.width / img.height;
    
    let imageWidth = maxImageWidth;
    let imageHeight = maxImageWidth / imageRatio;
    
    if (imageHeight > maxImageHeight) {
      imageHeight = maxImageHeight;
      imageWidth = maxImageHeight * imageRatio;
    }

    const imageX = centerX - imageWidth / 2;
    const imageY = centerY - imageHeight / 2;

    pdf.addImage(img, 'JPEG', imageX, imageY, imageWidth, imageHeight);
  } catch (error) {
    console.warn('Could not add item image to PDF:', error);
    // Add placeholder text
    pdf.setFontSize(12);
    pdf.setTextColor(128, 128, 128);
    pdf.text('[Image not available]', centerX, centerY, { align: 'center' });
  }

  // Item price
  pdf.setFontSize(28);
  pdf.setTextColor(102, 51, 153); // Purple color
  pdf.text(`₹${item.price.toFixed(2)}`, centerX, pageHeight - margin - 40, { align: 'center' });
};

const renderHamperSlide = async (
  pdf: jsPDF, 
  hamper: Hamper, 
  pageWidth: number, 
  pageHeight: number, 
  margin: number
): Promise<void> => {
  const centerX = pageWidth / 2;
  let currentY = margin + 40;

  // Hamper title
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Product Hamper', centerX, currentY, { align: 'center' });
  currentY += 20;

  // Item names
  pdf.setFontSize(14);
  hamper.items.forEach((item, index) => {
    const text = index < hamper.items.length - 1 ? `${item.name} •` : item.name;
    const textWidth = pdf.getTextWidth(text);
    
    if (index === 0) {
      // Center the first item
      const totalWidth = hamper.items.reduce((sum: number, item, i) => {
        const itemText = i < hamper.items.length - 1 ? `${item.name} • ` : item.name;
        return sum + pdf.getTextWidth(itemText);
      }, 0);
      currentY += 10;
      pdf.text(text, centerX - totalWidth / 2, currentY);
    } else {
      // Continue on the same line
      const previousTexts = hamper.items.slice(0, index).reduce((sum: number, item, i) => {
        const itemText = i < hamper.items.length - 1 ? `${item.name} • ` : item.name;
        return sum + pdf.getTextWidth(itemText);
      }, 0);
      
      const totalWidth = hamper.items.reduce((sum: number, item, i) => {
        const itemText = i < hamper.items.length - 1 ? `${item.name} • ` : item.name;
        return sum + pdf.getTextWidth(itemText);
      }, 0);
      
      pdf.text(text, centerX - totalWidth / 2 + previousTexts, currentY);
    }
  });

  currentY += 30;

  // Item images - render them horizontally like in the preview
  if (hamper.items.length > 0) {
    const imageSize = 25; // Size in mm
    const spacing = 5; // Spacing between images
    const totalWidth = (hamper.items.length * imageSize) + ((hamper.items.length - 1) * spacing);
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < hamper.items.length; i++) {
      const item = hamper.items[i];
      const imageX = startX + (i * (imageSize + spacing));

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = item.imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        pdf.addImage(img, 'JPEG', imageX, currentY, imageSize, imageSize);
      } catch (error) {
        console.warn(`Could not add hamper item image for ${item.name}:`, error);
        // Add placeholder rectangle
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(imageX, currentY, imageSize, imageSize, 'FD');
        
        // Add item initial in the center
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          item.name.charAt(0).toUpperCase(), 
          imageX + imageSize / 2, 
          currentY + imageSize / 2 + 2, 
          { align: 'center' }
        );
      }
    }
    
    currentY += imageSize + 15;
  } else {
    // No items message
    pdf.setFontSize(12);
    pdf.setTextColor(128, 128, 128);
    pdf.text('No items in hamper', centerX, currentY, { align: 'center' });
    currentY += 20;
  }

  // Total price
  const totalPrice = hamper.items.reduce((sum: number, item) => sum + item.price, 0);
  pdf.setFontSize(16);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Total Value', centerX, pageHeight - margin - 50, { align: 'center' });
  
  pdf.setFontSize(28);
  pdf.setTextColor(102, 51, 153); // Purple color
  pdf.text(`₹${totalPrice.toFixed(2)}`, centerX, pageHeight - margin - 30, { align: 'center' });
};