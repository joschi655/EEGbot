import * as React from 'react';

export type IconButtonVariant = 'ghost' | 'outline' | 'solid';
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * A square, icon-only button for toolbars, table-row actions, and
 * dismiss/close affordances. Always pass `label` for accessibility.
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. @default 'ghost' */
  variant?: IconButtonVariant;
  /** Square size. @default 'md' */
  size?: IconButtonSize;
  /** Icon node (e.g. a Lucide <i data-lucide="x" />). */
  icon?: React.ReactNode;
  /** Accessible label — sets aria-label and title. Required. */
  label: string;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
