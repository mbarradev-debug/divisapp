'use client';

import { useFavorites } from '@/lib/storage';

interface FavoriteButtonProps {
  codigo: string;
  nombre: string;
  className?: string;
}

export function FavoriteButton({ codigo, nombre, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(codigo);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(codigo);
      }}
      aria-label={favorited ? `Quitar ${nombre} de favoritos` : `Agregar ${nombre} a favoritos`}
      aria-pressed={favorited}
      className={`inline-flex items-center justify-center rounded p-1 text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset ${className}`}
    >
      <svg
        className="h-5 w-5"
        fill={favorited ? 'currentColor' : 'none'}
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
    </button>
  );
}
