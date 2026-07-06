const UNOPTIMIZED_IMAGE_HOSTS = ["placehold.co"];

/**
 * placehold.co can serve SVG for URLs without an explicit raster extension,
 * which Next.js Image Optimization rejects unless dangerouslyAllowSVG is on.
 * Skip optimization for these placeholder hosts instead of widening that risk.
 */
export function isUnoptimizedImage(url: string): boolean {
  try {
    return UNOPTIMIZED_IMAGE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}
