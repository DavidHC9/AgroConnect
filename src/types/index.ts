// Modelos de Datos para AgroConnect

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'worker' | 'admin';
}

export interface Product {
  id: number;
  name: string;
  price: string;
  unit: string;
  location: string;
  farmer: string;
  image: string;
  category: string;
  freshness: string;
  description: string;
  quantity: string;
  user_id?: string;
}

export interface JobOpportunity {
  id: number;
  title: string;
  name: string;
  location: string;
  skills: string[];
  match: number;
  type: string;
  urgent: boolean;
}

export interface FieldRecord {
  id: string;
  date: string;
  activity: string;
  crop: string;
  inputs: string;
  laborCount: number;
  notes: string;
}
