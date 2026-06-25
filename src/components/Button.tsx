import type { FC, ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  disabled?: boolean;
  href?: string;
  loading?: boolean;
}

const Button: FC<ButtonProps> = ({ children, onClick, variant = 'primary', icon, disabled, href, loading }) => {
  const classes = [
    'px-4 py-2 rounded-md font-semibold text-white transition duration-300',
    variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 focus:ring-2 ring-offset-2 ring-blue-500' : '',
    variant === 'secondary' ? 'bg-gray-300 hover:bg-gray-400 focus:ring-2 ring-offset-2 ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-2 dark:ring-offset-2 dark:ring-gray-700' : '',
    icon ? 'flex items-center space-x-2' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'bg-blue-300 hover:bg-blue-400 focus:ring-2 ring-offset-2 ring-blue-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-2 dark:ring-offset-2 dark:ring-gray-700' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon && <span>{icon}</span>}
        {loading ? 'Loading...' : children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={disabled || loading ? undefined : onClick}
    >
      {icon && <span>{icon}</span>}
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;