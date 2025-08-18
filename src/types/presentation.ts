export interface Item {
  id: string;
  name: string;
  mrp: number;
  hwCost: number;
  hwWithGST: number;
  clientPrice: number;
  clientPriceWithGST: number;
  priceTag: string;
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
  isRequirementsSlide?: boolean;
  details?: PresentationDetails;
}

export type SlideType = 'item' | 'hamper' | 'template';

export type PriceDisplayMode = 'show' | 'upon_request' | 'hide';

export interface SlideData {
  id: string;
  type: SlideType;
  content: Item | Hamper | TemplateSlide;
  createdAt: Date;
  priceDisplayMode?: PriceDisplayMode;
  customPriceText?: string;
}

export interface PresentationDetails {
  clientName: string;
  purpose?: string;
  quantity: number; // integer
  budgetExclGst: number; // integer
  budgetInclGst: number; // integer
  deadline: Date;
  brandingRequired: boolean;
  customPackaging: boolean;
  deliveryLocation?: string;
  remarks?: string;
}

export interface Presentation {
  details: PresentationDetails;
  slides: SlideData[];
  activeSlideId: string | null;
}