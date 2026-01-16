import Link from 'next/link';
import { SettingsClient } from './settings-client';

export default function SettingsPage() {
  return (
    <div>
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
      <h1 className="mb-6 text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-text">
        Configuración
      </h1>
      <SettingsClient />
    </div>
  );
}
