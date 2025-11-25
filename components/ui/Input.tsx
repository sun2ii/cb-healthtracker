import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2.5">
        {label && (
          <label htmlFor={inputId} className="block text-base font-medium text-[#1a1a1a]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3.5 min-h-[52px] text-base rounded-xl border transition-all',
            'bg-white text-[#1a1a1a]',
            'border-[#e5e0d8]',
            'focus:outline-none focus:ring-2 focus:ring-[#4a9d94]/20 focus:border-[#4a9d94]',
            'placeholder:text-[#9a9a9a]',
            error && 'border-[#d94f4f] focus:ring-[#d94f4f]/20 focus:border-[#d94f4f]',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[#d94f4f]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2.5">
        {label && (
          <label htmlFor={inputId} className="block text-base font-medium text-[#1a1a1a]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3.5 text-base rounded-xl border transition-all resize-none',
            'bg-white text-[#1a1a1a]',
            'border-[#e5e0d8]',
            'focus:outline-none focus:ring-2 focus:ring-[#4a9d94]/20 focus:border-[#4a9d94]',
            'placeholder:text-[#9a9a9a]',
            error && 'border-[#d94f4f] focus:ring-[#d94f4f]/20 focus:border-[#d94f4f]',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[#d94f4f]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
