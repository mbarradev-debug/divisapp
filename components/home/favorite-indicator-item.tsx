'use client';

import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';
import { formatValue } from '@/lib/format';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { ReorderControls } from '@/components/ui/reorder-controls';
import { useFavorites } from '@/lib/storage';

interface FavoriteIndicatorItemProps {
  indicator: IndicatorValue;
  index: number;
  totalCount: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function FavoriteIndicatorItem({
  indicator,
  index,
  totalCount,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
}: FavoriteIndicatorItemProps) {
  const { moveFavorite } = useFavorites();

  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(index)}
      className={`relative rounded-lg border bg-bg-subtle ${
        isDragging
          ? 'opacity-50 border-border'
          : isDragOver
            ? 'border-primary'
            : 'border-border-subtle hover:border-border hover:bg-bg-muted'
      }`}
    >
      <Link
        href={`/${indicator.codigo}`}
        className="block p-4 pl-10 pr-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset rounded-lg"
        draggable={false}
      >
        <p className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
          {indicator.nombre}
        </p>
        <p className="mt-1 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
          {formatValue(indicator.valor, indicator.unidad_medida)}
        </p>
      </Link>
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
        <ReorderControls
          onMoveUp={() => moveFavorite(indicator.codigo, 'up')}
          onMoveDown={() => moveFavorite(indicator.codigo, 'down')}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          itemName={indicator.nombre}
        />
      </div>
      <FavoriteButton
        codigo={indicator.codigo}
        nombre={indicator.nombre}
        className="absolute right-2 top-2"
      />
    </div>
  );
}
