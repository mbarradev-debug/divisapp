'use client';

import { useCallback } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';
import { ConversionForm } from '@/components/conversion/conversion-form';
import { ConversionResult } from '@/components/conversion/conversion-result';
import {
  usePersistedConversion,
  ConversionResultSnapshot,
} from '@/lib/storage';

interface ConversionClientProps {
  indicators: IndicatorValue[];
}

export function ConversionClient({ indicators }: ConversionClientProps) {
  // Use persisted result for immediate rendering on restore
  const { result: conversion, setResult: setConversion } =
    usePersistedConversion();

  // Single conversion function - calculates and persists result
  const handleConvert = useCallback(
    ({
      amount,
      fromIndicator,
      toIndicator,
    }: {
      amount: number;
      fromIndicator: IndicatorValue;
      toIndicator: IndicatorValue;
    }) => {
      if (!fromIndicator.valor || !toIndicator.valor || toIndicator.valor === 0) {
        setConversion(null);
        return;
      }

      const clpValue = amount * fromIndicator.valor;
      const result = clpValue / toIndicator.valor;

      const newConversion: ConversionResultSnapshot = {
        amount,
        fromName: fromIndicator.nombre,
        toName: toIndicator.nombre,
        toUnit: toIndicator.unidad_medida,
        result,
      };

      setConversion(newConversion);
    },
    [setConversion]
  );

  return (
    <div className="flex flex-col gap-6">
      <ConversionForm indicators={indicators} onConvert={handleConvert} />
      {conversion && (
        <ConversionResult
          amount={conversion.amount}
          fromName={conversion.fromName}
          toName={conversion.toName}
          toUnit={conversion.toUnit}
          result={conversion.result}
        />
      )}
    </div>
  );
}
