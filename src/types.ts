export interface User {
  id: string;
  name: string;
  email: string;
  savedProperties: string[]; // Property IDs
}

export type PropertyStatus = 'active' | 'sold';

export interface Property {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  lat?: number;
  lng?: number;
  imageUrl: string;
  status: PropertyStatus;
  likedBy: string[];
}
