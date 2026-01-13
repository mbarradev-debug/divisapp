import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'h-11 rounded-lg px-4 text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset transition-colors';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary',
    secondary:
      'bg-bg-subtle text-text border border-border hover:bg-bg-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg-subtle',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
