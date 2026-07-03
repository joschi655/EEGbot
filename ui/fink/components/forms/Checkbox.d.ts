import * as React from 'react';

/**
 * A checkbox with optional label and description. Wraps a native
 * checkbox input (supports `checked`, `defaultChecked`, `onChange`,
 * and the `indeterminate` DOM property via ref).
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Inline label text. */
  label?: React.ReactNode;
  /** Secondary description below the label. */
  description?: React.ReactNode;
}

export declare function Checkbox(props: CheckboxProps): JSX.Element;
