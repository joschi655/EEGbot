import * as React from 'react';

/**
 * A centered modal dialog with blurred backdrop. Controlled via `open`;
 * renders nothing when closed. Clicking the backdrop or close button
 * calls `onClose`. Put actions in `footer`.
 */
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called on backdrop click / close button / escape affordance. */
  onClose?: () => void;
  /** Title line. */
  title?: React.ReactNode;
  /** Sub-text under the title. */
  description?: React.ReactNode;
  /** Footer node (action buttons). */
  footer?: React.ReactNode;
  /** Max width in px or any CSS length. @default 480 */
  width?: number | string;
}

export declare function Dialog(props: DialogProps): JSX.Element;
