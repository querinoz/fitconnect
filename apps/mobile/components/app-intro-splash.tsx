import { tokens } from "@/lib/tokens";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View
} from "react-native";

const LOGO = require("../assets/brand/logo.png");
const INTRO_MS = 3200;

/** Cinematic cold-start intro — once per app launch. */
export function AppIntroSplash() {
  const [visible, setVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const ekg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) {
        setVisible(false);
        return;
      }

      Animated.sequence([
        Animated.timing(ekg, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();

      timer = setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true
        }).start(() => {
          if (!cancelled) setVisible(false);
        });
      }, INTRO_MS);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ekg, overlayOpacity, scale]);

  if (!visible) return null;

  const ekgWidth = ekg.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="none">
      <View style={styles.ekgTrack}>
        <Animated.View style={[styles.ekgFill, { width: ekgWidth }]} />
      </View>
      <Animated.Image
        source={LOGO}
        style={[styles.logo, { transform: [{ scale }] }]}
        accessibilityLabel="FitConnect"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000"
  },
  ekgTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 2,
    marginTop: -1,
    backgroundColor: "rgba(191,238,22,0.15)"
  },
  ekgFill: {
    height: 2,
    backgroundColor: tokens.colors.brand[400]
  },
  logo: {
    width: 128,
    height: 128,
    resizeMode: "contain"
  }
});
