import type { ChangeEvent, FC } from 'react';

interface TextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  readOnly?: boolean;
}

const Textarea: FC<TextareaProps> = ({ value, onChange, placeholder, rows, className, readOnly }) => {
  return (
    <textarea
      className={['px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 ring-offset-2 ring-blue-500 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-2 dark:ring-offset-2 dark:ring-blue-500', rows ? `rows-${rows}` : '', className]
        .filter(Boolean)
        .join(' ')}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
};

export default Textarea;