import type { AxiosError } from 'axios';
import type { ApiError } from 'src/types';

export function getApiErrorMessage(err: unknown, fallback = 'Error inesperado'): string {
  const e = err as AxiosError<ApiError>;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export function getFieldErrors(err: unknown): Record<string, string> {
  const e = err as AxiosError<ApiError>;
  return e?.response?.data?.fieldErrors ?? {};
}
