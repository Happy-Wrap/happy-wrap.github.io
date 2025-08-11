export interface Item {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  subCategory?: string;
  brand?: string;
}

export interface Hamper {
  id: string;
  items: Item[];
}

export interface TemplateSlide {
  imageUrl: string;
}

export type SlideType = 'item' | 'hamper' | 'template';

export interface SlideData {
  id: string;
  type: SlideType;
  content: Item | Hamper | TemplateSlide;
  createdAt: Date;
}

export interface PresentationDetails {
  clientName: string;
  clientEmail?: string;
  projectName?: string;
  notes?: string;
}

export interface Presentation {
  details: PresentationDetails;
  slides: SlideData[];
  activeSlideId: string | null;
}