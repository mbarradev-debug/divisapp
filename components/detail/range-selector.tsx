'use client';

type RangeOption = 7 | 30 | 90;

interface RangeSelectorProps {
  value: RangeOption;
  onChange: (range: RangeOption) => void;
}

const options: { value: RangeOption; label: string }[] = [
  { value: 7, label: '7 días' },
  { value: 30, label: '30 días' },
  { value: 90, label: '90 días' },
];

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-border-subtle bg-bg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-[length:var(--text-label)] leading-[var(--leading-label)] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-ring-offset ${
            value === option.value
              ? 'bg-bg-subtle text-text'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
