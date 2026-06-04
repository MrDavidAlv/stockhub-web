import api from './api.service';
import type { EmailInventarioPayload, Producto } from 'src/types';

export const inventarioService = {
  async list(empresaNit?: string | null): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>('/inventario', {
      params: empresaNit ? { empresaNit } : {},
    });
    return data;
  },

  async downloadPdf(empresaNit?: string | null): Promise<Blob> {
    const { data } = await api.get<Blob>('/inventario/pdf', {
      params: empresaNit ? { empresaNit } : {},
      responseType: 'blob',
    });
    return data;
  },

  async sendByEmail(payload: EmailInventarioPayload): Promise<void> {
    await api.post('/inventario/enviar-email', payload);
  },
};
