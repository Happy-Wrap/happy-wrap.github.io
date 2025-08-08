import { Item } from "@/types/presentation";

const SPREADSHEET_ID = '1pyHT66_qhBtNXhSjGiZUBB80sBR7PCTWHtKjtZ5fSow';
const RANGE = 'Sheet1!A1:K';

// Data source interface for future modularity
export interface ItemDataSource {
  getItems(): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
}

type HeaderIndex = { [key: string]: number };

// Sample data for development/fallback
const sampleData = [
  ['ID', 'Category', 'Sub Category', 'Brand', 'Product Name', 'MRP', 'Discount Price', 'Wholesale Price', 'Distributor Price', 'Landing Cost', 'Image URL'],
  ['1', 'Home Appliances', 'Mixer', 'Wonder Chef', 'Glory Mixer Grinder', '6000', '3559', '4200', '4805', '5670', ''],
  ['2', 'Home Appliances', 'Mixer', 'Wonder Chef', 'Sumo Mixer Grinder', '8000', '4746', '5600', '6407', '7560', ''],
  ['3', 'Home Appliances', 'Mixer', 'Wonder Chef', 'Vietri', '4000', '2373', '2800', '3203', '3780', '']
];

// Google Sheets implementation
export class GoogleSheetsDataSource implements ItemDataSource {
  private createHeaderIndex(header: string[]): HeaderIndex {
    return header.reduce((acc, columnName, index) => {
      acc[columnName] = index;
      return acc;
    }, {} as HeaderIndex);
  }

  private async getSheetData() {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      
      if (!apiKey) {
        console.warn('Google API key not found. Using sample data.');
        return { 
          header: sampleData[0],
          values: sampleData.slice(1),
          headerIdx: this.createHeaderIndex(sampleData[0])
        };
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }

      const data = await response.json();
      const rows = data.values || sampleData;
      
      return {
        header: rows[0],
        values: rows.slice(1),
        headerIdx: this.createHeaderIndex(rows[0])
      };
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      return {
        header: sampleData[0],
        values: sampleData.slice(1),
        headerIdx: this.createHeaderIndex(sampleData[0])
      };
    }
  }

  private mapRowToItem(row: any[], headerIdx: HeaderIndex): Item {
    return {
      id: row[headerIdx['ID']] || String(Math.random()),
      name: row[headerIdx['Product Name']] || '',
      price: parseFloat(row[headerIdx['MRP']] || '0'),
      imageUrl: row[headerIdx['Image URL']] || 'https://via.placeholder.com/500',
    };
  }

  async getItems(): Promise<Item[]> {
    const data = await this.getSheetData();
    return data.values.map(row => this.mapRowToItem(row, data.headerIdx));
  }

  async searchItems(query: string): Promise<Item[]> {
    const items = await this.getItems();
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const defaultDataSource: ItemDataSource = new GoogleSheetsDataSource();