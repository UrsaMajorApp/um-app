import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '$constants/theme';
import { useOrgApplications } from '$hooks/useOrgData';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function OrgAttendance() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const { apps, loading } = useOrgApplications();
  // Build club list dynamically from applications
  const clubs = Array.from(new Set(apps.map((a) => a.club).filter(Boolean))).map((c) => ({
    id: c as string,
    name: c as string,
  }));
  const [selectedClub, setSelectedClub] = useState<string>('');

  // Students for selected club (activated/paid applications)
  const activeStudents = apps
    .filter(
      (a) =>
        (a.status === 'activated' || a.status === 'paid') &&
        (selectedClub === '' || a.club === selectedClub),
    )
    .map((a) => ({
      id: a.id,
      name: a.child_name,
      club: a.club,
    }));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
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
              <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>Посещаемость</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  onPress={() => setSelectedClub(club.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 16,
                    marginRight: 8,
                    backgroundColor: selectedClub === club.id ? 'white' : 'rgba(255,255,255,0.15)',
                    borderWidth: 1,
                    borderColor: selectedClub === club.id ? 'white' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Text
                    style={{
                      color: selectedClub === club.id ? COLORS.primary : 'white',
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    {club.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Summary */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View
            style={SHADOWS.sm}
            className="flex-1 bg-white p-5 rounded-3xl border border-gray-100"
          >
            <Text className="text-2xl font-black text-green-600">{activeStudents.length}</Text>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              Активных учеников
            </Text>
          </View>
          <View
            style={SHADOWS.sm}
            className="flex-1 bg-white p-5 rounded-3xl border border-gray-100"
          >
            <Text className="text-2xl font-black text-primary">{clubs.length}</Text>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              Направлений
            </Text>
          </View>
        </View>

        {/* Attendance Card */}
        <View
          style={SHADOWS.md}
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
        >
          <View className="flex-row bg-gray-50/50 border-bottom border-gray-100 p-2">
            <View className="flex-1 justify-center px-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase">Ученик</Text>
            </View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase">Курс</Text>
          </View>

          {loading && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.mutedForeground }}>Загрузка...</Text>
            </View>
          )}
          {!loading && activeStudents.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Feather name="clipboard" size={28} color="#D1D5DB" />
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  marginTop: 10,
                  textAlign: 'center',
                }}
              >
                Активных учеников пока нет. Данные посещаемости появятся после отметок учителя.
              </Text>
            </View>
          )}
          <View>
            {activeStudents.map((student, sIdx) => (
              <View
                key={student.id}
                className={`flex-row p-3 items-center ${
                  sIdx !== activeStudents.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className="flex-1 flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Text
                      style={{
                        fontWeight: '700',
                        color: COLORS.primary,
                        fontSize: 12,
                      }}
                    >
                      {student.name.charAt(0)}
                    </Text>
                  </View>
                  <Text numberOfLines={1} className="text-xs font-bold text-gray-800 flex-1">
                    {student.name}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-gray-500">{student.club || '—'}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
