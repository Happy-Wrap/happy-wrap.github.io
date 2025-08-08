import { Item } from "@/types/presentation";
import headphonesImage from "@/assets/sample-headphones.jpg";
import mugImage from "@/assets/sample-mug.jpg";
import laptopImage from "@/assets/sample-laptop.jpg";

// Default item list - this can be easily swapped out for CSV upload or API data
export const defaultItems: Item[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    imageUrl: headphonesImage,
  },
  {
    id: "2", 
    name: "Ceramic Coffee Mug",
    price: 24.99,
    imageUrl: mugImage,
  },
  {
    id: "3",
    name: "Modern Laptop Computer", 
    price: 1299.99,
    imageUrl: laptopImage,
  },
  {
    id: "4",
    name: "Wireless Mouse",
    price: 59.99,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop&crop=center",
  },
  {
    id: "5",
    name: "USB-C Cable",
    price: 19.99,
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop&crop=center",
  },
  {
    id: "6",
    name: "Smartphone Stand",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&h=500&fit=crop&crop=center",
  },
];

// Data source interface for future modularity
export interface ItemDataSource {
  getItems(): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
}

// Default implementation - can be swapped for CSV, API, etc.
export class DefaultItemDataSource implements ItemDataSource {
  async getItems(): Promise<Item[]> {
    return defaultItems;
  }

  async searchItems(query: string): Promise<Item[]> {
    const lowercaseQuery = query.toLowerCase();
    return defaultItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery)
    );
  }
}