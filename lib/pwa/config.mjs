export const isPWADisabled = () =>
  process.env.NODE_ENV !== "production";

export const pwaInitOptions = {
  dest: "public",
  disable: isPWADisabled(),
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
};
