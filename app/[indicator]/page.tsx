import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIndicatorByCode, MindicadorApiError } from '@/lib/api/mindicador';
import { IndicatorHeader } from '@/components/detail/indicator-header';
import { IndicatorHistory } from '@/components/detail/indicator-history';
import { IndicatorInsight } from '@/components/detail/indicator-insight';
import { IndicatorInsightBlock } from '@/components/detail/indicator-insight-block';
import { RecentTracker } from '@/components/detail/recent-tracker';
import { hasIndicatorContext, getIndicatorContext } from '@/lib/indicator-context';
import { deriveTrendSignals } from '@/lib/trend-signals';
import { composeInsight } from '@/lib/indicator-insight';

interface IndicatorPageProps {
  params: Promise<{
    indicator: string;
  }>;
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { indicator } = await params;

  let data: Awaited<ReturnType<typeof getIndicatorByCode>> | null = null;
  let error: string | null = null;

  try {
    data = await getIndicatorByCode(indicator);
  } catch (err) {
    if (err instanceof MindicadorApiError && err.status === 404) {
      notFound();
    }
    error = 'Error al cargar el indicador. Intente nuevamente más tarde.';
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-error-border bg-error-bg p-4">
        <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-error-text">
          {error || 'Error al cargar el indicador.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <RecentTracker codigo={data.codigo} />
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver
      </Link>
      <IndicatorHeader
        codigo={data.codigo}
        nombre={data.nombre}
        unidadMedida={data.unidad_medida}
        valorActual={data.serie[0]?.valor}
        valorAnterior={data.serie[1]?.valor}
      />
      {hasIndicatorContext(data.codigo) && data.serie.length >= 2 && (
        <IndicatorInsightBlock
          insight={composeInsight({
            context: getIndicatorContext(data.codigo),
            signals: deriveTrendSignals(data.serie),
          })}
        />
      )}
      <IndicatorHistory serie={data.serie} unidadMedida={data.unidad_medida} />
      {hasIndicatorContext(data.codigo) && data.serie.length >= 2 && (
        <IndicatorInsight
          insight={composeInsight({
            context: getIndicatorContext(data.codigo),
            signals: deriveTrendSignals(data.serie),
          })}
        />
      )}
    </div>
  );
}
