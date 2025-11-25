import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
          {
            'bg-[#4a9d94] text-white hover:bg-[#3d8a82] focus:ring-[#4a9d94] shadow-[0_1px_3px_rgba(74,157,148,0.3)]': variant === 'primary',
            'bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:bg-[#fafafa] focus:ring-[#4a9d94]': variant === 'secondary',
            'text-[#6b6b6b] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] focus:ring-[#4a9d94]': variant === 'ghost',
            'bg-[#d94f4f] text-white hover:bg-[#c44545] focus:ring-[#d94f4f]': variant === 'danger',
          },
          {
            'px-4 py-2 text-sm min-h-[36px]': size === 'sm',
            'px-5 py-2.5 text-base min-h-[44px]': size === 'md',
            'px-6 py-3.5 text-base min-h-[56px]': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
