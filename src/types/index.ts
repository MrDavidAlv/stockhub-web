export type Rol = 'ADMIN' | 'EXTERNO';

export type Moneda = 'COP' | 'USD' | 'EUR' | 'GBP';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  rol: Rol;
  nombre: string;
  email: string;
}

export interface UserInfo {
  email: string;
  nombre: string;
  rol: Rol;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  fieldErrors?: Record<string, string>;
}

export interface Empresa {
  nit: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  createdAt?: string | null;
}

export interface EmpresaPayload {
  nit: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface PrecioMoneda {
  moneda: Moneda;
  precio: number;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  caracteristicas?: string | null;
  empresaNit: string;
  empresaNombre: string;
  categorias: Categoria[];
  precios: PrecioMoneda[];
  createdAt?: string | null;
}

export interface ProductoPayload {
  codigo: string;
  nombre: string;
  caracteristicas?: string | null;
  empresaNit: string;
  categoriaIds?: number[];
  precios?: PrecioMoneda[];
}

export interface EmailInventarioPayload {
  email: string;
  empresaNit?: string | null;
}
