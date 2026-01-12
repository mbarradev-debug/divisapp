import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="mb-2 text-6xl font-bold text-zinc-900 dark:text-zinc-50">
        404
      </h1>
      <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
        Página no encontrada
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
