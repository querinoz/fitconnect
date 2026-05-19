export const isPWADisabled = () =>
  process.env.NODE_ENV !== "production";

export const pwaInitOptions = {
  dest: "public",
  disable: isPWADisabled(),
  register: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /\/_next\/static.+\.js$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "next-static-js-network-first",
          networkTimeoutSeconds: 4,
          expiration: {
            maxEntries: 48,
            maxAgeSeconds: 86400
          }
        }
      }
    ]
  },
  // Não deixa o next-pwa tocar no manifest estático
  manifestFilename: "manifest.webmanifest",
  skipWaiting: true,
};