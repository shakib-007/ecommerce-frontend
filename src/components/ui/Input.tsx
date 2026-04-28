// src/components/ui/Input.tsx
'use client';

interface InvalidProp {
  errors:  Record<string, string>;
  touched: Record<string, boolean>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:      string;
  error?:      string;
  helperText?: string;
  showAsterisk?: boolean;
  invalid?:    InvalidProp;
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

  // If invalid prop passed, extract error using field name automatically
  // This is what makes {...getFieldProps('email')} + invalid={{ errors, touched }} work
  const fieldError = invalid && name
    ? invalid.touched[name] && invalid.errors[name]
      ? invalid.errors[name]
      : undefined
    : error;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {showAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm text-black
          outline-none transition-all duration-200
          placeholder:text-gray-400
          ${fieldError
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
          }
          disabled:bg-gray-50 disabled:text-gray-500
          ${className}
        `}
        {...props}
      />

      {fieldError && (
        <p className="text-xs text-red-500">{fieldError}</p>
      )}

      {helperText && !fieldError && (
        <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}