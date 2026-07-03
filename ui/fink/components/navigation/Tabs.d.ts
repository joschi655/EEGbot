import * as React from 'react';

export interface TabItem {
  /** Stable value identifying the tab. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional trailing count pill. */
  count?: number;
}

/**
 * A horizontal tab bar (underline or pill). Controlled via `value` +
 * `onChange`, or uncontrolled via `defaultValue`.
 */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tab definitions. */
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value on selection. */
  onChange?: (value: string) => void;
  /** Visual style. @default 'underline' */
  variant?: 'underline' | 'pill';
}

export declare function Tabs(props: TabsProps): JSX.Element;
