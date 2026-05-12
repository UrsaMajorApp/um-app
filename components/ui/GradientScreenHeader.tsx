// GradientScreenHeader: декоративный заголовок экрана с градиентом и крупным title.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';

export function GradientScreenHeader({
  title,
  paddingX,
  onBack,
}: {
  title: string;
  paddingX: number;
  onBack: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: RADIUS.xxl,
        borderBottomRightRadius: RADIUS.xxl,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={COLORS.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingBottom: SPACING.xl }}
      >
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={onBack}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: RADIUS.md,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Feather name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xl,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                  color: 'white',
                }}
              >
                {title}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
