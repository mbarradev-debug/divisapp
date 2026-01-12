import { notFound } from 'next/navigation';
import { getIndicatorByCode, MindicadorApiError } from '@/lib/api/mindicador';
import { IndicatorHeader } from '@/components/detail/indicator-header';
import { IndicatorSeriesList } from '@/components/detail/indicator-series-list';

interface IndicatorPageProps {
  params: Promise<{
    indicator: string;
  }>;
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { indicator } = await params;

  try {
    const data = await getIndicatorByCode(indicator);

    return (
      <div>
        <IndicatorHeader
          nombre={data.nombre}
          unidadMedida={data.unidad_medida}
        />
        <IndicatorSeriesList serie={data.serie.slice(0, 10)} />
      </div>
    );
  } catch (error) {
    if (error instanceof MindicadorApiError && error.status === 404) {
      notFound();
    }

    return (
      <div className="text-center">
        <p className="text-red-600 dark:text-red-400">
          Error al cargar el indicador. Intente nuevamente más tarde.
        </p>
      </div>
    );
  }
}
