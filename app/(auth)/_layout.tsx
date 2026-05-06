import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'intro',
};

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="qr-scan" />
    </Stack>
  );
}
