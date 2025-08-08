export interface Item {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Hamper {
  id: string;
  items: Item[];
}

export type SlideType = 'item' | 'hamper';

export interface SlideData {
  id: string;
  type: SlideType;
  content: Item | Hamper;
  createdAt: Date;
}

export interface Presentation {
  slides: SlideData[];
  activeSlideId: string | null;
}