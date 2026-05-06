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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '$constants/theme';
import { useChatMessages } from '$hooks/useChats';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function ChatScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const IS_DESKTOP = useIsDesktop();

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

  const handleBackToChats = () => {
    router.replace('/chats');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{ backgroundColor: COLORS.primary, overflow: 'hidden' }}>
          <LinearGradient
            colors={COLORS.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: Platform.OS === 'ios' ? 0 : 20 }}
          >
            <SafeAreaView edges={['top']}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: IS_DESKTOP ? LAYOUT.dashboardHorizontalPaddingDesktop : 20,
                  paddingTop: 12,
                  paddingBottom: 20,
                }}
              >
                <TouchableOpacity
                  onPress={handleBackToChats}
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
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{name}</Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

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
                backgroundColor: msg.is_mine ? '#6C5CE7' : '#F1F1F1',
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 18,
                marginBottom: 10,
                maxWidth: '80%',
              }}
            >
              <Text style={{ color: msg.is_mine ? 'white' : 'black', fontSize: 15 }}>
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
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Введите сообщение..."
            style={{
              flex: 1,
              backgroundColor: '#F1F1F1',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginRight: 10,
            }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              backgroundColor: input.trim() ? '#6C5CE7' : '#E5E7EB',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: input.trim() ? 'white' : '#9CA3AF',
                fontWeight: '600',
              }}
            >
              Отпр.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
