import * as React from 'react';

export type BannerTone = 'info' | 'compliant' | 'pending' | 'overdue' | 'neutral';

/**
 * An inline notice / alert block tied to a compliance tone. Provides a
 * default Lucide icon per tone (call lucide.createIcons() after render),
 * optional title, actions, and a dismiss button.
 */
export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tone / severity. @default 'info' */
  tone?: BannerTone;
  /** Bold title line. */
  title?: React.ReactNode;
  /** Override the default tone icon. */
  icon?: React.ReactNode;
  /** Action buttons row. */
  actions?: React.ReactNode;
  /** When provided, shows a ✕ that calls this. */
  onDismiss?: () => void;
}

export declare function Banner(props: BannerProps): JSX.Element;
