import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'rounded-2xl bg-white shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800',
          onClick && 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transition-transform'
        ),
        className
      )}
    >
      {children}
    </div>
  );
}
