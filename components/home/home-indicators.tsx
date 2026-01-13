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
      {favoriteIndicators.length > 0 && (
        <section aria-labelledby="favorites-heading" className="mb-8">
          <h2
            id="favorites-heading"
            className="mb-3 text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text-muted"
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
      )}
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
    </>
  );
}
