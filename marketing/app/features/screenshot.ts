import type { FeatureScreenshot } from "./types";

const SCREENSHOT_WIDTH = 1600;
const SCREENSHOT_HEIGHT = 1000;

export function featureScreenshot(
  file: string,
  alt: string,
  caption: string,
): FeatureScreenshot {
  return {
    src: `/features/${file}.png`,
    alt,
    width: SCREENSHOT_WIDTH,
    height: SCREENSHOT_HEIGHT,
    caption,
  };
}
