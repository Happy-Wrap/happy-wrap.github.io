import { Item } from "@/types/presentation";

const SPREADSHEET_ID = '1OtaxAnr6EjvcFX0BNZcsv4e7Q1pGeUPZCz64FQXwP3U';
const RANGE = 'Products!A1:Z';
const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;

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
  private async getAccessToken(): Promise<string | null> {
    try {
      const credentials = JSON.parse(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT || '{}');
      
      if (!credentials.client_email || !credentials.private_key) {
        console.warn('Google service account credentials not found. Using sample data.');
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const token = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      };

      const header = { alg: 'RS256', typ: 'JWT' };
      const base64Header = btoa(JSON.stringify(header));
      const base64Payload = btoa(JSON.stringify(token));
      
      // Sign the JWT using the private key
      const signedJwt = await this.signJwt(
        `${base64Header}.${base64Payload}`,
        credentials.private_key
      );

      // Exchange JWT for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: signedJwt,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
      }

      const { access_token } = await tokenResponse.json();
      return access_token;

    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async signJwt(input: string, privateKey: string): Promise<string> {
    try {
      // Convert PEM private key to CryptoKey
      const pemHeader = '-----BEGIN PRIVATE KEY-----';
      const pemFooter = '-----END PRIVATE KEY-----';
      const pemContents = privateKey
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
      
      const binaryKey = atob(pemContents);
      const binaryDer = this.str2ab(binaryKey);

      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: { name: 'SHA-256' },
        },
        false,
        ['sign']
      );

      // Sign the input
      const encoder = new TextEncoder();
      const signatureBuffer = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        encoder.encode(input)
      );

      // Convert signature to base64
      const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
      return `${input}.${signature}`;

    } catch (error) {
      console.error('Error signing JWT:', error);
      throw error;
    }
  }

  private str2ab(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  private createHeaderIndex(header: string[]): HeaderIndex {
    return header.reduce((acc, columnName, index) => {
      acc[columnName] = index;
      return acc;
    }, {} as HeaderIndex);
  }

  private async getSheetData() {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        console.warn('Using sample data due to auth failure');
        return { 
          header: sampleData[0],
          values: sampleData.slice(1),
          headerIdx: this.createHeaderIndex(sampleData[0])
        };
      }

      const response = await fetch(SHEETS_API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

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
    console.log(row);
    const imageUrl = row[headerIdx['Image URL']] || '';
    const driveUrlPattern = /^@https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view*$/;
    const match = imageUrl.match(driveUrlPattern);
    const simpleMatch = imageUrl.match(/\/d\/([^/]+)\/view/);
    const fileId = simpleMatch ? simpleMatch[1] : null;
    const processedImageUrl = fileId 
      ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
      : imageUrl || '/assets/logo.png';
    // console.log(row[headerIdx['Product Name']], `imageUrl: ${imageUrl}`, `match: ${match}`, `fileId: ${fileId}`, `processedImageUrl: ${processedImageUrl}`);
    return {
      id: row[headerIdx['ID']] || String(Math.random()),
      name: row[headerIdx['Product Name']] || '',
      mrp: parseFloat(row[headerIdx['MRP']] || '0'),
      hwCost: parseFloat(row[headerIdx['HW Cost']] || '0'),
      hwWithGST: parseFloat(row[headerIdx['HW GST']] || '0'),
      clientPrice: parseFloat(row[headerIdx['Client']] || '0'),
      clientPriceWithGST: parseFloat(row[headerIdx['Client GST']] || '0'),
      priceTag: row[headerIdx['Price Tag']] || '',
      imageUrl: processedImageUrl,
      category: row[headerIdx['Category']] || '',
      subCategory: row[headerIdx['Sub Category']] || '',
      brand: row[headerIdx['Brand']] || '',
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