import * as React from 'react';

/**
 * A user/entity avatar. Shows an image when `src` is given, otherwise
 * derives up-to-two-letter initials from `name`. Klein-tinted by default.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — used for initials fallback and tooltip. */
  name?: string;
  /** Image URL; falls back to initials if omitted. */
  src?: string;
  /** Size. @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Solid Klein fill instead of tint. @default false */
  accent?: boolean;
}

export declare function Avatar(props: AvatarProps): JSX.Element;
