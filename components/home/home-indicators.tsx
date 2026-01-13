'use client';

import { useMemo } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';
import { useFavorites } from '@/lib/storage';
import { IndicatorItem } from './indicator-item';
import { FavoriteIndicatorItem } from './favorite-indicator-item';

interface HomeIndicatorsProps {
  indicators: IndicatorValue[];
}

export function HomeIndicators({ indicators }: HomeIndicatorsProps) {
  const { favorites } = useFavorites();

  const { favoriteIndicators, otherIndicators } = useMemo(() => {
    if (favorites.length === 0) {
      return { favoriteIndicators: [], otherIndicators: indicators };
    }
    const favoritesSet = new Set(favorites);
    const indicatorMap = new Map(indicators.map((ind) => [ind.codigo, ind]));
    const favs: IndicatorValue[] = [];
    const others: IndicatorValue[] = [];

    // Build favorites in the order they appear in the favorites array
    for (const codigo of favorites) {
      const indicator = indicatorMap.get(codigo);
      if (indicator) {
        favs.push(indicator);
      }
    }

    // Build others from remaining indicators
    for (const indicator of indicators) {
      if (!favoritesSet.has(indicator.codigo)) {
        others.push(indicator);
      }
    }

    return { favoriteIndicators: favs, otherIndicators: others };
  }, [indicators, favorites]);

  return (
    <>
      <section aria-labelledby="favorites-heading" className="mb-6 pb-6 border-b border-border-subtle">
        <h2
          id="favorites-heading"
          className="mb-4 text-[length:var(--text-body)] font-semibold leading-[var(--leading-body)] text-text-muted"
        >
          Favoritos
        </h2>
        {favoriteIndicators.length > 0 ? (
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
        ) : (
          <div className="rounded-lg border border-border-subtle bg-bg-subtle px-4 py-3">
            <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
              No tienes indicadores favoritos.
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted/70">
              <span>Toca</span>
              <svg
                className="inline-block h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>en un indicador para agregarlo.</span>
            </p>
          </div>
        )}
      </section>
      <section aria-label="Todos los indicadores" className="pt-2">
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
