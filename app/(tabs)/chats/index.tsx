import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    COLORS,
    LAYOUT,
    RADIUS,
    SHADOWS,
    TYPOGRAPHY,
} from "../../../constants/theme";
import { useChats } from "../../../hooks/useChats";
import { useIsDesktop } from "../../../lib/useIsDesktop";

const DEFAULT_TABS = ["все", "непрочитанные", "архив"];

function formatChatTime(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Вчера";
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
}

export default function ChatsScreen() {
  const router = useRouter();
  const IS_DESKTOP = useIsDesktop();
  const horizontalPadding = IS_DESKTOP
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : 20;
  const TABS = DEFAULT_TABS;

  const [activeTab, setActiveTab] = useState("все");
  const [search, setSearch] = useState("");
  const { chats, loading } = useChats();

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const byTab =
        activeTab === "все"
          ? !chat.archived
          : activeTab === "непрочитанные"
            ? chat.unread_count > 0 && !chat.archived
            : chat.archived;
      const bySearch = chat.name.toLowerCase().includes(search.toLowerCase());
      return byTab && bySearch;
    });
  }, [activeTab, search, chats]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ backgroundColor: COLORS.primary, overflow: "hidden" }}>
        <LinearGradient
          colors={COLORS.gradients.header as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === "ios" ? 0 : 20 }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{
                paddingHorizontal: horizontalPadding,
                paddingTop: 12,
                paddingBottom: 32,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xxxl,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                  color: COLORS.white,
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                }}
              >
                Чаты
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  fontWeight: "500",
                  marginTop: 4,
                }}
              >
                Сообщения и обновления по вашим занятиям
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <View
        style={{
          width: IS_DESKTOP ? "50%" : "100%",
          alignSelf: "center",
          flex: 1,
          marginTop: 24,
        }}
      >
        {/* Search */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: RADIUS.xl,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            height: 52,
            marginHorizontal: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#F3F4F6",
            ...SHADOWS.sm,
          }}
        >
          <Feather name="search" size={20} color={COLORS.mutedForeground} />
          <TextInput
            placeholder="Поиск чатов"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={COLORS.mutedForeground}
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 16,
              color: COLORS.foreground,
            }}
          />
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: COLORS.muted,
            borderRadius: RADIUS.full,
            marginHorizontal: 20,
            padding: 6,
            marginBottom: 20,
          }}
        >
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  backgroundColor: active ? "white" : "transparent",
                  borderRadius: RADIUS.full,
                  paddingVertical: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  ...(active ? SHADOWS.sm : {}),
                }}
              >
                <Text
                  style={{
                    color: active ? COLORS.primary : COLORS.mutedForeground,
                    fontWeight: active ? "700" : "600",
                    fontSize: 13,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content List */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        >
          {loading ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                color: COLORS.mutedForeground,
              }}
            >
              Загрузка...
            </Text>
          ) : (
            filteredChats.map((chat, idx) => (
              <TouchableOpacity
                key={chat.id}
                activeOpacity={0.7}
                style={{ width: "100%" }}
                onPress={() =>
                  router.push({
                    pathname: "/chats/[id]",
                    params: { id: chat.id, name: chat.name },
                  })
                }
              >
                <MotiView
                  from={{ opacity: 0, translateY: 15 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: 300, delay: idx * 50 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    marginBottom: 12,
                    padding: 16,
                    backgroundColor: "white",
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
                    ...SHADOWS.sm,
                  }}
                >
                  {/* Avatar */}
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: `${COLORS.primary}12`,
                      marginRight: 14,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Feather
                      name={chat.icon_name as any}
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: COLORS.foreground,
                      }}
                    >
                      {chat.name}
                    </Text>
                    <Text
                      style={{
                        color: COLORS.mutedForeground,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                      numberOfLines={1}
                    >
                      {chat.last_message}
                    </Text>
                  </View>

                  {/* Time + Badge */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        color: COLORS.mutedForeground,
                        fontSize: 12,
                        marginBottom: 6,
                      }}
                    >
                      {formatChatTime(chat.last_message_at)}
                    </Text>
                    {chat.unread_count > 0 && !chat.archived && (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: COLORS.primary,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 11,
                            fontWeight: "800",
                          }}
                        >
                          {chat.unread_count}
                        </Text>
                      </View>
                    )}
                  </View>
                </MotiView>
              </TouchableOpacity>
            ))
          )}

          {!loading && filteredChats.length === 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                color: COLORS.mutedForeground,
              }}
            >
              Чатов нет
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
