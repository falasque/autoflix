import React from 'react';
import { useShakeAnimation } from '@/hooks/useShakeAnimation';

interface AnimatedButtonProps {
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  href,
  target,
  rel,
  className = '',
  children,
  ariaLabel
}) => {
  const elementRef = useShakeAnimation();

  return (
    <a
      ref={elementRef as React.Ref<HTMLAnchorElement>}
      href={href}
      target={target}
      rel={rel}
      className={`${className} animated-shake-button`}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
};
