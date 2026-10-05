"use client";

import React, { type ImgHTMLAttributes } from "react";

type SiteImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "loading" | "fetchPriority"> & {
  src: string;
  alt: string;
  /** Intrinsic width for CLS reservation (required). */
  width: number;
  /** Intrinsic height for CLS reservation (required). */
  height: number;
  /** Hero / LCP image — eager + high fetch priority. */
  priority?: boolean;
};

/**
 * Template/site media — loading defaults from responsive-performance.
 * Prefer WebP paths produced by `pnpm media:site`.
 */
export function SiteImg({
  src,
  alt,
  width,
  height,
  priority = false,
  decoding,
  className,
  ...rest
}: SiteImgProps) {
  const webpSrc = src.replace(/\.(jpe?g|png)$/i, ".webp");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- template sites use static public assets
    <img
      src={webpSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={decoding ?? (priority ? "sync" : "async")}
      className={className}
      /* Deliberate lowercase custom attribute: React 18 does not know `fetchPriority`, and the
         camelCase spelling reaches the DOM as `fetchPriority`, which never matches the real
         `fetchpriority` content attribute — the LCP hint would be silently dropped. Keep the
         lowercase attribute (React logs a dev-only unknown-prop warning; ignore it). */
      {...{ fetchpriority: priority ? "high" : "low" }}
      {...rest}
    />
  );
}
