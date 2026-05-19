import { Platform } from "react-native";

/** Tab bar height + safe-area — keep scroll content above the dock */
export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 84 : 68;
export const SCROLL_BOTTOM_INSET = TAB_BAR_HEIGHT + 16;
