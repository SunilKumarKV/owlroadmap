import type { FC } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: Array<string | RadioOption>;
  value: string;
  onChange: (value: string) => void;
  labels?: { [key: string]: string };
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const RadioGroup: FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  labels,
  className,
  disabled,
  loading
}) => {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );

  return (
    <div className={['flex flex-col space-y-2 relative', className].filter(Boolean).join(' ')}>
      {normalizedOptions.map((option) => {
        const optionDisabled = disabled || option.disabled || loading;
        return (
          <label
            key={option.value}
            className={[
              'flex items-center space-x-2 select-none transition-opacity duration-200',
              optionDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ].filter(Boolean).join(' ')}
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => !optionDisabled && onChange(option.value)}
              disabled={optionDisabled}
              className="text-blue-500 focus:ring-2 ring-offset-2 ring-blue-500"
            />
            <span>{labels ? labels[option.value] || option.label : option.label}</span>
          </label>
        );
      })}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-[1px] rounded-md">
          <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default RadioGroup;