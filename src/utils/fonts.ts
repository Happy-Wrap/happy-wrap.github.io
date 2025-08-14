// Font declarations
export const calibriRegular = new FontFace('Calibri', 'url(/fonts/Calibri.woff2)', {
  style: 'normal',
  weight: '400'
});

export const calibriBold = new FontFace('Calibri', 'url(/fonts/Calibri-Bold.woff2)', {
  style: 'normal',
  weight: '700'
});

export const calibriLight = new FontFace('Calibri', 'url(/fonts/Calibri-Light.woff2)', {
  style: 'normal',
  weight: '300'
});

export const loadFonts = async () => {
  try {
    // Load fonts
    const regular = await calibriRegular.load();
    const bold = await calibriBold.load();
    const light = await calibriLight.load();
    
    // Add fonts to document
    document.fonts.add(regular);
    document.fonts.add(bold);
    document.fonts.add(light);
    
    // Wait for fonts to be ready
    await document.fonts.ready;
    
    return true;
  } catch (error) {
    console.error('Failed to load fonts:', error);
    return false;
  }
}; 