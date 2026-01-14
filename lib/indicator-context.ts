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
    description: 'Unidad de Fomento, a daily-adjusted unit of account indexed to inflation.',
    represents:
      'A standardized measure used in Chile to maintain purchasing power over time. It adjusts daily based on the previous month inflation rate.',
    implications: {
      upward:
        'Reflects accumulated inflation. Loans, contracts, and savings denominated in UF increase in nominal peso terms.',
      downward:
        'Indicates deflation in the economy. Obligations in UF would decrease in nominal peso terms.',
    },
  },
  ivp: {
    code: 'ivp',
    description: 'Índice de Valor Promedio, an average value index for banking operations.',
    represents:
      'A reference index used in certain financial and banking calculations in Chile, reflecting average values in specific operations.',
    implications: {
      upward: 'May indicate higher average values in the underlying banking operations.',
      downward: 'May indicate lower average values in the underlying banking operations.',
    },
  },
  dolar: {
    code: 'dolar',
    description: 'Official observed US dollar exchange rate in Chilean pesos.',
    represents:
      'The average interbank exchange rate for the US dollar, published daily by the Central Bank of Chile.',
    implications: {
      upward:
        'The Chilean peso weakens relative to the US dollar. Imports become more expensive; exports become more competitive.',
      downward:
        'The Chilean peso strengthens relative to the US dollar. Imports become cheaper; exports become less competitive.',
    },
  },
  dolar_intercambio: {
    code: 'dolar_intercambio',
    description: 'Interbank US dollar exchange rate for foreign trade operations.',
    represents:
      'A reference exchange rate used specifically for international trade settlements and customs valuation.',
    implications: {
      upward: 'Higher costs for importers in peso terms. Export revenues increase when converted to pesos.',
      downward: 'Lower costs for importers in peso terms. Export revenues decrease when converted to pesos.',
    },
  },
  euro: {
    code: 'euro',
    description: 'Official observed euro exchange rate in Chilean pesos.',
    represents:
      'The average interbank exchange rate for the euro, published daily by the Central Bank of Chile.',
    implications: {
      upward:
        'The Chilean peso weakens relative to the euro. European imports become more expensive; exports to Europe become more competitive.',
      downward:
        'The Chilean peso strengthens relative to the euro. European imports become cheaper; exports to Europe become less competitive.',
    },
  },
  ipc: {
    code: 'ipc',
    description: 'Índice de Precios al Consumidor, the consumer price index measuring inflation.',
    represents:
      'A monthly index that measures the average change in prices paid by consumers for a basket of goods and services.',
    implications: {
      upward: 'Indicates rising consumer prices (inflation). Purchasing power of the peso decreases.',
      downward: 'Indicates falling consumer prices (deflation). Purchasing power of the peso increases.',
    },
  },
  utm: {
    code: 'utm',
    description: 'Unidad Tributaria Mensual, a monthly tax unit adjusted for inflation.',
    represents:
      'A reference unit used for tax calculations, fines, and legal thresholds in Chile. It updates monthly based on IPC.',
    implications: {
      upward:
        'Tax brackets, fines, and thresholds expressed in UTM increase in nominal peso terms.',
      downward:
        'Tax brackets, fines, and thresholds expressed in UTM decrease in nominal peso terms.',
    },
  },
  imacec: {
    code: 'imacec',
    description:
      'Índice Mensual de Actividad Económica, a monthly indicator of economic activity.',
    represents:
      'A proxy for GDP that measures the short-term evolution of economic activity in Chile on a monthly basis.',
    implications: {
      upward: 'Indicates expansion in economic activity. Production and services are growing.',
      downward: 'Indicates contraction in economic activity. Production and services are declining.',
    },
  },
  tpm: {
    code: 'tpm',
    description: 'Tasa de Política Monetaria, the monetary policy interest rate.',
    represents:
      'The benchmark interest rate set by the Central Bank of Chile to influence inflation and economic activity.',
    implications: {
      upward:
        'Borrowing becomes more expensive. Intended to reduce spending and control inflation.',
      downward:
        'Borrowing becomes cheaper. Intended to stimulate spending and economic activity.',
    },
  },
  libra_cobre: {
    code: 'libra_cobre',
    description: 'Price of copper per pound in US cents.',
    represents:
      'The international market price for copper, the main export commodity of Chile and a key driver of its economy.',
    implications: {
      upward:
        'Higher export revenues for Chile. Positive effect on fiscal income and the trade balance.',
      downward:
        'Lower export revenues for Chile. Negative effect on fiscal income and the trade balance.',
    },
  },
  tasa_desempleo: {
    code: 'tasa_desempleo',
    description: 'Unemployment rate as a percentage of the labor force.',
    represents:
      'The proportion of the labor force that is without work but actively seeking employment.',
    implications: {
      upward:
        'More people are without employment. May indicate economic slowdown or labor market challenges.',
      downward:
        'Fewer people are without employment. May indicate economic growth or improved labor conditions.',
    },
  },
  bitcoin: {
    code: 'bitcoin',
    description: 'Bitcoin price in Chilean pesos.',
    represents:
      'The market value of one Bitcoin expressed in Chilean pesos, reflecting both its USD price and the peso exchange rate.',
    implications: {
      upward:
        'Bitcoin has appreciated relative to the Chilean peso. May reflect global crypto market trends or peso depreciation.',
      downward:
        'Bitcoin has depreciated relative to the Chilean peso. May reflect global crypto market trends or peso appreciation.',
    },
  },
};

export function getIndicatorContext(code: IndicatorCode): IndicatorContext {
  return INDICATOR_CONTEXT[code];
}

export function hasIndicatorContext(code: string): code is IndicatorCode {
  return code in INDICATOR_CONTEXT;
}
