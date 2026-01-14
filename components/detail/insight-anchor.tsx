'use client';

const INSIGHT_SECTION_ID = 'indicator-insight';

export function InsightAnchor() {
  const handleClick = () => {
    const element = document.getElementById(INSIGHT_SECTION_ID);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mb-4 inline-flex items-center gap-1.5 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset rounded-sm"
      aria-label="Ver interpretación del indicador"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Ver interpretación</span>
    </button>
  );
}

export { INSIGHT_SECTION_ID };
