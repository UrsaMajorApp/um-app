import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="callback" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
