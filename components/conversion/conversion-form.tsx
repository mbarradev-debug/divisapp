'use client';

import { useState } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';

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

    const fromIndicator = indicators.find((i) => i.codigo === fromCode);
    const toIndicator = indicators.find((i) => i.codigo === toCode);

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="amount"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="from"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Desde
        </label>
        <select
          id="from"
          value={fromCode}
          onChange={handleFromChange}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-500"
        >
          <option value="">Selecciona un indicador</option>
          {indicators.map((indicator) => (
            <option key={indicator.codigo} value={indicator.codigo}>
              {indicator.nombre} ({indicator.unidad_medida})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="to"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Hacia
        </label>
        <select
          id="to"
          value={toCode}
          onChange={handleToChange}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-500"
        >
          <option value="">Selecciona un indicador</option>
          {indicators.map((indicator) => (
            <option key={indicator.codigo} value={indicator.codigo}>
              {indicator.nombre} ({indicator.unidad_medida})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
      >
        Convertir
      </button>
    </form>
  );
}
