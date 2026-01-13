import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="mb-2 text-[length:var(--text-display)] font-bold leading-[var(--leading-display)] text-text">
        404
      </h1>
      <p className="mb-6 text-[length:var(--text-section)] leading-[var(--leading-section)] text-text-secondary">
        Página no encontrada
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-primary-foreground hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
