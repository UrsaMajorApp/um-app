import { Feather } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  avatar?: string;
  dark?: boolean;
  onNotificationClick?: () => void;
  backPath?: Href;
}

export function Header({
  title,
  showBack = false,
  showNotifications = false,
  avatar,
  dark = false,
  onNotificationClick,
  backPath,
}: HeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`flex-row items-center justify-between px-6 py-4 ${dark ? 'bg-white shadow-sm' : 'bg-transparent'}`}
    >
      <View className="flex-row items-center gap-3 space-x-3">
        {showBack && (
          <Pressable
            onPress={handleBackClick}
            className={`w-10 h-10 items-center justify-center rounded-full ${dark ? 'bg-gray-100' : 'bg-white/20'}`}
          >
            <Feather name="arrow-left" size={24} color={dark ? '#111827' : '#FFFFFF'} />
          </Pressable>
        )}
        {title && (
          <Text className={`font-black text-2xl ml-2 ${dark ? 'text-gray-900' : 'text-white'}`}>
            {title}
          </Text>
        )}
      </View>

      <View className="flex-row items-center space-x-3">
        {showNotifications && (
          <Pressable
            onPress={onNotificationClick}
            className={`w-10 h-10 items-center justify-center rounded-full relative ${dark ? 'bg-gray-100' : 'bg-white/20'}`}
          >
            <Feather name="bell" size={20} color={dark ? '#111827' : '#FFFFFF'} />
            <View
              className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 ${dark ? 'bg-[#6C5CE7] border-white' : 'bg-white border-[#6C5CE7]'}`}
            />
          </Pressable>
        )}
        {avatar && (
          <View
            className={`w-10 h-10 rounded-full overflow-hidden ml-3 ring-2 ${dark ? 'bg-gray-200 ring-gray-300' : 'bg-white/20 ring-white/40'}`}
          >
            <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} />
          </View>
        )}
      </View>
    </View>
  );
}
