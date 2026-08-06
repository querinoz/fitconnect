/**
 * ImageKit media pipeline — URL builder and Next.js custom loader.
 *
 * Set NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/your-id
 * Optional path prefix: NEXT_PUBLIC_IMAGEKIT_PATH=/fitconnect
 */

function getImageKitBase(): string | undefined {
  return typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_IMAGEKIT_URL?.replace(/\/$/, "")
    : undefined;
}

function getImageKitPath(): string {
  return typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_IMAGEKIT_PATH ?? "").replace(/\/$/, "")
    : "";
}

export function isImageKitEnabled(): boolean {
  return Boolean(getImageKitBase());
}

export type ImageKitTransform = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  dpr?: number;
  blur?: number;
  focus?: "face" | "center" | "auto";
};

/** Build ImageKit transformation URL from a library path (e.g. /hero/athlete-01.jpg). */
export function imageKitUrl(src: string, transform: ImageKitTransform = {}): string {
  const base = getImageKitBase();
  if (!base) return src;

  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  const path = `${getImageKitPath()}${cleanSrc}`;

  const tr: string[] = [];
  if (transform.width) tr.push(`w-${transform.width}`);
  if (transform.height) tr.push(`h-${transform.height}`);
  if (transform.quality) tr.push(`q-${transform.quality}`);
  if (transform.format) tr.push(`f-${transform.format}`);
  if (transform.dpr) tr.push(`dpr-${transform.dpr}`);
  if (transform.blur) tr.push(`bl-${transform.blur}`);
  if (transform.focus) tr.push(`fo-${transform.focus}`);

  const trSegment = tr.length ? `tr:${tr.join(",")}/` : "";
  return `${base}/${trSegment}${path.replace(/^\//, "")}`;
}

/** Next.js Image loader — use when ImageKit is configured. */
export function imageKitLoader({
  src,
  width,
  quality
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!getImageKitBase() || src.startsWith("http")) return src;
  return imageKitUrl(src, {
    width,
    quality: quality ?? 80,
    format: "auto",
    dpr: typeof window !== "undefined" && window.devicePixelRatio > 1 ? 2 : 1
  });
}
