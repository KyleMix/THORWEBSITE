import Image from 'next/image';
import type { ImgMeta } from '@/lib/images';

type Props = {
  img: ImgMeta;
  alt: string;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  quality?: number;
};

/** The one image component. Real dimensions, blur-up, AVIF/WebP via next/image. */
export function Pic({ img, alt, sizes, priority = false, fill = false, className, quality = 78 }: Props) {
  const blur = img.blur ? { placeholder: 'blur' as const, blurDataURL: img.blur } : {};
  if (fill) {
    return <Image src={img.src} alt={alt} fill sizes={sizes} priority={priority} quality={quality} className={className} {...blur} />;
  }
  return (
    <Image
      src={img.src}
      alt={alt}
      width={img.width}
      height={img.height}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      quality={quality}
      className={className}
      {...blur}
    />
  );
}
