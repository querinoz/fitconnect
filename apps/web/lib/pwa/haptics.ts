function buzz(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}

export const tap = (): void => buzz(40);

export const success = (): void => buzz([20, 30, 60]);

export const warn = (): void => buzz([60, 40, 60]);
