import api from './api.service';
import type { Empresa, EmpresaPayload } from 'src/types';

export const empresaService = {
  async findAll(): Promise<Empresa[]> {
    const { data } = await api.get<Empresa[]>('/empresas');
    return data;
  },

  async findByNit(nit: string): Promise<Empresa> {
    const { data } = await api.get<Empresa>(`/empresas/${nit}`);
    return data;
  },

  async create(payload: EmpresaPayload): Promise<Empresa> {
    const { data } = await api.post<Empresa>('/empresas', payload);
    return data;
  },

  async update(nit: string, payload: EmpresaPayload): Promise<Empresa> {
    const { data } = await api.put<Empresa>(`/empresas/${nit}`, payload);
    return data;
  },

  async delete(nit: string): Promise<void> {
    await api.delete(`/empresas/${nit}`);
  },
};
