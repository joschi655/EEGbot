import * as React from 'react';

/**
 * A KPI metric — big tabular-numeral value with label and optional
 * trend delta. Use in dashboard summary rows.
 */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase metric label. */
  label?: React.ReactNode;
  /** The headline value (number or formatted string). */
  value: React.ReactNode;
  /** Small unit appended to the value, e.g. "MW", "%". */
  unit?: React.ReactNode;
  /** Delta text shown with a trend arrow, e.g. "+4 diese Woche". */
  delta?: React.ReactNode;
  /** Trend direction controlling arrow + color. @default 'flat' */
  trend?: 'up' | 'down' | 'flat';
  /** Extra muted footnote after the delta. */
  foot?: React.ReactNode;
}

export declare function Stat(props: StatProps): JSX.Element;
