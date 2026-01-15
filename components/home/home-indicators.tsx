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

    // Build others: exclude only favorites (recents section is informational, not exclusive)
    const others = indicators.filter((ind) => !favoritesSet.has(ind.codigo));

    return { favoriteIndicators: favs, recentIndicators: recs, otherIndicators: others };
  }, [indicators, favorites, recents]);

  const hasFavorites = favoriteIndicators.length > 0;
  const hasRecents = recentIndicators.length > 0;

  return (
    <>
      {hasFavorites && (
        <section aria-labelledby="favorites-heading" className="mb-6 pb-6 border-b border-border-subtle">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="favorites-heading"
              className="text-[length:var(--text-body)] font-semibold leading-[var(--leading-body)] text-text-muted"
            >
              Favoritos
            </h2>
            <Link
              href="/notifications"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary hover:border-border hover:bg-bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Notificaciones
            </Link>
          </div>
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
      {hasRecents && (
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
      )}
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
