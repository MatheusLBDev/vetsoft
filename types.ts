
export interface Pet {
  id: number;
  name: string;
  species: 'Cachorro' | 'Gato' | 'Pássaro' | 'Roedor' | 'Outro';
  breed: string;
  birthDate: string; // ISO string format
  ownerId: number;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  pets?: Pet[];
}

export enum AppointmentStatus {
  SCHEDULED = 'Agendado',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado'
}

export interface Appointment {
  id:number;
  clientId: number;
  petId: number;
  date: string; // ISO string format with time
  reason: string;
  notes?: string;
  status: AppointmentStatus;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface SaleItem {
  id: number;
  product_id?: number;
  service_id?: number;
  quantity: number;
  price: number;
}
export interface Sale {
  id: number;
  items: SaleItem[];
  total: number;
  date: string; // ISO string
}

export enum Page {
  Dashboard = 'Dashboard',
  Clients = 'Clientes',
  Appointments = 'Agendamentos',
  Inventory = 'Estoque',
}
