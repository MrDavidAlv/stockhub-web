import api from './api.service';
import type { Producto, ProductoPayload } from 'src/types';

export const productoService = {
  async findAll(): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>('/productos');
    return data;
  },

  async findById(id: number): Promise<Producto> {
    const { data } = await api.get<Producto>(`/productos/${id}`);
    return data;
  },

  async findByEmpresa(nit: string): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>(`/productos/por-empresa/${nit}`);
    return data;
  },

  async create(payload: ProductoPayload): Promise<Producto> {
    const { data } = await api.post<Producto>('/productos', payload);
    return data;
  },

  async update(id: number, payload: ProductoPayload): Promise<Producto> {
    const { data } = await api.put<Producto>(`/productos/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/productos/${id}`);
  },
};
