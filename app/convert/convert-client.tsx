'use client';

import { useCallback } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';
import { ConversionForm } from '@/components/conversion/conversion-form';
import { ConversionResult } from '@/components/conversion/conversion-result';
import {
  usePersistedConversion,
  ConversionResultSnapshot,
} from '@/lib/storage';

interface ConvertClientProps {
  indicators: IndicatorValue[];
}

export function ConvertClient({ indicators }: ConvertClientProps) {
  const { result: conversion, setResult: setConversion } =
    usePersistedConversion();

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

      // Use the date from the real indicator (not CLP which has no date)
      const referenceDate = fromIndicator.fecha || toIndicator.fecha;

      const newConversion: ConversionResultSnapshot = {
        amount,
        fromName: fromIndicator.nombre,
        toName: toIndicator.nombre,
        toUnit: toIndicator.unidad_medida,
        result,
        fromValue: fromIndicator.valor,
        toValue: toIndicator.valor,
        referenceDate,
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
          fromValue={conversion.fromValue}
          toValue={conversion.toValue}
          referenceDate={conversion.referenceDate}
        />
      )}
    </div>
  );
}
