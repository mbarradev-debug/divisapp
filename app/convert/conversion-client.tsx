'use client';

import { useState } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';
import { ConversionForm } from '@/components/conversion/conversion-form';
import { ConversionResult } from '@/components/conversion/conversion-result';

interface ConversionClientProps {
  indicators: IndicatorValue[];
}

interface ConversionData {
  amount: number;
  fromName: string;
  toName: string;
  result: number;
}

export function ConversionClient({ indicators }: ConversionClientProps) {
  const [conversion, setConversion] = useState<ConversionData | null>(null);

  const handleConvert = ({
    amount,
    fromIndicator,
    toIndicator,
  }: {
    amount: number;
    fromIndicator: IndicatorValue;
    toIndicator: IndicatorValue;
  }) => {
    // Convert: amount in "from" units → CLP → "to" units
    // fromIndicator.valor = how many CLP per 1 unit of "from"
    // toIndicator.valor = how many CLP per 1 unit of "to"
    const clpValue = amount * fromIndicator.valor;
    const result = clpValue / toIndicator.valor;

    setConversion({
      amount,
      fromName: fromIndicator.nombre,
      toName: toIndicator.nombre,
      result,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ConversionForm indicators={indicators} onConvert={handleConvert} />
      {conversion && (
        <ConversionResult
          amount={conversion.amount}
          fromName={conversion.fromName}
          toName={conversion.toName}
          result={conversion.result}
        />
      )}
    </div>
  );
}
