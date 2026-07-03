import * as React from 'react';

/**
 * A small mono-set metadata token — filters, legal §-refs, attributes.
 * Lower emphasis than Badge (which is for status). Optionally removable.
 */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Klein-tinted variant. @default false */
  accent?: boolean;
  /** When provided, renders a removable ✕ and calls this on click. */
  onRemove?: (e: React.MouseEvent) => void;
}

export declare function Tag(props: TagProps): JSX.Element;
