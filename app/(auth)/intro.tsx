import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { PressableScale } from "$components/ui/PressableScale";
import { COLORS, RADIUS, SHADOWS } from "$constants/theme";

export default function IntroScreen() {
  const router = useRouter();
  const { height } = Dimensions.get("window");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#4F46E5", "#7C3AED", "#C026D3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Blobs */}
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1.2 }}
        transition={{
          loop: true,
          type: "timing",
          duration: 3000,
          repeatReverse: true,
        }}
        style={[
          styles.blob,
          { top: -50, right: -50, backgroundColor: "#818CF8" },
        ]}
      />
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1.5 }}
        transition={{
          loop: true,
          type: "timing",
          duration: 4000,
          delay: 500,
          repeatReverse: true,
        }}
        style={[
          styles.blob,
          { bottom: "25%", left: -100, backgroundColor: "#F472B6" },
        ]}
      />

      {/* Floating Icons */}
      <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
        <FloatingIcon
          name="rocket"
          color="white"
          size={24}
          top={100}
          left={50}
          delay={0}
        />
        <FloatingIcon
          name="brain"
          color="white"
          size={32}
          top={height * 0.4}
          right={40}
          delay={400}
        />
        <FloatingIcon
          name="star"
          color="white"
          size={20}
          bottom={200}
          left={80}
          delay={800}
        />
        <FloatingIcon
          name="lightbulb"
          color="white"
          size={24}
          top={200}
          right={60}
          delay={1200}
        />
      </View>

      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {/* Logo Section */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.3, rotateZ: "-15deg" }}
            animate={{ opacity: 1, scale: 1, rotateZ: "0deg" }}
            transition={{ type: "spring", damping: 12 }}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>UM</Text>
              <View style={styles.logoRing} />
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: "spring" }}
            style={{
              alignItems: "center",
              marginTop: 32,
              paddingHorizontal: 40,
            }}
          >
            <Text style={styles.title}>Ursa Major</Text>
            <Text style={styles.subtitle}>
              Раскрой сверхспособности{"\n"}своего ребёнка
            </Text>
          </MotiView>
        </View>

        {/* Buttons Section */}
        <View style={styles.footer}>
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500, type: "spring" }}
            style={{ width: "100%", maxWidth: 400 }}
          >
            <PressableScale
              onPress={() => router.push("/register")}
              style={styles.primaryBtn}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F3F4F6"]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.primaryBtnText}>Начать путь</Text>
            </PressableScale>

            <PressableScale
              onPress={() => router.push("/login")}
              style={styles.secondaryBtn}
              scaleTo={0.97}
            >
              <Text style={styles.secondaryBtnText}>
                У меня уже есть аккаунт
              </Text>
            </PressableScale>
          </MotiView>
        </View>
      </View>
    </View>
  );
}

function FloatingIcon({
  name,
  color,
  size,
  top,
  left,
  right,
  bottom,
  delay,
}: any) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 0 }}
      animate={{ opacity: 0.5, translateY: -20 }}
      transition={{
        loop: true,
        type: "timing",
        duration: 2000 + delay,
        repeatReverse: true,
        delay,
      }}
      style={{ position: "absolute", top, left, right, bottom, opacity: 0.5 }}
    >
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    ...SHADOWS.lg,
  },
  logoRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    transform: [{ rotate: "45deg" }],
  },
  logoText: {
    fontSize: 64,
    fontWeight: "900",
    color: "white",
    letterSpacing: -2,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 64,
    alignItems: "center",
  },
  primaryBtn: {
    width: "100%",
    height: 64,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...SHADOWS.md,
  },
  primaryBtnText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 18,
  },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 15,
  },
  version: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    marginTop: 24,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
