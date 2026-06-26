import type { ComponentPropsWithoutRef, FC } from 'react';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  loading?: boolean;
}

const Textarea: FC<TextareaProps> = ({ className, disabled, loading, rows, ...props }) => {
  return (
    <div className="relative w-full">
      <textarea
        className={[
          'w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 ring-offset-2 ring-blue-500 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-2 dark:ring-offset-2 dark:ring-blue-500 transition-all duration-200',
          disabled || loading ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : '',
          className
        ].filter(Boolean).join(' ')}
        disabled={disabled || loading}
        rows={rows}
        {...props}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-md">
          <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Textarea;