import { type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  id: string;
  error?: boolean;
}

export function Input({
  label,
  id,
  error = false,
  disabled,
  className = '',
  ...props
}: InputProps) {
  const baseStyles =
    'h-11 w-full rounded-lg border bg-bg-subtle px-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 transition-colors';

  const stateStyles = error
    ? 'border-error focus:border-error focus:ring-error/20'
    : 'border-border-strong focus:border-ring focus:ring-ring/20';

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
      <input
        id={id}
        disabled={disabled}
        className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
        {...props}
      />
    </div>
  );
}
