import * as React from 'react';

/**
 * An on/off toggle for instant settings (no save button). Use for
 * binary preferences; use Checkbox inside forms that are submitted.
 */
export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Inline label to the right of the toggle. */
  label?: React.ReactNode;
}

export declare function Switch(props: SwitchProps): JSX.Element;
