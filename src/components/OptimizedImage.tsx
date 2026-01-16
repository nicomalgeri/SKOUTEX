/**
 * Optimized Image Component
 * Adds lazy loading and proper sizing to Next.js Image component
 */

import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "loading"> {
  /**
   * Priority images (above fold) should not be lazy loaded
   * Default: false (lazy load)
   */
  priority?: boolean;
}

/**
 * Optimized wrapper around Next.js Image component
 * Automatically adds lazy loading for images below the fold
 *
 * @example
 * ```tsx
 * // Lazy loaded (default)
 * <OptimizedImage src={player.image_path} alt="Player" width={56} height={56} />
 *
 * // Priority (above fold)
 * <OptimizedImage src={hero.jpg} alt="Hero" width={1200} height={600} priority />
 * ```
 */
export function OptimizedImage({
  priority = false,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      {...props}
      loading={priority ? undefined : "lazy"}
      priority={priority}
    />
  );
}

export default OptimizedImage;
