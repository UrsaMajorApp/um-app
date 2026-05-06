import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LAYOUT } from "../../../constants/theme";
import { useIsDesktop } from "../../../lib/useIsDesktop";

const HANDLE_SIZE = 60;

export default function UmoIntro() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;
  const sliderWidth = isDesktop
    ? 420
    : Math.max(280, width - horizontalPadding * 2);
  const slideDistance = sliderWidth - HANDLE_SIZE - 4;

  const sliderX = useRef(new Animated.Value(0)).current;
  const fillWidth = sliderX.interpolate({
    inputRange: [0, slideDistance],
    outputRange: [HANDLE_SIZE, sliderWidth],
    extrapolate: "clamp",
  });

  const [completed, setCompleted] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, g) => {
        if (g.dx >= 0 && g.dx <= slideDistance) {
          sliderX.setValue(g.dx);
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx > slideDistance * 0.7) {
          Animated.timing(sliderX, {
            toValue: slideDistance,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setCompleted(true);
            setTimeout(() => {
              router.push("/profile/organization/testing");
            }, 300);
          });
        } else {
          Animated.spring(sliderX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <LinearGradient
      colors={["#6C5CE7", "#FFFFFF", "#8B7FE8"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: 70,
          width: "100%",
          maxWidth: isDesktop ? LAYOUT.profileFormMaxWidth : undefined,
          alignSelf: "center",
          paddingHorizontal: horizontalPadding,
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 500 }}
        >
          <Image
            source={require("../../../assets/logo/umo.png")}
            style={{ width: 340, height: 150, resizeMode: "contain" }}
          />
        </MotiView>

        {/* ROBOT */}
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <MotiView
            from={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 600, delay: 250 }}
          >
            <Image
              source={require("../../../assets/images/robot.png")}
              style={{
                width: isDesktop ? 300 : 340,
                height: isDesktop ? 300 : 340,
                resizeMode: "contain",
              }}
            />
          </MotiView>

          {/* SPEECH */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 600, delay: 400 }}
            style={{
              backgroundColor: "rgba(63,60,159,0.15)",
              paddingVertical: 12,
              paddingHorizontal: 22,
              borderRadius: 26,
              marginTop: -18,
            }}
          >
            <Text
              style={{
                color: "#6C5CE7",
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Давай начнём наше{"\n"}тестирование
            </Text>
          </MotiView>
        </View>

        {/* SLIDER */}
        <View
          style={{
            marginTop: 44,
            width: sliderWidth,
            height: 64,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: "#6C5CE7",
            backgroundColor: "#E6E9FF",
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          {/* BLUE FILL */}
          <Animated.View
            style={{
              position: "absolute",
              height: "100%",
              width: fillWidth,
              backgroundColor: "#6C5CE7",
            }}
          />

          {/* TEXT */}
          <Text
            style={{
              position: "absolute",
              alignSelf: "center",
              color: completed ? "white" : "#6C5CE7",
              fontWeight: "700",
              fontSize: 18,
            }}
          >
            {completed ? "начато" : "начать"}
          </Text>

          {/* HANDLE */}
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: HANDLE_SIZE / 2,
              backgroundColor: completed ? "#6C5CE7" : "#6C5CE7",
              justifyContent: "center",
              alignItems: "center",
              transform: [{ translateX: sliderX }],
            }}
          >
            <Text style={{ color: "white", fontSize: 26 }}>➜</Text>
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}
