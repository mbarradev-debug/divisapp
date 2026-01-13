'use client';

interface ReorderControlsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  itemName: string;
}

export function ReorderControls({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  itemName,
}: ReorderControlsProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMoveUp();
        }}
        disabled={!canMoveUp}
        aria-label={`Mover ${itemName} hacia arriba`}
        className="inline-flex items-center justify-center rounded p-1 text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset disabled:opacity-30 disabled:pointer-events-none"
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
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMoveDown();
        }}
        disabled={!canMoveDown}
        aria-label={`Mover ${itemName} hacia abajo`}
        className="inline-flex items-center justify-center rounded p-1 text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset disabled:opacity-30 disabled:pointer-events-none"
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}
