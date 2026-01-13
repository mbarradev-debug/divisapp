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
  toUnit: string;
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
    if (!fromIndicator.valor || !toIndicator.valor || toIndicator.valor === 0) {
      setConversion(null);
      return;
    }

    const clpValue = amount * fromIndicator.valor;
    const result = clpValue / toIndicator.valor;

    setConversion({
      amount,
      fromName: fromIndicator.nombre,
      toName: toIndicator.nombre,
      toUnit: toIndicator.unidad_medida,
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
          toUnit={conversion.toUnit}
          result={conversion.result}
        />
      )}
    </div>
  );
}
