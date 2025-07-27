export interface User {
  id: string;
  full_name?: string;
  business_name?: string; // company name
  email: string;
  encrypted_password: string;
  email_confirmed_at?: Date;
  confirmation_token?: string;
  confirmation_sent_at?: Date;
  recovery_token?: string;
  recovery_sent_at?: Date;
  email_change_token_new?: string;
  email_change?: string;
  email_change_sent_at?: Date;
  last_sign_in_at?: Date;
  raw_app_meta_data?: any;
  raw_user_meta_data?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  profile_id: string; // Primary key
  user_id: string; // Foreign key to auth.users
  avatar_url?: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Party {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  party_type: 'buyer' | 'seller' | 'both';
  company_id: string;
  created_by: string;
  notes?: string;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Crop {
  id: string;
  name: string;
  description?: string;
  unit: string;
  current_stock: number;
  price_per_unit: number;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  company_id: string;
  created_by: string;
  category?: string;
  storage_location?: string;
  last_traded_at?: Date;
  is_visible: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  crop_id: string;
  crop_name: string;
  action: 'buy' | 'sell';
  quantity: number;
  rate: number;
  total: number;
  party_id: string;
  party_name: string;
  transaction_date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  reference_number?: string;
  batch_number?: string;
  tax_percentage: number;
  tax_amount: number;
  discount_amount: number;
  final_amount?: number;
  payment_status: string;
  paid_amount: number;
  due_date?: Date;
  payment_date?: Date;
  quality_grade?: string;
  quality_notes?: string;
  vehicle_number?: string;
  driver_name?: string;
  delivery_address?: string;
  bulk_transaction_id?: string;
  notes?: string;
  company_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  business_name?: string; // Changed from company_name to business_name
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePartyRequest {
  name: string;
  phone?: string;
  address?: string;
  party_type: 'buyer' | 'seller' | 'both';
  notes?: string;
  credit_limit?: number;
}

export interface CreateCropRequest {
  name: string;
  description?: string;
  unit?: string;
  price_per_unit: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  category?: string;
  storage_location?: string;
}

export interface CreateTransactionRequest {
  crop_id: string;
  action: 'buy' | 'sell';
  quantity: number;
  rate: number;
  party_id: string;
  payment_method?: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  reference_number?: string;
  batch_number?: string;
  tax_percentage?: number;
  discount_amount?: number;
  payment_status?: string;
  paid_amount?: number;
  due_date?: Date;
  payment_date?: Date;
  quality_grade?: string;
  quality_notes?: string;
  vehicle_number?: string;
  driver_name?: string;
  delivery_address?: string;
  notes?: string;
}
