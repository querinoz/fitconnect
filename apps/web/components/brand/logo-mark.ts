/** Shared geometry for FitConnect Option 01 wing-F mark (viewBox 0 0 80 80). */

export const LOGO_VIEWBOX = "0 0 80 80";

/** Left spine — rounded bar */
export const SPINE =
  "M17 14h10c1.1 0 2 .9 2 2v48c0 1.1-.9 2-2 2H17c-1.1 0-2-.9-2-2V16c0-1.1.9-2 2-2z";

export const SPINE_SHADOW =
  "M18 15h8v50h-8c-.6 0-1-.4-1-1V16c0-.6.4-1 1-1z";

/** Aerodynamic wing ribbons — taper right, slight upward sweep */
export const WINGS = {
  top: {
    shadow: "M28 19c14-2.5 26-4.5 38-5.5l-2.5 9.5c-11 1-21 2.5-28 3.5l-7.5-7.5z",
    face: "M27 17.5c14-2.8 27-5 40-6.5l-2 10c-12 1.2-23 3-30 4.2l-8-7.7z",
    edge: "M27 17.5c14-2.8 27-5 40-6.5"
  },
  mid: {
    shadow: "M28 33c10-1.2 18-2.2 26-3l-2 8c-7.5.8-15 1.8-22 2.5l-2-7.5z",
    face: "M27 31.5c10-1.5 19-2.8 28-3.8l-1.5 8.5c-8.5 1-17 2.2-24.5 3l-2-7.7z",
    edge: "M27 31.5c10-1.5 19-2.8 28-3.8"
  },
  low: {
    shadow: "M28 45c6-.8 11-1.4 16-1.8l-1.5 6.5c-5 .5-10 1-14.5 1.4l-.5-6.1z",
    face: "M27 43.8c6.5-1 12-1.6 17.5-2.1l-1 7c-5.5.6-11 1.2-16.5 1.6l-.5-6.5z",
    edge: "M27 43.8c6.5-1 12-1.6 17.5-2.1"
  }
} as const;

export const PLATE = {
  x: 6,
  y: 6,
  size: 68,
  rx: 18
} as const;
