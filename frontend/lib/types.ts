export interface Worker {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  trade: string;
  city: string;
  hourly_rate: number;
  bio: string;
  labour_score: number;
  licence_verified: boolean;
  white_card_verified: boolean;
  wallet_address: string | null;
  created_at: string;
  // Private fields (own profile only)
  email?: string;
  licence_number?: string;
  white_card?: string;
  updated_at?: string;
}

export interface Listing {
  id: number;
  worker_id: number;
  title: string;
  description: string;
  skills: string[];
  availability: string;
  active: boolean;
  created_at: string;
  worker?: Worker;
}

export interface Equipment {
  id: number;
  owner_id: number;
  title: string;
  category: string;
  description: string;
  daily_rate: number;
  location: string;
  condition: string;
  availability: string;
  active: boolean;
  created_at: string;
  owner?: Worker;
}

export interface Message {
  id: number;
  from_name: string;
  from_email: string;
  company: string | null;
  body: string;
  read: boolean;
  time: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  worker: Worker;
}

export interface ProfileResponse {
  message: string;
  worker: Worker;
  listing: Listing | null;
}
