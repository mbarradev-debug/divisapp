'use client';

import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';
import { formatValue } from '@/lib/format';
import { FavoriteButton } from '@/components/ui/favorite-button';

interface FavoriteIndicatorItemProps {
  indicator: IndicatorValue;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  onTouchStart: (index: number) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function FavoriteIndicatorItem({
  indicator,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isDragging,
  isDragOver,
}: FavoriteIndicatorItemProps) {
  return (
    <div
      data-favorite-index={index}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(index)}
      onTouchStart={() => onTouchStart(index)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`relative rounded-lg border bg-bg-subtle touch-none transition-all ${
        isDragging
          ? 'scale-[1.02] shadow-lg border-border opacity-90'
          : isDragOver
            ? 'border-primary bg-bg-muted'
            : 'border-border-subtle hover:border-border hover:bg-bg-muted'
      }`}
    >
      <Link
        href={`/${indicator.codigo}`}
        className="block p-4 pr-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset rounded-lg"
        draggable={false}
      >
        <p className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
          {indicator.nombre}
        </p>
        <p className="mt-1 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
          {formatValue(indicator.valor, indicator.unidad_medida)}
        </p>
      </Link>
      <FavoriteButton
        codigo={indicator.codigo}
        nombre={indicator.nombre}
        className="absolute right-2 top-2"
      />
    </div>
  );
}
