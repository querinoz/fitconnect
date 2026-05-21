import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { tokens } from "@/lib/tokens";
import { TAB_BAR_HEIGHT } from "@/lib/layout";

export function NivisTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];
  const activeLabel = descriptors[activeRoute.key]?.options.title ?? activeRoute.name;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Text style={styles.activeLabel} numberOfLines={1}>
        {activeLabel}
      </Text>
      <BlurView intensity={Platform.OS === "ios" ? 55 : 80} tint="dark" style={styles.bar}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label = options.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={label}
                onPress={onPress}
                style={[styles.tab, isFocused && styles.tabActive]}
              >
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused ? tokens.colors.ink[950] : tokens.colors.ink[400],
                  size: 18
                })}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: Platform.OS === "ios" ? 22 : 12
  },
  activeLabel: {
    textAlign: "center",
    marginBottom: 8,
    color: tokens.colors.brand[500],
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase"
  },
  bar: {
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(12,10,8,0.72)",
    height: TAB_BAR_HEIGHT - 28,
    justifyContent: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6
  },
  tab: {
    flex: 1,
    height: 40,
    marginHorizontal: 2,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  tabActive: {
    backgroundColor: tokens.colors.brand[500],
    shadowColor: tokens.colors.brand[500],
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  }
});
