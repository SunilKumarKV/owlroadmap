import type { FC } from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: Array<string | RadioOption>;
  value: string;
  onChange: (value: string) => void;
  labels?: { [key: string]: string };
  className?: string;
}

const RadioGroup: FC<RadioGroupProps> = ({ options, value, onChange, labels, className }) => {
  const normalizedOptions = options.map((option) => typeof option === 'string' ? { value: option, label: option } : option);

  return (
    <div className={['flex flex-col space-y-2', className].filter(Boolean).join(' ')}>
      {normalizedOptions.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="text-blue-500 focus:ring-2 ring-offset-2 ring-blue-500"
          />
          {labels ? labels[option.value] || option.label : option.label}
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;