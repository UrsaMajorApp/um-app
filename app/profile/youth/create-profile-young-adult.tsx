import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { LAYOUT } from '$constants/theme';
import { formatPhone } from '$lib/formatPhone';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function CreateProfileYoungAdult() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    email: '',
    phone: '',
    education: '',
    profession: '',
    experience: '',
    goals: '',
  });

  const handleSubmit = () => {
    router.push('/profile/youth/testing');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#F0FDF4', '#F0F9FF']} style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          className="pt-12 pb-4 shadow-sm z-10 rounded-b-3xl"
        >
          <SafeAreaView
            edges={['top']}
            style={{
              width: '100%',
              maxWidth: isDesktop ? LAYOUT.profileFormMaxWidth : undefined,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: horizontalPadding,
            }}
          >
            <TouchableOpacity onPress={handleBack} className="p-2 mr-2">
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Профиль студента</Text>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: 16,
            paddingBottom: 60,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: '100%',
              maxWidth: isDesktop ? LAYOUT.profileFormMaxWidth : undefined,
            }}
          >
            {/* Personal Info */}
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-green-50">
              <View className="flex-row items-center mb-4">
                <Feather name="user" size={20} color="#16A34A" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Личная информация</Text>
              </View>

              <View className="space-y-4">
                <View className="flex-row justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Имя</Text>
                    <TextInput
                      value={formData.firstName}
                      onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                      placeholder="Имя"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Фамилия</Text>
                    <TextInput
                      value={formData.lastName}
                      onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                      placeholder="Фамилия"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                    />
                  </View>
                </View>

                <View className="flex-row justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Возраст</Text>
                    <TextInput
                      value={formData.age}
                      onChangeText={(text) => setFormData({ ...formData, age: text })}
                      placeholder="Напр. 19"
                      keyboardType="numeric"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-center"
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Пол</Text>
                    <View className="flex-row rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-[50px]">
                      <TouchableOpacity
                        onPress={() => setFormData({ ...formData, gender: 'male' })}
                        className={`flex-1 justify-center items-center ${formData.gender === 'male' ? 'bg-green-500' : ''}`}
                      >
                        <Text
                          className={
                            formData.gender === 'male' ? 'text-white font-medium' : 'text-gray-500'
                          }
                        >
                          М
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setFormData({ ...formData, gender: 'female' })}
                        className={`flex-1 justify-center items-center ${formData.gender === 'female' ? 'bg-green-500' : ''}`}
                      >
                        <Text
                          className={
                            formData.gender === 'female'
                              ? 'text-white font-medium'
                              : 'text-gray-500'
                          }
                        >
                          Ж
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Contacts Info */}
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-green-50">
              <View className="flex-row items-center mb-4">
                <Feather name="mail" size={20} color="#16A34A" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Контакты</Text>
              </View>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Телефон</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: formatPhone(text) })}
                    placeholder="+7 777 777 7777"
                    keyboardType="phone-pad"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                  />
                </View>
              </View>
            </View>

            {/* Education Info */}
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-green-50">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons name="school" size={20} color="#16A34A" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Образование</Text>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Учебное заведение / Специальность
                </Text>
                <TextInput
                  value={formData.education}
                  onChangeText={(text) => setFormData({ ...formData, education: text })}
                  placeholder="Университет, колледж, специальность"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                />
              </View>
            </View>

            {/* Professional Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-green-50">
              <View className="flex-row items-center mb-4">
                <Feather name="briefcase" size={20} color="#16A34A" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Профессиональная информация
                </Text>
              </View>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Профессиональные интересы
                  </Text>
                  <TextInput
                    value={formData.profession}
                    onChangeText={(text) => setFormData({ ...formData, profession: text })}
                    placeholder="Какая сфера деятельности вас интересует?"
                    multiline
                    numberOfLines={3}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 h-24"
                    textAlignVertical="top"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Опыт</Text>
                  <TextInput
                    value={formData.experience}
                    onChangeText={(text) => setFormData({ ...formData, experience: text })}
                    placeholder="Опишите ваш опыт работы или проектов"
                    multiline
                    numberOfLines={3}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 h-24"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            {/* Goals Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-green-50">
              <View className="flex-row items-center mb-4">
                <Feather name="target" size={20} color="#16A34A" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Цели</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Профессиональные и личные цели
              </Text>
              <TextInput
                value={formData.goals}
                onChangeText={(text) => setFormData({ ...formData, goals: text })}
                placeholder="Чего вы хотите достичь в ближайшее время?"
                multiline
                numberOfLines={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 h-24"
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="w-full rounded-xl overflow-hidden shadow-md mt-2"
            >
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                className="w-full py-4 items-center justify-center"
              >
                <Text className="text-white font-bold text-lg">Создать профиль</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
