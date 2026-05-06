import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="parent/create-profile" />
            <Stack.Screen name="parent/umo-intro" />
            <Stack.Screen name="parent/testing" />
            <Stack.Screen name="parent/results" />
            <Stack.Screen name="youth/create-profile" />
            <Stack.Screen name="youth/create-profile-child" />
            <Stack.Screen name="youth/create-profile-young-adult" />
            <Stack.Screen name="youth/testing" />
            <Stack.Screen name="youth/results" />
            <Stack.Screen name="organization/create-profile" />
            <Stack.Screen name="organization/umo-intro" />
            <Stack.Screen name="organization/testing" />
            <Stack.Screen name="organization/results" />
            <Stack.Screen name="mentor/create-profile" />
            <Stack.Screen name="mentor/status" />
            <Stack.Screen name="common/done" />
            <Stack.Screen name="common/subscribe" />
            <Stack.Screen name="teacher/index" />
            <Stack.Screen name="admin/intro" />
        </Stack>
    );
}
