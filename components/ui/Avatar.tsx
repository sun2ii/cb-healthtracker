import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',      // 32px
    md: 'w-10 h-10 text-sm',    // 40px
    lg: 'w-16 h-16 text-lg',    // 64px
    xl: 'w-20 h-20 text-2xl',   // 80px
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover ring-2 ring-[#e5e0d8]', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        'bg-[#4a9d94] text-white',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
