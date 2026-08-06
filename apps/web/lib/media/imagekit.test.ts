import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { imageKitUrl, isImageKitEnabled } from "./imagekit";

describe("imageKit", () => {
  const orig = process.env.NEXT_PUBLIC_IMAGEKIT_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_IMAGEKIT_URL = "https://ik.imagekit.io/demo";
    process.env.NEXT_PUBLIC_IMAGEKIT_PATH = "/fitconnect";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_IMAGEKIT_URL = orig;
    delete process.env.NEXT_PUBLIC_IMAGEKIT_PATH;
  });

  it("is enabled when env is set", () => {
    expect(isImageKitEnabled()).toBe(true);
  });

  it("builds transformation URL", () => {
    const url = imageKitUrl("/hero/athlete.jpg", { width: 800, format: "auto", quality: 80 });
    expect(url).toContain("ik.imagekit.io/demo");
    expect(url).toContain("tr:w-800");
    expect(url).toContain("f-auto");
    expect(url).toContain("fitconnect/hero/athlete.jpg");
  });

  it("returns src unchanged when ImageKit disabled", () => {
    delete process.env.NEXT_PUBLIC_IMAGEKIT_URL;
    expect(imageKitUrl("/local.png")).toBe("/local.png");
  });
});
