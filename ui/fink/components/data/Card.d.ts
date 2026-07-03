import * as React from 'react';

export type CardVariant = 'default' | 'flat' | 'raised' | 'interactive' | 'accent';

/**
 * The primary surface container — wraps content on the page in a
 * bordered, lightly-shadowed panel with optional header and footer.
 * `accent` adds a Klein top-rule; `interactive` adds hover lift.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface style. @default 'default' */
  variant?: CardVariant;
  /** Header title (omit header entirely if no title/subtitle/action). */
  title?: React.ReactNode;
  /** Sub-text under the title. */
  subtitle?: React.ReactNode;
  /** Right-aligned node in the header (button, menu, badge). */
  headerAction?: React.ReactNode;
  /** Footer content (actions, meta). */
  footer?: React.ReactNode;
  /** Reduce body padding. @default false */
  tight?: boolean;
  /** Render children raw, without the padded body wrapper. @default false */
  noBody?: boolean;
}

export declare function Card(props: CardProps): JSX.Element;
