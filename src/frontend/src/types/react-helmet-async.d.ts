declare module 'react-helmet-async' {
  import { ReactNode } from 'react';

  export interface HelmetProps {
    children?: ReactNode;
    title?: string;
    titleTemplate?: string;
    defaultTitle?: string;
    htmlAttributes?: Record<string, any>;
    bodyAttributes?: Record<string, any>;
    meta?: Array<{ name?: string; property?: string; content: string; httpEquiv?: string }>;
    link?: Array<{ rel?: string; href?: string; [key: string]: any }>;
    script?: Array<{ src?: string; type?: string; innerHTML?: string; [key: string]: any }>;
    noscript?: Array<{ innerHTML: string }>;
    style?: Array<{ cssText: string; type?: string }>;
    base?: { target?: string; href: string };
  }

  export const Helmet: React.FC<HelmetProps>;
  export const HelmetProvider: React.FC<{ children: ReactNode }>;
}
