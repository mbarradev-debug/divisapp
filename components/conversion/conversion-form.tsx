'use client';

import { useState } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';
import { Button, Input, Select } from '@/components/ui';

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

  const selectOptions = allOptions.map((indicator) => ({
    value: indicator.codigo,
    label: `${indicator.nombre} (${indicator.unidad_medida})`,
  }));

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

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="amount"
        label="Monto"
        type="number"
        step="any"
        min="0"
        value={amount}
        onChange={handleAmountChange}
        placeholder="Ingresa el monto"
        error={!!error}
      />

      <Select
        id="from"
        label="Desde"
        value={fromCode}
        onChange={handleFromChange}
        options={selectOptions}
        placeholder="Selecciona un indicador"
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Intercambiar indicadores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-bg-subtle text-text-secondary hover:bg-bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 16V4M7 4L3 8M7 4L11 8" />
            <path d="M17 8V20M17 20L21 16M17 20L13 16" />
          </svg>
        </button>
      </div>

      <Select
        id="to"
        label="Hacia"
        value={toCode}
        onChange={handleToChange}
        options={selectOptions}
        placeholder="Selecciona un indicador"
      />

      {error && (
        <div className="rounded-lg border border-error-border bg-error-bg px-3 py-2">
          <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-error-text">
            {error}
          </p>
        </div>
      )}

      <Button type="submit" fullWidth className="mt-1">
        Convertir
      </Button>
    </form>
  );
}
