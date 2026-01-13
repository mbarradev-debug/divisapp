'use client';

import { useState } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';

const CLP_INDICATOR: IndicatorValue = {
  codigo: 'clp',
  nombre: 'Peso Chileno',
  unidad_medida: 'Pesos',
  fecha: '',
  valor: 1,
};

interface ConversionFormProps {
  indicators: IndicatorValue[];
  onConvert: (params: {
    amount: number;
    fromIndicator: IndicatorValue;
    toIndicator: IndicatorValue;
  }) => void;
}

export function ConversionForm({ indicators, onConvert }: ConversionFormProps) {
  const [amount, setAmount] = useState('');
  const [fromCode, setFromCode] = useState('');
  const [toCode, setToCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const allOptions = [CLP_INDICATOR, ...indicators];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    if (!fromCode || !toCode) {
      setError('Selecciona ambos indicadores');
      return;
    }

    if (fromCode === toCode) {
      setError('Selecciona indicadores diferentes');
      return;
    }

    const fromIndicator = allOptions.find((i) => i.codigo === fromCode);
    const toIndicator = allOptions.find((i) => i.codigo === toCode);

    if (!fromIndicator || !toIndicator) {
      setError('Indicador no encontrado');
      return;
    }

    onConvert({ amount: parsedAmount, fromIndicator, toIndicator });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError(null);
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFromCode(e.target.value);
    setError(null);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToCode(e.target.value);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="amount"
          className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-zinc-900 dark:text-zinc-100"
        >
          Monto
        </label>
        <input
          id="amount"
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Ingresa el monto"
          className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-400/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="from"
          className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-zinc-900 dark:text-zinc-100"
        >
          Desde
        </label>
        <select
          id="from"
          value={fromCode}
          onChange={handleFromChange}
          className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-400/20"
        >
          <option value="">Selecciona un indicador</option>
          {allOptions.map((indicator) => (
            <option key={indicator.codigo} value={indicator.codigo}>
              {indicator.nombre} ({indicator.unidad_medida})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="to"
          className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-zinc-900 dark:text-zinc-100"
        >
          Hacia
        </label>
        <select
          id="to"
          value={toCode}
          onChange={handleToChange}
          className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-400/20"
        >
          <option value="">Selecciona un indicador</option>
          {allOptions.map((indicator) => (
            <option key={indicator.codigo} value={indicator.codigo}>
              {indicator.nombre} ({indicator.unidad_medida})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
          <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        className="mt-1 h-11 rounded-lg bg-zinc-900 px-4 text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
      >
        Convertir
      </button>
    </form>
  );
}
