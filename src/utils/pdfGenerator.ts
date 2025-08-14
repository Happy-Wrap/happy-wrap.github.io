import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SlideData, Item, Hamper, TemplateSlide, PresentationDetails } from '@/types/presentation';
import logoImage from '@/assets/logo.png';
import { format } from 'date-fns';
import { loadFonts } from './fonts';

// Add Calibri fonts to jsPDF
const addFontsToPDF = async (pdf: jsPDF) => {
  try {
    // Helper function to convert ArrayBuffer to base64 string
    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    // Add normal font
    const normalFontResponse = await fetch('/fonts/Calibri.ttf');
    const normalFontBuffer = await normalFontResponse.arrayBuffer();
    pdf.addFileToVFS('Calibri.ttf', arrayBufferToBase64(normalFontBuffer));
    pdf.addFont('Calibri.ttf', 'Calibri', 'normal');

    // Add bold font
    const boldFontResponse = await fetch('/fonts/Calibri-Bold.ttf');
    const boldFontBuffer = await boldFontResponse.arrayBuffer();
    pdf.addFileToVFS('Calibri-Bold.ttf', arrayBufferToBase64(boldFontBuffer));
    pdf.addFont('Calibri-Bold.ttf', 'Calibri', 'bold');

    // Add light font
    const lightFontResponse = await fetch('/fonts/Calibri-Light.ttf');
    const lightFontBuffer = await lightFontResponse.arrayBuffer();
    pdf.addFileToVFS('Calibri-Light.ttf', arrayBufferToBase64(lightFontBuffer));
    pdf.addFont('Calibri-Light.ttf', 'Calibri', 'light');

    // Set default font
    pdf.setFont('Calibri', 'normal');
  } catch (error) {
    console.error('Failed to load fonts for PDF:', error);
  }
};

// Helper function to format currency with rupee symbol
const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined) return 'N/A';
  return `₹${amount}`; // Unicode rupee symbol
};

// Helper function to create and setup a canvas for rendering
const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // 2x for better resolution
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2); // Scale up for better resolution
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  return canvas;
};

// Helper function to render text with proper styling
const renderText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  align?: CanvasTextAlign;
} = {}) => {
  const {
    fontSize = 16,
    fontFamily = 'Calibri',
    fontWeight = 'normal',
    color = '#000000',
    align = 'left'
  } = options;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
};

export const generatePDF = async (slides: SlideData[], clientName: string, details: PresentationDetails): Promise<void> => {
  // Load fonts first
  await loadFonts();

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: "px",      // Use pixels for no conversion confusion
    format: [1920, 1080]
  });

  // Add fonts to PDF
  await addFontsToPDF(pdf);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  let optionIndex = 1;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    if (i > 0) {
      pdf.addPage();
    }

    if (slide.type === 'template') {
      const templateSlide = slide.content as TemplateSlide;
      if (templateSlide.isRequirementsSlide) {
        templateSlide.details = details;
      }
      await renderTemplateSlide(pdf, templateSlide, pageWidth , pageHeight );
    } else {
      // Create canvas for non-template slides
      const canvas = createCanvas(pageWidth, pageHeight); // Convert mm to px (1mm ≈ 3.78px)
      const ctx = canvas.getContext('2d')!;

      // Add logo
      try {
        const img = new Image();
        img.src = logoImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const logoWidth = 30 * 3.78;
        const logoHeight = (img.height / img.width) * logoWidth;
        ctx.drawImage(img, margin * 3.78, margin * 3.78, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Could not add logo to canvas:', error);
      }

      // Render slide content
      if (slide.type === 'item') {
        await renderItemSlide(canvas, slide.content as Item, pageWidth, pageHeight , margin * 3.78, optionIndex++, slide);
      } else {
        await renderHamperSlide(canvas, slide.content as Hamper, pageWidth , pageHeight , margin * 3.78, optionIndex++, slide);
      }

      // Add footer
      renderText(ctx, 'www.happywrap.in', pageWidth  / 2, (pageHeight ) - (margin * 3.78), {
        fontSize: 6 * 3.78,
        color: '#808080',
        align: 'center',
        fontFamily: 'Calibri'
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
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
    const canvas = createCanvas(pageWidth , pageHeight );
    const ctx = canvas.getContext('2d')!;

    // Add template background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = template.imageUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const imageRatio = img.width / img.height;
    const pageRatio = pageWidth / pageHeight;
    
    let finalWidth = pageWidth * 3.78;
    let finalHeight = pageHeight * 3.78;
    
    if (imageRatio > pageRatio) {
      finalHeight = (pageWidth * 3.78) / imageRatio;
    } else {
      finalWidth = (pageHeight * 3.78) * imageRatio;
    }
    
    const x = ((pageWidth * 3.78) - finalWidth) / 2;
    const y = ((pageHeight * 3.78) - finalHeight) / 2;
    
    ctx.drawImage(img, 0, 0, pageWidth, pageHeight);

    // If this is a requirements slide, add the content
    if (template.isRequirementsSlide && template.details) {
      const margin = 10 * 3.78;
      const leftPadding = 10 * 3.78;
      let currentY = margin + (40 * 3.78);

      // Client Name
      renderText(ctx, template.details.clientName || 'N/A', margin + leftPadding, currentY, {
        fontSize: 12 * 3.78,
        color: '#663399',
        fontWeight: 'bold',
        fontFamily: 'Calibri'
      });
      currentY += 25 * 3.78;

      // Requirements Details
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
        renderText(ctx, detail, margin + leftPadding, currentY, {
          fontSize: 8 * 3.78,
          fontFamily: 'Calibri',
          // fontWeight: 'bold'
        });
        currentY += 10 * 3.78;
      });

      // Remarks with different styling
      // currentY += 15 * 3.78;
      renderText(ctx, 'Remarks :', margin + leftPadding, currentY, {
        fontSize: 8 * 3.78,
        fontFamily: 'Calibri',
        // fontWeight: 'bold'
      });
      renderText(ctx, template.details.remarks || 'N/A', margin + leftPadding + (50 * 3.78), currentY, {
        fontSize: 8 * 3.78,
        fontFamily: 'Calibri'
      });

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    } else {
      pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

  } catch (error) {
    console.warn('Could not render template slide:', error);
    pdf.setFontSize(14);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Template slide could not be rendered', pageWidth / 2, pageHeight / 2, { align: 'center' });
  }
};

const renderItemSlide = async (
  canvas: HTMLCanvasElement,
  item: Item,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  slideIndex?: number,
  slide?: SlideData,
): Promise<void> => {
  const ctx = canvas.getContext('2d')!;
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

    ctx.drawImage(bgImg, 0, 0, pageWidth, pageHeight);
  } catch (error) {
    console.warn('Could not add option template background:', error);
  }

  // Option Number
  if (slideIndex) {
    renderText(ctx, `Option ${slideIndex}`, margin + (10 * 3.78), margin + (40 * 3.78), {
      fontSize: 12 * 3.78,
      color: '#663399',
      fontWeight: 'bold',
      fontFamily: 'Calibri'
    });
  }

  // Item name
  renderText(ctx, item.name, centerX, margin + (40 * 3.78), {
    fontSize: 8 * 3.78,
    align: 'center',
    fontFamily: 'Calibri'
  });

  // Item image
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = item.imageUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const maxImageWidth = 100 * 3.78;
    const maxImageHeight = 80 * 3.78;
    const imageRatio = img.width / img.height;
    
    let imageWidth = maxImageWidth;
    let imageHeight = maxImageWidth / imageRatio;
    
    if (imageHeight > maxImageHeight) {
      imageHeight = maxImageHeight;
      imageWidth = maxImageHeight * imageRatio;
    }

    const imageX = centerX - imageWidth / 2;
    const imageY = centerY - imageHeight / 2;

    ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
  } catch (error) {
    console.warn('Could not add item image:', error);
    renderText(ctx, '[Image not available]', centerX, centerY, {
      fontSize: 8 * 3.78,
      color: '#808080',
      align: 'center',
      fontFamily: 'Calibri'
    });
  }

  // Item price
  const mode = slide?.priceDisplayMode ?? 'show';
  if (mode !== 'hide') {
    const priceText = mode === 'upon_request' ? 'Price upon request' : `₹${item.price.toFixed(2)}`;
    renderText(ctx, priceText, centerX, pageHeight - margin - (40 * 3.78), {
      fontSize: 8 * 3.78,
      color: '#663399',
      align: 'center',
      fontWeight: 'bold',
      fontFamily: 'Calibri'
    });
  }
};

const renderHamperSlide = async (
  canvas: HTMLCanvasElement,
  hamper: Hamper,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  slideIndex?: number,
  slide?: SlideData,
): Promise<void> => {
  const ctx = canvas.getContext('2d')!;
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

    ctx.drawImage(bgImg, 0, 0, pageWidth, pageHeight);
  } catch (error) {
    console.warn('Could not add option template background:', error);
  }

  // Option Number
  if (slideIndex) {
    renderText(ctx, `Option ${slideIndex}`, margin + (10 * 3.78), margin + (40 * 3.78), {
      fontSize: 12 * 3.78,
      fontWeight: 'bold',
      color: '#663399', // primary color
      fontFamily: 'Calibri'
    });
  }

  // Calculate total content height to center everything
  const titleHeight = 8 * 3.78; // Title font size
  const imageSize = 25 * 3.78;
  const imageSpacing = 15 * 3.78;
  const priceHeight = 50 * 3.78; // Space for price text
  const itemNameHeight = 15 * 3.78; // Height for item name below image
  const optionNumberHeight = slideIndex ? 60 * 3.78 : 0; // Add space for option number

  const totalContentHeight = titleHeight + imageSize + itemNameHeight + imageSpacing + priceHeight;
  let currentY = centerY - (totalContentHeight) + optionNumberHeight;

  // Hamper title
  renderText(ctx, 'Product Hamper', centerX, margin + (40 * 3.78), {
    fontSize: 8 * 3.78,
    align: 'center',
    fontFamily: 'Calibri'
  });
  currentY += 20 * 3.78;

  // Item images with names
  if (hamper.items.length > 0) {
    const imageSize = 25 * 3.78;
    const fixedSpacing = 20 * 3.78; // Fixed spacing between items
    const totalWidth = (imageSize * hamper.items.length) + (fixedSpacing * (hamper.items.length - 1));
    const startX = centerX - (totalWidth / 2); // Center the entire group

    for (let i = 0; i < hamper.items.length; i++) {
      const item = hamper.items[i];
      const imageX = startX + (i * (imageSize + fixedSpacing));

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = item.imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        ctx.drawImage(img, imageX, currentY, imageSize, imageSize);
        
        // Add item name below the image
        renderText(ctx, item.name, imageX + (imageSize / 2), currentY + imageSize + (10 * 3.78), {
          fontSize: 6 * 3.78,
          color: '#666666',
          align: 'center',
          fontFamily: 'Calibri'
        });
      } catch (error) {
        console.warn(`Could not add hamper item image for ${item.name}:`, error);
        // Add placeholder rectangle
        ctx.fillStyle = '#f0f0f0';
        ctx.strokeStyle = '#c8c8c8';
        ctx.fillRect(imageX, currentY, imageSize, imageSize);
        ctx.strokeRect(imageX, currentY, imageSize, imageSize);
        
        // Add item initial
        renderText(ctx, item.name.charAt(0).toUpperCase(), imageX + imageSize / 2, currentY + imageSize / 2 + (2 * 3.78), {
          fontSize: 8 * 3.78,
          color: '#808080',
          align: 'center',
          fontFamily: 'Calibri'
        });
        
        // Add item name below the placeholder
        renderText(ctx, item.name, imageX + (imageSize / 2), currentY + imageSize + (10 * 3.78), {
          fontSize: 6 * 3.78,
          color: '#666666',
          align: 'center',
          fontFamily: 'Calibri'
        });
      }
    }
    
    currentY += imageSize + (30 * 3.78); // Increased spacing to account for item names
  } else {
    renderText(ctx, 'No items in hamper', centerX, currentY, {
      fontSize: 8 * 3.78,
      color: '#808080',
      align: 'center',
      fontFamily: 'Calibri'
    });
    currentY += 20 * 3.78;
  }

  // Total price
  const mode = slide?.priceDisplayMode ?? 'show';
  if (mode !== 'hide') {
    const totalPrice = hamper.items.reduce((sum, item) => sum + item.price, 0);
    const priceText = mode === 'upon_request' ? 'Price upon request' : `₹${totalPrice.toFixed(2)}`;
    renderText(ctx, 'Total Value', centerX, currentY, {
      fontSize: 8 * 3.78,
      color: '#808080',
      align: 'center',
      fontFamily: 'Calibri'
    });
    
    renderText(ctx, priceText, centerX, currentY + (20 * 3.78), {
      fontSize: 12 * 3.78,
      color: '#663399',
      align: 'center',
      fontWeight: 'bold',
      fontFamily: 'Calibri'
    });
  }
};