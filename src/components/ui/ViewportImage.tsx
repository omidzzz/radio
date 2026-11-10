interface ViewportImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  mobileSrc?: string;
  mobileMedia?: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}

export default function ViewportImage({
  src,
  alt,
  width,
  height,
  mobileSrc,
  mobileMedia = "(max-width: 639px)",
  className,
  loading = "eager",
  fetchPriority = "high",
}: ViewportImageProps) {
  return (
    <picture>
      {mobileSrc ? <source media={mobileMedia} srcSet={mobileSrc} /> : null}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
      />
    </picture>
  );
}