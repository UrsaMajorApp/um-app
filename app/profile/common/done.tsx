import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";

export default function DoneScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const role = user?.role ?? null;

    const handleStart = () => {
        if (role === "youth" || role === "child") {
            router.replace("/profile/youth/testing" as any);
            return;
        }
        router.replace("/(tabs)/home");
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Background blobs for color */}
            <View style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
                <View style={{ 
                    position: 'absolute', 
                    top: -50, 
                    right: -50, 
                    width: 300, 
                    height: 300, 
                    borderRadius: 150, 
                    backgroundColor: `${COLORS.primary}15`,
                }} />
                <View style={{ 
                    position: 'absolute', 
                    bottom: '10%', 
                    left: -100, 
                    width: 400, 
                    height: 400, 
                    borderRadius: 200, 
                    backgroundColor: `${COLORS.secondary}10`,
                }} />
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView 
                    contentContainerStyle={{ 
                        flexGrow: 1, 
                        justifyContent: 'center', 
                        padding: 24,
                        paddingBottom: 40
                    }}
                >
                    <View style={{ alignItems: 'center', width: '100%', maxWidth: 500, alignSelf: 'center' }}>
                        {/* Success Card */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            style={{
                                width: '100%',
                                backgroundColor: 'white',
                                borderRadius: 40,
                                padding: 32,
                                alignItems: 'center',
                                ...SHADOWS.lg,
                            }}
                        >
                            {/* Animated Success Icon */}
                            <MotiView
                                from={{ scale: 0.5, rotate: '-45deg' }}
                                animate={{ scale: 1, rotate: '0deg' }}
                                transition={{ type: 'spring', delay: 200 }}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.secondary]}
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 45,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 32,
                                        transform: [{ rotate: '15deg' }]
                                    }}
                                >
                                    <View style={{ transform: [{ rotate: '-15deg' }] }}>
                                        <Feather name="check" size={60} color="white" />
                                    </View>
                                </LinearGradient>
                            </MotiView>

                            {/* Text Content */}
                            <Text style={{ 
                                fontSize: 32, 
                                fontWeight: '900', 
                                color: COLORS.foreground, 
                                marginBottom: 12, 
                                textAlign: 'center',
                                letterSpacing: -0.5
                            }}>
                                Ура! Вы в деле
                            </Text>
                            
                            <Text style={{ 
                                fontSize: 16, 
                                color: COLORS.mutedForeground, 
                                textAlign: 'center', 
                                lineHeight: 24,
                                marginBottom: 40,
                                paddingHorizontal: 10
                            }}>
                                Ваш профиль успешно создан.{'\n'}Теперь вам доступны все возможности платформы.
                            </Text>

                            {/* Action Button */}
                            <TouchableOpacity
                                onPress={handleStart}
                                activeOpacity={0.8}
                                style={{ width: '100%' }}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        paddingVertical: 20,
                                        borderRadius: 24,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...SHADOWS.md,
                                    }}
                                >
                                    <Text style={{ 
                                        color: 'white', 
                                        fontSize: 18, 
                                        fontWeight: '800', 
                                        textTransform: 'uppercase',
                                        letterSpacing: 1
                                    }}>
                                        Начать работу
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </MotiView>

                        {/* Subtle feedback text */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 600 }}
                            style={{ marginTop: 24 }}
                        >
                            <Text style={{ color: COLORS.mutedForeground, fontSize: 13, fontWeight: '500' }}>
                                Настройка базовых параметров завершена
                            </Text>
                        </MotiView>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
