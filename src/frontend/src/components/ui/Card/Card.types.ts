import { ReactNode, HTMLAttributes } from 'react';

export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  onClick?: () => void;
}



