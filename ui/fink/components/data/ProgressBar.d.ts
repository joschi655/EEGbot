import * as React from 'react';

/**
 * A horizontal progress / completion bar. Use for filing completeness,
 * portfolio compliance share, or upload progress. Tone can echo a
 * compliance state.
 */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. @default 0 */
  value?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Label above the bar. */
  label?: React.ReactNode;
  /** Show the percentage/value text. @default true */
  showValue?: boolean;
  /** Fill color. @default 'accent' */
  tone?: 'accent' | 'compliant' | 'pending' | 'overdue';
  /** Bar thickness. @default 'md' */
  size?: 'md' | 'lg';
  /** Custom value formatter (value, max) => string. */
  valueFormat?: (value: number, max: number) => string;
}

export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
