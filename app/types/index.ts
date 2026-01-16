export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'SEK' | 'NZD' | 'BRL';

export type ActivityCategory = 
  | 'transport' 
  | 'accommodation' 
  | 'food' 
  | 'sightseeing' 
  | 'shopping' 
  | 'other';

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  birthDate?: string; // ISO 8601 Date string (YYYY-MM-DD)
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Trip {
  id: string;
  userId: string; // Owner of the trip
  title: string;
  destination: string;
  startDate: string; // ISO 8601 Date string (YYYY-MM-DD)
  endDate: string;   // ISO 8601 Date string (YYYY-MM-DD)
  budget?: number;
  currency: Currency;
  notes?: string;
  pictureUrl?: string; // URL to trip cover picture
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number; // 1 Expense Currency = X Trip Currency
  date?: string; // ISO 8601 Date string
  category: ActivityCategory;
  paidBy?: string; // For future expansion if multiple travelers
}

export interface Photo {
  id: string;
  tripId: string;
  url: string;
  caption?: string;
  date?: string; // ISO 8601 Date string
  createdAt: number; // Timestamp
}

// Helper type for LocalStorage structure
export interface TravelDataStore {
  trips: Trip[];
  expenses: Record<string, Expense[]>;    // Keyed by tripId
  photos: Record<string, Photo[]>;        // Keyed by tripId
}
