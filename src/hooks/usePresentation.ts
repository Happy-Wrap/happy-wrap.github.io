import { useState } from "react";
import { SlideData, Presentation, SlideType, Item, Hamper } from "@/types/presentation";
import { defaultItems } from "@/data/defaultItems";

export const usePresentation = () => {
  const [presentation, setPresentation] = useState<Presentation>({
    slides: [],
    activeSlideId: null,
  });

  const addSlide = () => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      type: 'item',
      content: defaultItems[0] || { id: '', name: '', price: 0, imageUrl: '' },
      createdAt: new Date(),
    };

    setPresentation(prev => ({
      slides: [...prev.slides, newSlide],
      activeSlideId: newSlide.id,
    }));
  };

  const selectSlide = (slideId: string) => {
    setPresentation(prev => ({
      ...prev,
      activeSlideId: slideId,
    }));
  };

  const updateSlide = (slideId: string, updates: Partial<SlideData>) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(slide => 
        slide.id === slideId ? { ...slide, ...updates } : slide
      ),
    }));
  };

  const deleteSlide = (slideId: string) => {
    setPresentation(prev => {
      const newSlides = prev.slides.filter(slide => slide.id !== slideId);
      const newActiveSlideId = prev.activeSlideId === slideId 
        ? (newSlides.length > 0 ? newSlides[0].id : null)
        : prev.activeSlideId;

      return {
        slides: newSlides,
        activeSlideId: newActiveSlideId,
      };
    });
  };

  return {
    presentation,
    addSlide,
    selectSlide,
    updateSlide,
    deleteSlide,
  };
};