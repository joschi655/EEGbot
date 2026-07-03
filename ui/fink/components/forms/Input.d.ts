import * as React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

/**
 * A labelled text input with optional hint, error, leading icon and
 * suffix unit. Wraps a native <input>, so all native props pass through.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label shown above the control. */
  label?: string;
  /** Helper text shown below (hidden when `error` is set). */
  hint?: string;
  /** Error message — turns the field red and replaces the hint. */
  error?: string;
  /** Marks the field required (adds a red asterisk). @default false */
  required?: boolean;
  /** Control height. @default 'md' */
  size?: InputSize;
  /** Icon node rendered inside, before the text. */
  iconLeft?: React.ReactNode;
  /** Trailing unit/affix, e.g. "kWp" (mono, muted). */
  suffix?: React.ReactNode;
}

export declare function Input(props: InputProps): JSX.Element;
