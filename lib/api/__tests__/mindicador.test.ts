import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAllIndicators,
  getIndicatorByCode,
  MindicadorApiError,
  type GlobalIndicatorsResponse,
  type IndicatorDetailResponse,
} from '../mindicador';

const mockGlobalResponse: GlobalIndicatorsResponse = {
  version: '1.7.0',
  autor: 'mindicador.cl',
  fecha: '2024-01-15T12:00:00.000Z',
  uf: {
    codigo: 'uf',
    nombre: 'Unidad de fomento (UF)',
    unidad_medida: 'Pesos',
    fecha: '2024-01-15T03:00:00.000Z',
    valor: 36789.56,
  },
  dolar: {
    codigo: 'dolar',
    nombre: 'Dólar observado',
    unidad_medida: 'Pesos',
    fecha: '2024-01-15T03:00:00.000Z',
    valor: 895.23,
  },
  euro: {
    codigo: 'euro',
    nombre: 'Euro',
    unidad_medida: 'Pesos',
    fecha: '2024-01-15T03:00:00.000Z',
    valor: 978.45,
  },
};

const mockIndicatorDetailResponse: IndicatorDetailResponse = {
  version: '1.7.0',
  autor: 'mindicador.cl',
  codigo: 'dolar',
  nombre: 'Dólar observado',
  unidad_medida: 'Pesos',
  serie: [
    { fecha: '2024-01-15T03:00:00.000Z', valor: 895.23 },
    { fecha: '2024-01-14T03:00:00.000Z', valor: 892.15 },
    { fecha: '2024-01-13T03:00:00.000Z', valor: 890.78 },
  ],
};

describe('mindicador API client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getAllIndicators', () => {
    it('should fetch and return all current indicators', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGlobalResponse),
      });

      const result = await getAllIndicators();

      expect(global.fetch).toHaveBeenCalledWith('https://mindicador.cl/api', {
        next: { revalidate: 3600 },
      });
      expect(result).toEqual(mockGlobalResponse);
      expect(result.version).toBe('1.7.0');
      expect(result.autor).toBe('mindicador.cl');
    });

    it('should throw MindicadorApiError on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      await expect(getAllIndicators()).rejects.toThrow(MindicadorApiError);
      await expect(getAllIndicators()).rejects.toThrow(
        'Network error while fetching indicators'
      );
    });

    it('should throw MindicadorApiError on non-OK response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getAllIndicators()).rejects.toThrow(MindicadorApiError);
      await expect(getAllIndicators()).rejects.toThrow(
        'API returned non-OK status: 500'
      );
    });

    it('should throw MindicadorApiError on invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(getAllIndicators()).rejects.toThrow(MindicadorApiError);
      await expect(getAllIndicators()).rejects.toThrow(
        'Failed to parse API response as JSON'
      );
    });

    it('should throw MindicadorApiError on unexpected response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ unexpected: 'data' }),
      });

      await expect(getAllIndicators()).rejects.toThrow(MindicadorApiError);
      await expect(getAllIndicators()).rejects.toThrow(
        'Unexpected API response format'
      );
    });
  });

  describe('getIndicatorByCode', () => {
    it('should fetch and return indicator detail by code', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIndicatorDetailResponse),
      });

      const result = await getIndicatorByCode('dolar');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://mindicador.cl/api/dolar',
        { next: { revalidate: 3600 } }
      );
      expect(result).toEqual(mockIndicatorDetailResponse);
      expect(result.codigo).toBe('dolar');
      expect(result.serie).toHaveLength(3);
    });

    it('should throw MindicadorApiError on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      await expect(getIndicatorByCode('dolar')).rejects.toThrow(MindicadorApiError);
      await expect(getIndicatorByCode('dolar')).rejects.toThrow(
        'Network error while fetching indicator: dolar'
      );
    });

    it('should throw MindicadorApiError on non-OK response (404)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getIndicatorByCode('invalid')).rejects.toThrow(MindicadorApiError);
      await expect(getIndicatorByCode('invalid')).rejects.toThrow(
        'API returned non-OK status: 404'
      );
    });

    it('should throw MindicadorApiError on invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(getIndicatorByCode('dolar')).rejects.toThrow(MindicadorApiError);
      await expect(getIndicatorByCode('dolar')).rejects.toThrow(
        'Failed to parse API response as JSON'
      );
    });

    it('should throw MindicadorApiError on unexpected response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ missing: 'fields' }),
      });

      await expect(getIndicatorByCode('dolar')).rejects.toThrow(MindicadorApiError);
      await expect(getIndicatorByCode('dolar')).rejects.toThrow(
        'Unexpected API response format'
      );
    });

    it('should accept any string as indicator code', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIndicatorDetailResponse),
      });

      await getIndicatorByCode('custom_indicator');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://mindicador.cl/api/custom_indicator',
        { next: { revalidate: 3600 } }
      );
    });
  });

  describe('MindicadorApiError', () => {
    it('should have correct name property', () => {
      const error = new MindicadorApiError('test error');
      expect(error.name).toBe('MindicadorApiError');
    });

    it('should store status code', () => {
      const error = new MindicadorApiError('test error', 500);
      expect(error.status).toBe(500);
    });

    it('should store cause', () => {
      const cause = new Error('original error');
      const error = new MindicadorApiError('test error', undefined, cause);
      expect(error.cause).toBe(cause);
    });
  });
});
