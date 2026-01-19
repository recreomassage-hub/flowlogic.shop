import { ReactNode, HTMLAttributes } from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-lg'
  | 'label'
  | 'caption';

export type TypographyColor = 'heading' | 'body' | 'accent' | 'error' | 'warning' | 'success';

export interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  variant?: TypographyVariant;
  as?: keyof JSX.IntrinsicElements; // для semantic HTML (h1-h6, p, span, etc.)
  color?: TypographyColor;
  children: ReactNode;
  // Support htmlFor for label elements
  htmlFor?: string;
}
