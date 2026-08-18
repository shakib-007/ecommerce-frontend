'use client';

interface InvalidProp {
  errors: Record<string, unknown>;
  touched: Record<string, unknown>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showAsterisk?: boolean;
  invalid?: InvalidProp;
}

export default function Input({
  label,
  error,
  helperText,
  invalid,
  showAsterisk = false,
  className = '',
  id,
  name,
  ...props
}: InputProps) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const fieldError =
    invalid && name
      ? invalid.touched[name] && invalid.errors[name]
        ? String(invalid.errors[name])
        : undefined
      : error;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {showAsterisk && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        className={`
          w-full rounded-lg border px-4 py-2.5 text-sm text-ink
          outline-none transition-all duration-200
          placeholder:text-muted-light
          ${
            fieldError
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-border-strong focus:border-ink focus:ring-2 focus:ring-accent-soft'
          }
          disabled:bg-surface-muted disabled:text-muted
          ${className}
        `}
        {...props}
      />

      {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}

      {helperText && !fieldError && (
        <p className="text-xs text-muted-light">{helperText}</p>
      )}
    </div>
  );
}
