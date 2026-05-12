// Экран профиля organization: показывает результат диагностики для роли организации.
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ScrollView, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { ORG_RESULT_BARS } from '$constants/profile';
import { LAYOUT } from '$constants/theme';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function OrgResults() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  return (
    <LinearGradient colors={['#009999', '#E6FFFF']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isDesktop ? 72 : 60,
          paddingBottom: 120,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isDesktop ? LAYOUT.profileFormMaxWidth : undefined,
          }}
        >
          {/* TITLE */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={{ marginBottom: 30 }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Результаты анкеты
            </Text>
          </MotiView>

          {/* ICON */}
          <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500 }}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
            }}
          >
            <Text style={{ fontSize: 64 }}>🏫</Text>
          </MotiView>

          {/* TYPE CARD */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              marginBottom: 26,
              elevation: 8,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: 10,
                color: '#007A7A',
              }}
            >
              Тип организации: Развивающий центр
            </Text>

            <Text
              style={{
                textAlign: 'center',
                fontSize: 15,
                color: '#444',
                lineHeight: 20,
              }}
            >
              Ваша организация ориентирована на развитие детей и подростков, обучение через
              практику, мини-группы и долгосрочные программы.
            </Text>
          </MotiView>

          {/* GRAPH */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 500 }}
            style={{
              backgroundColor: 'white',
              borderRadius: 22,
              paddingVertical: 24,
              marginBottom: 26,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'flex-end',
                height: 140,
              }}
            >
              {ORG_RESULT_BARS.map(({ id, height }) => (
                <View
                  key={id}
                  style={{
                    width: 18,
                    height,
                    backgroundColor: '#009999',
                    borderRadius: 8,
                  }}
                />
              ))}
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginTop: 12,
              }}
            >
              <Text style={{ fontSize: 13 }}>Обучение</Text>
              <Text style={{ fontSize: 13 }}>Маркетинг</Text>
              <Text style={{ fontSize: 13 }}>Методика</Text>
              <Text style={{ fontSize: 13 }}>Менеджм.</Text>
            </View>
          </MotiView>

          {/* STATS */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 450 }}
            style={{
              backgroundColor: 'white',
              borderRadius: 22,
              padding: 24,
              marginBottom: 36,
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              📌 Методическая база — <Text style={{ fontWeight: '700' }}>88%</Text>
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              📌 Заполняемость групп — <Text style={{ fontWeight: '700' }}>64%</Text>
            </Text>
            <Text style={{ fontSize: 16 }}>
              📌 Онлайн-присутствие — <Text style={{ fontWeight: '700' }}>42%</Text>
            </Text>
          </MotiView>

          {/* RECOMMENDATION */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: 20,
              borderRadius: 20,
              marginBottom: 40,
            }}
          >
            <Text style={{ fontSize: 15, lineHeight: 20 }}>
              Рекомендуем усилить онлайн-продвижение, подключить цифровые инструменты учета учеников
              и рассмотреть размещение программ внутри платформы UM.
            </Text>
          </View>

          {/* BUTTON */}
          <PressableScale
            onPress={() => router.push('/profile/common/subscribe')}
            style={{
              backgroundColor: '#007A7A',
              paddingVertical: 16,
              borderRadius: 30,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              Перейти в панель
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
