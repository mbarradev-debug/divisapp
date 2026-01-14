import type { IndicatorCode } from './api/mindicador';

/**
 * Static context model for economic indicators.
 * Provides educational, factual, and non-prescriptive information
 * about what each indicator represents and its typical implications.
 */

export interface TrendImplication {
  upward: string;
  downward: string;
}

export interface IndicatorContext {
  code: IndicatorCode;
  description: string;
  represents: string;
  implications: TrendImplication;
}

export const INDICATOR_CONTEXT: Record<IndicatorCode, IndicatorContext> = {
  uf: {
    code: 'uf',
    description:
      'La Unidad de Fomento es una unidad de cuenta que se ajusta diariamente según la inflación.',
    represents:
      'Es una medida estandarizada usada en Chile para mantener el poder adquisitivo en el tiempo. Se actualiza diariamente en base a la inflación del mes anterior.',
    implications: {
      upward:
        'Refleja la inflación acumulada. Los créditos, contratos y ahorros en UF aumentan en términos de pesos.',
      downward:
        'Indica deflación en la economía. Las obligaciones en UF disminuirían en términos de pesos.',
    },
  },
  ivp: {
    code: 'ivp',
    description:
      'El Índice de Valor Promedio es un índice de referencia para operaciones bancarias.',
    represents:
      'Es un índice de referencia utilizado en ciertos cálculos financieros y bancarios en Chile, reflejando valores promedio en operaciones específicas.',
    implications: {
      upward:
        'Puede indicar valores promedio más altos en las operaciones bancarias subyacentes.',
      downward:
        'Puede indicar valores promedio más bajos en las operaciones bancarias subyacentes.',
    },
  },
  dolar: {
    code: 'dolar',
    description:
      'El tipo de cambio oficial del dólar estadounidense expresado en pesos chilenos.',
    represents:
      'Es el tipo de cambio interbancario promedio del dólar estadounidense, publicado diariamente por el Banco Central de Chile.',
    implications: {
      upward:
        'El peso chileno se debilita frente al dólar. Las importaciones se encarecen; las exportaciones se vuelven más competitivas.',
      downward:
        'El peso chileno se fortalece frente al dólar. Las importaciones se abaratan; las exportaciones se vuelven menos competitivas.',
    },
  },
  dolar_intercambio: {
    code: 'dolar_intercambio',
    description:
      'El tipo de cambio interbancario del dólar para operaciones de comercio exterior.',
    represents:
      'Es un tipo de cambio de referencia utilizado específicamente para liquidaciones de comercio internacional y valoración aduanera.',
    implications: {
      upward:
        'Mayores costos para importadores en pesos. Los ingresos por exportaciones aumentan al convertirse a pesos.',
      downward:
        'Menores costos para importadores en pesos. Los ingresos por exportaciones disminuyen al convertirse a pesos.',
    },
  },
  euro: {
    code: 'euro',
    description:
      'El tipo de cambio oficial del euro expresado en pesos chilenos.',
    represents:
      'Es el tipo de cambio interbancario promedio del euro, publicado diariamente por el Banco Central de Chile.',
    implications: {
      upward:
        'El peso chileno se debilita frente al euro. Las importaciones europeas se encarecen; las exportaciones a Europa se vuelven más competitivas.',
      downward:
        'El peso chileno se fortalece frente al euro. Las importaciones europeas se abaratan; las exportaciones a Europa se vuelven menos competitivas.',
    },
  },
  ipc: {
    code: 'ipc',
    description:
      'El Índice de Precios al Consumidor mide la variación de precios de bienes y servicios.',
    represents:
      'Es un índice mensual que mide el cambio promedio en los precios pagados por los consumidores por una canasta de bienes y servicios.',
    implications: {
      upward:
        'Indica un aumento en los precios al consumidor (inflación). El poder adquisitivo del peso disminuye.',
      downward:
        'Indica una disminución en los precios al consumidor (deflación). El poder adquisitivo del peso aumenta.',
    },
  },
  utm: {
    code: 'utm',
    description:
      'La Unidad Tributaria Mensual es una unidad de referencia que se ajusta mensualmente según la inflación.',
    represents:
      'Es una unidad de referencia utilizada para cálculos tributarios, multas y límites legales en Chile. Se actualiza mensualmente según el IPC.',
    implications: {
      upward:
        'Los tramos impositivos, multas y límites expresados en UTM aumentan en términos de pesos.',
      downward:
        'Los tramos impositivos, multas y límites expresados en UTM disminuyen en términos de pesos.',
    },
  },
  imacec: {
    code: 'imacec',
    description:
      'El Índice Mensual de Actividad Económica mide la evolución de la actividad económica a corto plazo.',
    represents:
      'Es un indicador proxy del PIB que mide la evolución mensual de la actividad económica en Chile.',
    implications: {
      upward:
        'Indica expansión de la actividad económica. La producción y los servicios están creciendo.',
      downward:
        'Indica contracción de la actividad económica. La producción y los servicios están disminuyendo.',
    },
  },
  tpm: {
    code: 'tpm',
    description:
      'La Tasa de Política Monetaria es la tasa de interés de referencia del Banco Central.',
    represents:
      'Es la tasa de interés de referencia establecida por el Banco Central de Chile para influir en la inflación y la actividad económica.',
    implications: {
      upward:
        'El crédito se encarece. Busca reducir el gasto y controlar la inflación.',
      downward:
        'El crédito se abarata. Busca estimular el gasto y la actividad económica.',
    },
  },
  libra_cobre: {
    code: 'libra_cobre',
    description:
      'El precio del cobre por libra expresado en centavos de dólar estadounidense.',
    represents:
      'Es el precio de mercado internacional del cobre, principal producto de exportación de Chile y factor clave de su economía.',
    implications: {
      upward:
        'Mayores ingresos por exportaciones para Chile. Efecto positivo en los ingresos fiscales y la balanza comercial.',
      downward:
        'Menores ingresos por exportaciones para Chile. Efecto negativo en los ingresos fiscales y la balanza comercial.',
    },
  },
  tasa_desempleo: {
    code: 'tasa_desempleo',
    description:
      'La tasa de desempleo expresada como porcentaje de la fuerza laboral.',
    represents:
      'Es la proporción de la fuerza laboral que no tiene trabajo pero está buscando empleo activamente.',
    implications: {
      upward:
        'Más personas sin empleo. Puede indicar desaceleración económica o dificultades en el mercado laboral.',
      downward:
        'Menos personas sin empleo. Puede indicar crecimiento económico o mejoras en las condiciones laborales.',
    },
  },
  bitcoin: {
    code: 'bitcoin',
    description: 'El precio de Bitcoin expresado en pesos chilenos.',
    represents:
      'Es el valor de mercado de un Bitcoin expresado en pesos chilenos, reflejando tanto su precio en dólares como el tipo de cambio del peso.',
    implications: {
      upward:
        'Bitcoin se ha apreciado frente al peso chileno. Puede reflejar tendencias del mercado cripto global o depreciación del peso.',
      downward:
        'Bitcoin se ha depreciado frente al peso chileno. Puede reflejar tendencias del mercado cripto global o apreciación del peso.',
    },
  },
};

export function getIndicatorContext(code: IndicatorCode): IndicatorContext {
  return INDICATOR_CONTEXT[code];
}

export function hasIndicatorContext(code: string): code is IndicatorCode {
  return code in INDICATOR_CONTEXT;
}
