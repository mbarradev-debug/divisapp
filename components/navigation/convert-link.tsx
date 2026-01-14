'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const INDICATOR_CODES = [
  'uf',
  'ivp',
  'dolar',
  'dolar_intercambio',
  'euro',
  'ipc',
  'utm',
  'imacec',
  'tpm',
  'libra_cobre',
  'tasa_desempleo',
  'bitcoin',
];

export function ConvertLink() {
  const pathname = usePathname();

  // Extract indicator code from pathname (e.g., "/dolar" -> "dolar")
  const indicatorMatch = pathname.match(/^\/([a-z_]+)$/);
  const currentIndicator = indicatorMatch?.[1];

  // Build href with query param if on an indicator page
  const href =
    currentIndicator && INDICATOR_CODES.includes(currentIndicator)
      ? `/convert?from=${currentIndicator}`
      : '/convert';

  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text-secondary hover:bg-bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Convertir
    </Link>
  );
}
