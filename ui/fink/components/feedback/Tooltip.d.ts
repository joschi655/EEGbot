import * as React from 'react';

/**
 * A hover/focus tooltip wrapping a trigger element. CSS-only show/hide;
 * keep labels short (single line). Wrap an interactive child so it is
 * keyboard-focusable.
 */
export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tooltip text. */
  label: React.ReactNode;
  /** Placement relative to the trigger. @default 'top' */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export declare function Tooltip(props: TooltipProps): JSX.Element;
