'use client';

import Link from 'next/link';
import { useAuthState } from '@/lib/storage';

export function UserStateIndicator() {
  const { isAuthenticated } = useAuthState();

  return (
    <Link
      href="/settings"
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary hover:bg-bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
      aria-label={isAuthenticated ? 'Cuenta (vista previa)' : 'Cuenta (anónimo)'}
    >
      {/* User icon */}
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
          strokeWidth={1.5}
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
      <span className="hidden sm:inline">
        {isAuthenticated ? 'Vista previa' : 'Anónimo'}
      </span>
    </Link>
  );
}
