import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { COLORS, SHADOWS } from '$constants/theme';

type QRScanResult = {
  id: string;
};

interface QRScannerProps {
  onClose: () => void;
  onSuccess?: (data: QRScanResult) => void;
  visible: boolean;
}

export function QRScanner({ onClose, onSuccess, visible }: QRScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleActivate = () => {
    if (!manualInput.trim()) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (onSuccess) onSuccess({ id: manualInput });
      setTimeout(() => {
        setSuccess(false);
        setManualInput('');
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={SHADOWS.lg}
          className="bg-white rounded-[32px] w-full max-w-md p-6 overflow-hidden"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Активация курса</Text>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Feather name="x" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {success ? (
            <View className="items-center py-10">
              <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4">
                <Feather name="check" size={40} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Активировано!</Text>
              <Text className="text-sm text-gray-500 text-center">
                Обучение по курсу успешно запущенно
              </Text>
            </View>
          ) : (
            <View>
              <View className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-3xl p-10 items-center justify-center mb-6">
                <Feather name="maximize" size={48} color={COLORS.primary} />
                <Text className="text-sm font-bold text-primary mt-4">СКАНЕР QR-КОДА</Text>
                <Text className="text-[10px] text-gray-400 mt-1 uppercase">
                  НАВЕДИТЕ КАМЕРУ НА КОД
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-2 ml-1">
                  ID УЧЕНИКА ВРУЧНУЮ
                </Text>
                <View className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 flex-row items-center">
                  <TextInput
                    value={manualInput}
                    onChangeText={setManualInput}
                    placeholder="Введите 8-значный ID"
                    className="flex-1 font-bold text-gray-800"
                  />
                </View>
              </View>

              <Pressable
                onPress={handleActivate}
                disabled={loading || !manualInput}
                className={`h-14 rounded-2xl items-center justify-center ${loading || !manualInput ? 'bg-gray-200' : 'bg-primary shadow-lg shadow-primary/20'}`}
              >
                <Text className="text-white font-bold">
                  {loading ? 'Активация...' : 'Активировать'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
