import { type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  id: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  id,
  options,
  placeholder,
  disabled,
  className = '',
  ...props
}: SelectProps) {
  const baseStyles =
    'h-11 w-full appearance-none rounded-lg border border-border-strong bg-bg-subtle px-3 pr-10 text-[length:var(--text-body)] leading-[var(--leading-body)] text-text focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors';

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed bg-bg-muted'
    : '';

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          className={`${baseStyles} ${disabledStyles} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-text-secondary"
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
        </div>
      </div>
    </div>
  );
}
