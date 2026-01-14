import { describe, it, expect } from 'vitest';
import {
  INDICATOR_CONTEXT,
  getIndicatorContext,
  hasIndicatorContext,
} from '../indicator-context';
import type { IndicatorCode } from '../api/mindicador';

const ALL_INDICATOR_CODES: IndicatorCode[] = [
  'uf',
  'ivp',
  'dolar',
  'dolar_intercambio',
  'euro',
  'ipc',
  'utm',
  'imacec',
  'tpm',
  'libra_cobre',
  'tasa_desempleo',
  'bitcoin',
];

describe('INDICATOR_CONTEXT', () => {
  it('has context defined for all indicator codes', () => {
    for (const code of ALL_INDICATOR_CODES) {
      expect(INDICATOR_CONTEXT[code]).toBeDefined();
    }
  });

  it('each context has all required fields', () => {
    for (const code of ALL_INDICATOR_CODES) {
      const context = INDICATOR_CONTEXT[code];
      expect(context.code).toBe(code);
      expect(typeof context.description).toBe('string');
      expect(context.description.length).toBeGreaterThan(0);
      expect(typeof context.represents).toBe('string');
      expect(context.represents.length).toBeGreaterThan(0);
      expect(typeof context.implications.upward).toBe('string');
      expect(context.implications.upward.length).toBeGreaterThan(0);
      expect(typeof context.implications.downward).toBe('string');
      expect(context.implications.downward.length).toBeGreaterThan(0);
    }
  });

  it('does not contain prescriptive language', () => {
    const prescriptiveWords = ['should', 'must', 'recommend', 'buy', 'sell', 'invest'];
    for (const code of ALL_INDICATOR_CODES) {
      const context = INDICATOR_CONTEXT[code];
      const allText = [
        context.description,
        context.represents,
        context.implications.upward,
        context.implications.downward,
      ].join(' ').toLowerCase();

      for (const word of prescriptiveWords) {
        expect(allText).not.toContain(word);
      }
    }
  });

  it('does not contain judgmental language about outcomes', () => {
    const judgmentalPatterns = [
      /\bgood\b/i,
      /\bbad\b/i,
      /\bbetter\b/i,
      /\bworse\b/i,
      /\bbest\b/i,
      /\bworst\b/i,
    ];
    for (const code of ALL_INDICATOR_CODES) {
      const context = INDICATOR_CONTEXT[code];
      const allText = [
        context.description,
        context.represents,
        context.implications.upward,
        context.implications.downward,
      ].join(' ');

      for (const pattern of judgmentalPatterns) {
        expect(allText).not.toMatch(pattern);
      }
    }
  });
});

describe('getIndicatorContext', () => {
  it('returns context for valid indicator code', () => {
    const context = getIndicatorContext('uf');
    expect(context.code).toBe('uf');
    expect(context.description).toContain('Unidad de Fomento');
  });

  it('returns correct context for each indicator', () => {
    for (const code of ALL_INDICATOR_CODES) {
      const context = getIndicatorContext(code);
      expect(context.code).toBe(code);
    }
  });
});

describe('hasIndicatorContext', () => {
  it('returns true for valid indicator codes', () => {
    for (const code of ALL_INDICATOR_CODES) {
      expect(hasIndicatorContext(code)).toBe(true);
    }
  });

  it('returns false for invalid codes', () => {
    expect(hasIndicatorContext('invalid')).toBe(false);
    expect(hasIndicatorContext('')).toBe(false);
    expect(hasIndicatorContext('USD')).toBe(false);
  });
});
