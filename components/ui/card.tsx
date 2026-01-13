import { type ReactNode } from 'react';

interface CardProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ header, children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-bg-subtle ${className}`}
    >
      {header && (
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
            {header}
          </h2>
        </div>
      )}
      <div className={header ? '' : 'p-4'}>{children}</div>
    </div>
  );
}
