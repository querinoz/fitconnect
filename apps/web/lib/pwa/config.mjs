export const isPWADisabled = () => process.env.NODE_ENV !== "production";

/** Serwist options — successor to next-pwa, peers Next 15. */
export const pwaInitOptions = {
  dest: "public",
  disable: isPWADisabled(),
  register: true,
  swSrc: "app/sw.ts",
  swDest: "public/sw.js"
};
