// Worker
export interface Worker {
  id: string
  email: string
  first_name: string
  last_name: string
  trade: string
  city: string
  hourly_rate: number
  bio: string
  licence_number?: string
  white_card?: boolean
  wallet_address?: string
  labour_score?: number
  created_at: string
  updated_at: string
}

// Listing
export interface Listing {
  id: string
  worker_id: string
  title: string
  description: string
  skills: string[]
  availability: string
  active: boolean
  created_at: string
  updated_at: string
  worker?: Worker
}

// Equipment
export interface Equipment {
  id: string
  owner_id: string
  title: string
  category: string
  description: string
  daily_rate: number
  condition: string
  location: string
  created_at: string
  updated_at: string
  owner?: Worker
}

// Message
export interface Message {
  id: string
  to_worker_id: string
  from_name: string
  from_email: string
  company?: string
  body: string
  read: boolean
  created_at: string
}

// Login/Register
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  worker: Worker
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  trade: string
  city: string
  hourly_rate: number
  bio: string
  licence_number?: string
  white_card?: boolean
  wallet_address?: string
}

export interface RegisterResponse {
  token: string
  worker: Worker
}

// Auth Context
export interface AuthContextType {
  token: string | null
  currentWorker: Worker | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: RegisterRequest) => Promise<void>
  updateProfile: (data: Partial<Worker>) => Promise<void>
  fetchProfile: () => Promise<void>
}
