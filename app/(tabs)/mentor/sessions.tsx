import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import {
  type MentorTrialRequest,
  useMentorTrialRequests,
} from "$hooks/useMentorTrialRequests";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";

export default function MentorSessionsScreen() {
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);
  const { user } = useAuth();
  const trialRequests = useMentorTrialRequests(user?.id);

  const renderRequest = ({
    item,
    index,
  }: {
    item: MentorTrialRequest;
    index: number;
  }) => {
    const selectedSlot = trialRequests.selectedSlots[item.id] || "";
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 80 }}
        style={styles.card}
      >
        {/* Header with child info */}
        <View style={styles.cardHeader}>
          <LinearGradient colors={["#10B981", "#34D399"]} style={styles.avatar}>
            <Text style={styles.avatarText}>{item.child_name.charAt(0)}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{item.child_name}</Text>
            {item.child_age && (
              <Text style={styles.childAge}>{item.child_age} лет</Text>
            )}
          </View>
          <View style={styles.newBadge}>
            <Feather name="clock" size={12} color="#10B981" />
            <Text style={styles.newBadgeText}>Новая заявка</Text>
          </View>
        </View>

        {/* Course & Parent info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather
              name="book-open"
              size={14}
              color={COLORS.mutedForeground}
            />
            <Text style={styles.infoText}>{item.course_title}</Text>
          </View>
          {item.parent_name && (
            <View style={styles.infoItem}>
              <Feather name="user" size={14} color={COLORS.mutedForeground} />
              <Text style={styles.infoText}>{item.parent_name}</Text>
            </View>
          )}
        </View>

        {/* Time slots selection */}
        <Text style={styles.slotsLabel}>Выберите удобное время:</Text>
        <View style={styles.slotsContainer}>
          {item.requested_slots.map((slot, idx) => {
            const slotKey = `${slot.day}-${slot.time}`;
            const isSelected = selectedSlot === slotKey;
            return (
              <Pressable
                key={idx}
                onPress={() => trialRequests.selectSlot(item.id, slotKey)}
                style={[styles.slotChip, isSelected && styles.slotChipSelected]}
              >
                <Text
                  style={[
                    styles.slotDay,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.day}
                </Text>
                <Text
                  style={[
                    styles.slotTime,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => trialRequests.declineRequest(item.id)}
          >
            <Feather name="x" size={18} color="#EF4444" />
            <Text style={styles.declineBtnText}>Отклонить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              !selectedSlot && styles.confirmBtnDisabled,
            ]}
            onPress={() => trialRequests.confirmRequest(item.id)}
            disabled={!selectedSlot}
          >
            <Feather name="check" size={18} color="white" />
            <Text style={styles.confirmBtnText}>Подтвердить</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    );
  };

  const renderArchived = ({
    item,
    index,
  }: {
    item: MentorTrialRequest;
    index: number;
  }) => {
    const outcomeConfig = {
      enrolled: { color: "#10B981", label: "Записался", icon: "user-check" },
      declined_by_parent: {
        color: "#F59E0B",
        label: "Отказался",
        icon: "user-x",
      },
      no_show: { color: "#EF4444", label: "Не пришёл", icon: "user-minus" },
    };
    const outcome = item.outcome
      ? outcomeConfig[item.outcome as keyof typeof outcomeConfig]
      : null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 80 }}
        style={[styles.card, { opacity: 0.85 }]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: "#E5E7EB" }]}>
            <Text style={[styles.avatarText, { color: "#9CA3AF" }]}>
              {item.child_name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{item.child_name}</Text>
            {item.confirmed_slot && (
              <Text style={styles.childAge}>
                {item.confirmed_slot.day} в {item.confirmed_slot.time}
              </Text>
            )}
          </View>
          {outcome && (
            <View
              style={[
                styles.outcomeBadge,
                { backgroundColor: outcome.color + "15" },
              ]}
            >
              <Feather
                name={outcome.icon as any}
                size={14}
                color={outcome.color}
              />
              <Text style={[styles.outcomeBadgeText, { color: outcome.color }]}>
                {outcome.label}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather
              name="book-open"
              size={14}
              color={COLORS.mutedForeground}
            />
            <Text style={styles.infoText}>{item.course_title}</Text>
          </View>
        </View>
      </MotiView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
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
                paddingHorizontal: paddingX,
                paddingTop: 12,
                paddingBottom: 20,
              }}
            >
              <Text style={[styles.mainTitle, { color: "white" }]}>
                Пробные уроки
              </Text>
              <Text
                style={[styles.subtitle, { color: "rgba(255,255,255,0.7)" }]}
              >
                Заявки от родителей
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
      <View
        style={{
          paddingHorizontal: paddingX,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            onPress={() => trialRequests.setActiveTab("requests")}
            style={[
              styles.tab,
              trialRequests.activeTab === "requests" && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                trialRequests.activeTab === "requests" && styles.tabTextActive,
              ]}
            >
              Заявки
            </Text>
            {trialRequests.requests.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {trialRequests.requests.length}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => trialRequests.setActiveTab("archive")}
            style={[
              styles.tab,
              trialRequests.activeTab === "archive" && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                trialRequests.activeTab === "archive" && styles.tabTextActive,
              ]}
            >
              Архив
            </Text>
          </Pressable>
        </View>
      </View>

      {trialRequests.loading ? (
        <View style={{ paddingVertical: 60, alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trialRequests.activeTab === "requests" ? (
        <FlatList
          data={trialRequests.requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingBottom: 100,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={64}
                color="#E5E7EB"
              />
              <Text style={styles.emptyTitle}>Нет новых заявок</Text>
              <Text style={styles.emptySubtitle}>
                Заявки на пробные уроки появятся здесь
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={trialRequests.archivedRequests}
          renderItem={renderArchived}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingBottom: 100,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="archive-outline"
                size={64}
                color="#E5E7EB"
              />
              <Text style={styles.emptyTitle}>Архив пуст</Text>
              <Text style={styles.emptySubtitle}>
                Завершённые пробные уроки появятся здесь
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.foreground,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 4,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#6C5CE7",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.mutedForeground,
  },
  tabTextActive: {
    color: "white",
  },
  tabBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  childName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  childAge: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
  },
  outcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  outcomeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  infoRow: {
    gap: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontWeight: "500",
  },
  slotsLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 10,
  },
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    alignItems: "center",
    minWidth: 70,
  },
  slotChipSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  slotDay: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  slotTime: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  slotTextSelected: {
    color: "#065F46",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    gap: 6,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  confirmBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#10B981",
    gap: 6,
  },
  confirmBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 6,
    textAlign: "center",
  },
});
