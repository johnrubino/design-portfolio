import type { CSSProperties, ElementType, ReactNode } from 'react';

/** Rises 16px and fades in, staggered 70ms by index after the page's base delay. */
export function Reveal({
  i,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: {
  i: number;
  as?: ElementType;
  className?: string;
  children: ReactNode;
  [attr: string]: unknown;
}) {
  return (
    <Tag className={`rv ${className}`} style={{ '--i': i } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
