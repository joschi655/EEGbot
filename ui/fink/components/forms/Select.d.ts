import * as React from 'react';

export interface SelectOption { value: string; label: string; }

/**
 * A styled native <select> with a custom chevron. Pass `options` as
 * strings or {value,label}, or provide <option> children directly.
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Field label shown above the control. */
  label?: string;
  /** Options as strings or {value,label} objects. */
  options?: Array<string | SelectOption>;
  /** Disabled first option shown when nothing is selected. */
  placeholder?: string;
  /** Control height. @default 'md' */
  size?: 'sm' | 'md';
}

export declare function Select(props: SelectProps): JSX.Element;
