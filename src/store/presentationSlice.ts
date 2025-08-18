import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Presentation, SlideData, Item, PresentationDetails } from '@/types/presentation';
import { defaultDataSource } from '@/data/defaultItems';

interface PresentationState {
  presentation: Presentation;
  defaultItem: Item;
}

const initialState: PresentationState = {
  presentation: {
    slides: [],
    activeSlideId: null,
    details: {
      clientName: '',
      purpose: '',
      quantity: 0,
      budgetExclGst: 0,
      budgetInclGst: 0,
      deadline: new Date(),
      brandingRequired: false,
      customPackaging: false,
      deliveryLocation: '',
      remarks: ''
    }
  },
  defaultItem: { id: '', name: '', mrp: 0, hwCost: 0, hwWithGST: 0, clientPrice: 0, clientPriceWithGST: 0, priceTag: '', imageUrl: '' },
};

const presentationSlice = createSlice({
  name: 'presentation',
  initialState,
  reducers: {
    setDefaultItem: (state, action: PayloadAction<Item>) => {
      state.defaultItem = action.payload;
    },
    addSlide: (state) => {
      const newSlide: SlideData = {
        id: Date.now().toString(),
        type: 'item',
        content: state.defaultItem,
        createdAt: new Date(),
        priceDisplayMode: 'show',
      };
      state.presentation.slides.push(newSlide);
      state.presentation.activeSlideId = newSlide.id;
    },
    selectSlide: (state, action: PayloadAction<string>) => {
      state.presentation.activeSlideId = action.payload;
    },
    updateSlide: (state, action: PayloadAction<{ slideId: string; updates: Partial<SlideData> }>) => {
      const { slideId, updates } = action.payload;
      const slideIndex = state.presentation.slides.findIndex(slide => slide.id === slideId);
      if (slideIndex !== -1) {
        state.presentation.slides[slideIndex] = {
          ...state.presentation.slides[slideIndex],
          ...updates,
        };
      }
    },
    deleteSlide: (state, action: PayloadAction<string>) => {
      const slideId = action.payload;
      state.presentation.slides = state.presentation.slides.filter(slide => slide.id !== slideId);
      if (state.presentation.activeSlideId === slideId) {
        state.presentation.activeSlideId = state.presentation.slides.length > 0 
          ? state.presentation.slides[0].id 
          : null;
      }
    },
    updateDetails: (state, action: PayloadAction<Partial<PresentationDetails>>) => {
      state.presentation.details = {
        ...state.presentation.details,
        ...action.payload
      };
    },
  },
});

export const { 
  setDefaultItem, 
  addSlide, 
  selectSlide, 
  updateSlide, 
  deleteSlide,
  updateDetails 
} = presentationSlice.actions;
export default presentationSlice.reducer; 