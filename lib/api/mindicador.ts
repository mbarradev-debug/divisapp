const BASE_URL = 'https://mindicador.cl/api';

// API Response Types

export interface ApiMetadata {
  version: string;
  autor: string;
  fecha: string;
}

export interface IndicatorValue {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

export interface GlobalIndicatorsResponse extends ApiMetadata {
  [key: string]: IndicatorValue | string;
}

export interface SerieItem {
  fecha: string;
  valor: number;
}

export interface IndicatorDetailResponse {
  version: string;
  autor: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: SerieItem[];
}

// Known indicator codes
export type IndicatorCode =
  | 'uf'
  | 'ivp'
  | 'dolar'
  | 'dolar_intercambio'
  | 'euro'
  | 'ipc'
  | 'utm'
  | 'imacec'
  | 'tpm'
  | 'libra_cobre'
  | 'tasa_desempleo'
  | 'bitcoin';

// Error types

export class MindicadorApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'MindicadorApiError';
  }
}

// API Client Functions

/**
 * Fetches all current economic indicators from mindicador.cl
 */
export async function getAllIndicators(): Promise<GlobalIndicatorsResponse> {
  let response: Response;

  try {
    response = await fetch(BASE_URL, {
      next: { revalidate: 3600 },
    });
  } catch (error) {
    throw new MindicadorApiError('Network error while fetching indicators', undefined, error);
  }

  if (!response.ok) {
    throw new MindicadorApiError(
      `API returned non-OK status: ${response.status}`,
      response.status
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    throw new MindicadorApiError('Failed to parse API response as JSON', undefined, error);
  }

  if (!isValidGlobalResponse(data)) {
    throw new MindicadorApiError('Unexpected API response format');
  }

  return data;
}

/**
 * Fetches historical series data for a specific indicator
 */
export async function getIndicatorByCode(
  codigo: IndicatorCode | string
): Promise<IndicatorDetailResponse> {
  const url = `${BASE_URL}/${codigo}`;
  let response: Response;

  try {
    response = await fetch(url, {
      next: { revalidate: 3600 },
    });
  } catch (error) {
    throw new MindicadorApiError(
      `Network error while fetching indicator: ${codigo}`,
      undefined,
      error
    );
  }

  if (!response.ok) {
    throw new MindicadorApiError(
      `API returned non-OK status: ${response.status}`,
      response.status
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    throw new MindicadorApiError('Failed to parse API response as JSON', undefined, error);
  }

  if (!isValidIndicatorDetailResponse(data)) {
    throw new MindicadorApiError('Unexpected API response format');
  }

  return data;
}

// Validation helpers

function isValidGlobalResponse(data: unknown): data is GlobalIndicatorsResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.version === 'string' &&
    typeof obj.autor === 'string' &&
    typeof obj.fecha === 'string'
  );
}

function isValidIndicatorDetailResponse(data: unknown): data is IndicatorDetailResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.version === 'string' &&
    typeof obj.autor === 'string' &&
    typeof obj.codigo === 'string' &&
    typeof obj.nombre === 'string' &&
    typeof obj.unidad_medida === 'string' &&
    Array.isArray(obj.serie)
  );
}
