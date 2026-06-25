import type { ChangeEvent, FC } from 'react';

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const Input: FC<InputProps> = ({ value, onChange, placeholder, className }) => {
  return (
    <input
      type="text"
      className={['px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 ring-offset-2 ring-blue-500 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-2 dark:ring-offset-2 dark:ring-blue-500', className]
        .filter(Boolean)
        .join(' ')}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default Input;