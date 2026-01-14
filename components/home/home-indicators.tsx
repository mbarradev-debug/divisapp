'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';
import { useFavorites, useRecentIndicators } from '@/lib/storage';
import { formatValue } from '@/lib/format';
import { IndicatorItem } from './indicator-item';
import { FavoriteIndicatorItem } from './favorite-indicator-item';

interface HomeIndicatorsProps {
  indicators: IndicatorValue[];
}

export function HomeIndicators({ indicators }: HomeIndicatorsProps) {
  const { favorites } = useFavorites();
  const { recents } = useRecentIndicators();

  const { favoriteIndicators, recentIndicators, otherIndicators } = useMemo(() => {
    const favoritesSet = new Set(favorites);
    const recentsSet = new Set(recents);
    const indicatorMap = new Map(indicators.map((ind) => [ind.codigo, ind]));
    const favs: IndicatorValue[] = [];
    const recs: IndicatorValue[] = [];

    // Build favorites in the order they appear in the favorites array
    for (const codigo of favorites) {
      const indicator = indicatorMap.get(codigo);
      if (indicator) {
        favs.push(indicator);
      }
    }

    // Build recents (always excluding favorites, ordered by recency)
    for (const codigo of recents) {
      if (!favoritesSet.has(codigo)) {
        const indicator = indicatorMap.get(codigo);
        if (indicator) {
          recs.push(indicator);
        }
      }
    }

    const hasFavorites = favs.length > 0;
    const hasRecents = recs.length > 0;

    // Build others list based on scenario:
    // - If favorites exist: exclude favorites from others
    // - If no favorites but recents exist: exclude recents from others
    // - If neither: show all in default order
    let others: IndicatorValue[];

    if (hasFavorites) {
      others = indicators.filter((ind) => !favoritesSet.has(ind.codigo));
    } else if (hasRecents) {
      others = indicators.filter((ind) => !recentsSet.has(ind.codigo));
    } else {
      others = [...indicators];
    }

    return { favoriteIndicators: favs, recentIndicators: recs, otherIndicators: others };
  }, [indicators, favorites, recents]);

  const hasFavorites = favoriteIndicators.length > 0;
  const hasRecents = recentIndicators.length > 0;

  return (
    <>
      {hasFavorites ? (
        <section aria-labelledby="favorites-heading" className="mb-6 pb-6 border-b border-border-subtle">
          <h2
            id="favorites-heading"
            className="mb-4 text-[length:var(--text-body)] font-semibold leading-[var(--leading-body)] text-text-muted"
          >
            Favoritos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {favoriteIndicators.map((indicator, index) => (
              <FavoriteIndicatorItem
                key={indicator.codigo}
                indicator={indicator}
                index={index}
                totalCount={favoriteIndicators.length}
              />
            ))}
          </div>
        </section>
      ) : hasRecents ? (
        <section aria-labelledby="recents-heading" className="mb-6 pb-6 border-b border-border-subtle">
          <h2
            id="recents-heading"
            className="mb-4 text-[length:var(--text-body)] font-semibold leading-[var(--leading-body)] text-text-muted"
          >
            Vistos recientemente
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentIndicators.map((indicator) => (
              <Link
                key={indicator.codigo}
                href={`/${indicator.codigo}`}
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-subtle px-3 py-1.5 text-[length:var(--text-small)] leading-[var(--leading-small)] hover:border-border hover:bg-bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
              >
                <span className="text-text-secondary">{indicator.nombre}</span>
                <span className="font-medium tabular-nums text-text">
                  {formatValue(indicator.valor, indicator.unidad_medida)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section aria-label="Todos los indicadores" className={hasFavorites || hasRecents ? 'pt-2' : ''}>
        {otherIndicators.length === 0 ? (
          <p className="py-8 text-center text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
            No hay indicadores disponibles.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {otherIndicators.map((indicator) => (
              <IndicatorItem key={indicator.codigo} indicator={indicator} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
