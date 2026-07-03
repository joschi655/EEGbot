import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accentSoft' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The primary action control. Klein-blue `primary` for the single most
 * important action on a view; `secondary` (outlined) and `ghost` for
 * everything else. `accentSoft` is a low-emphasis branded button;
 * `danger` for destructive actions only.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. @default 'primary' */
  variant?: ButtonVariant;
  /** Control height. @default 'md' */
  size?: ButtonSize;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  /** Icon node rendered before the label (e.g. a Lucide <i>/<svg>). */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
}

export declare function Button(props: ButtonProps): JSX.Element;
