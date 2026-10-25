import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export function PasswordField({
  label,
  placeholder,
  error,
  register,
  showStrength = false,
  value = '',
}: {
  label: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegisterReturn;
  showStrength?: boolean;
  value?: string;
}) {
  const [show, setShow] = useState(false);
  
  const rules = [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(value) },
    { label: 'One number', met: /[0-9]/.test(value) },
  ];
  
  const strength = rules.filter(r => r.met).length;
  const strengthLabel = strength === 0 ? '' : strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : 'Strong';
  const strengthColor = strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink-900">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border pl-10 pr-12 text-ink-900 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-ink-300 focus:border-green-500 focus:ring-green-100'
          }`}
          {...register}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {showStrength && value && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-ink-600">Password strength</span>
            <span className={`font-semibold ${strength >= 3 ? 'text-green-600' : strength === 2 ? 'text-amber-600' : 'text-red-600'}`}>
              {strengthLabel}
            </span>
          </div>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-ink-200'}`} />
            ))}
          </div>
          <ul className="space-y-1 text-xs">
            {rules.map((rule, idx) => (
              <li key={idx} className={`flex items-center gap-2 ${rule.met ? 'text-green-600' : 'text-ink-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${rule.met ? 'bg-green-600' : 'bg-ink-400'}`} />
                {rule.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
