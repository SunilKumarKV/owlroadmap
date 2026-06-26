import type { FC, ReactNode } from 'react';
import Link from 'next/link';

export interface ButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  disabled?: boolean;
  href?: string;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Spinner: FC = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  icon,
  disabled,
  href,
  loading,
  className,
  type = 'button'
}) => {
  const classes = [
    'px-4 py-2 rounded-md font-semibold text-white transition duration-300 flex items-center justify-center',
    variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 focus:ring-2 ring-offset-2 ring-blue-500' : '',
    variant === 'secondary' ? 'bg-gray-300 hover:bg-gray-400 focus:ring-2 ring-offset-2 ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-2 dark:ring-offset-2 dark:ring-gray-700' : '',
    icon ? 'space-x-2' : '',
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {loading && <Spinner />}
        {icon && !loading && <span>{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
    >
      {loading && <Spinner />}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;