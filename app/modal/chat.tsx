import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS, SHADOWS } from '$constants/theme';
import { useChatMessages } from '$hooks/useChats';
import { isWebMinWidth } from '$lib/useIsDesktop';

export default function ChatModal() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { width } = useWindowDimensions();
  const IS_DESKTOP = isWebMinWidth(width, 900);

  const { messages, loading, sendMessage } = useChatMessages(id ?? null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await sendMessage(text);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{
            flex: 1,
            alignSelf: 'center',
            width: IS_DESKTOP ? '50%' : '100%',
            backgroundColor: 'white',
            ...SHADOWS.lg,
          }}
        >
          {/* Header */}
          <LinearGradient
            colors={COLORS.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingBottom: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            <View
              style={{
                paddingTop: Platform.OS === 'ios' ? 54 : 32,
                paddingHorizontal: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>{name}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {loading && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#9CA3AF',
                  marginVertical: 16,
                }}
              >
                Загрузка...
              </Text>
            )}
            {!loading && messages.length === 0 && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#9CA3AF',
                  marginVertical: 32,
                }}
              >
                Нет сообщений. Напишите первым!
              </Text>
            )}
            {messages.map((msg, idx) => (
              <MotiView
                key={msg.id ?? idx}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 250 }}
                style={{
                  alignSelf: msg.is_mine ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.is_mine ? COLORS.primary : '#F1F1F1',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  marginBottom: 10,
                  maxWidth: '80%',
                }}
              >
                <Text
                  style={{
                    color: msg.is_mine ? 'white' : 'black',
                    fontSize: 15,
                  }}
                >
                  {msg.body}
                </Text>
              </MotiView>
            ))}
          </ScrollView>

          {/* Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderTopWidth: 1,
              borderColor: '#eee',
              backgroundColor: 'white',
              paddingBottom: Platform.OS === 'ios' ? 32 : 12,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Введите сообщение..."
              style={{
                flex: 1,
                backgroundColor: '#F3F4F6',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 10,
                fontSize: 15,
                color: COLORS.foreground,
              }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSend}
              style={{
                backgroundColor: input.trim() ? COLORS.primary : '#E5E7EB',
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: input.trim() ? 'white' : '#9CA3AF',
                  fontWeight: '700',
                }}
              >
                Отпр.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
