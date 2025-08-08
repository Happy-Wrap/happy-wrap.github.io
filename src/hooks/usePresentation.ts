import { useState, useEffect } from "react";
import { SlideData, Presentation, SlideType, Item, Hamper } from "@/types/presentation";
import { defaultDataSource } from "@/data/defaultItems";

export const usePresentation = () => {
  const [presentation, setPresentation] = useState<Presentation>({
    slides: [],
    activeSlideId: null,
  });
  const [defaultItem, setDefaultItem] = useState<Item>({ id: '', name: '', price: 0, imageUrl: '' });

  useEffect(() => {
    // Load initial item on mount
    defaultDataSource.getItems().then(items => {
      if (items.length > 0) {
        setDefaultItem(items[0]);
      }
    });
  }, []);

  const addSlide = () => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      type: 'item',
      content: defaultItem,
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