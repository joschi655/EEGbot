import * as React from 'react';

export type BadgeTone = 'compliant' | 'pending' | 'overdue' | 'neutral' | 'info' | 'solid';

/**
 * A compliance status pill. Tones map to the domain states:
 * compliant (green), pending (amber), overdue (red), neutral (draft),
 * info (Klein-soft), solid (Klein-filled). Add `dot` for a leading dot.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status tone. @default 'neutral' */
  tone?: BadgeTone;
  /** Size. @default 'sm' */
  size?: 'sm' | 'lg';
  /** Show a leading status dot. @default false */
  dot?: boolean;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
}

export declare function Badge(props: BadgeProps): JSX.Element;
