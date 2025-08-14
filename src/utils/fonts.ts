// Font declarations
export const latoRegular = new FontFace('Lato', 'url(/fonts/Lato-Regular.woff2)', {
  style: 'normal',
  weight: '400'
});

export const latoBold = new FontFace('Lato', 'url(/fonts/Lato-Bold.woff2)', {
  style: 'normal',
  weight: '700'
});

export const latoItalic = new FontFace('Lato', 'url(/fonts/Lato-Italic.woff2)', {
  style: 'italic',
  weight: '400'
});

export const latoBoldItalic = new FontFace('Lato', 'url(/fonts/Lato-BoldItalic.woff2)', {
  style: 'italic',
  weight: '700'
});

export const loadFonts = async () => {
  try {
    // Load fonts
    const regular = await latoRegular.load();
    const bold = await latoBold.load();
    const italic = await latoItalic.load();
    const boldItalic = await latoBoldItalic.load();
    
    // Add fonts to document
    document.fonts.add(regular);
    document.fonts.add(bold);
    document.fonts.add(italic);
    document.fonts.add(boldItalic);
    
    // Wait for fonts to be ready
    await document.fonts.ready;
    
    return true;
  } catch (error) {
    console.error('Failed to load fonts:', error);
    return false;
  }
}; 