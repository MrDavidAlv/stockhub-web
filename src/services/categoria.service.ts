import api from './api.service';
import type { Categoria } from 'src/types';

export const categoriaService = {
  async findAll(): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>('/categorias');
    return data;
  },

  async create(payload: { nombre: string; descripcion?: string | null }): Promise<Categoria> {
    const { data } = await api.post<Categoria>('/categorias', payload);
    return data;
  },

  async update(
    id: number,
    payload: { nombre: string; descripcion?: string | null },
  ): Promise<Categoria> {
    const { data } = await api.put<Categoria>(`/categorias/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`);
  },
};
