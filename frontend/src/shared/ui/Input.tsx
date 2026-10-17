import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      <input className={`field__input ${className}`} {...rest} />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}