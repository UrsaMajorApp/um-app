import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOWS } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import { useParentData } from "$contexts/ParentDataContext";
import { useParentProfileController } from "$hooks/useParentProfileController";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";

export default function ParentProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop);

  const {
    parentProfile,
    childrenProfile: children,
    updateParentProfile,
    updateChild,
    setParentTariff,
    isLoading,
  } = useParentData();
  const profileController = useParentProfileController({
    user,
    parentProfile,
    children,
    updateParentProfile,
    updateChild,
  });

  const handleToggleTariff = () => {
    if (parentProfile?.tariff === "pro") {
      Alert.alert(
        "Деактивация PRO",
        "Вы действительно хотите отключить PRO функции? Доступ сохранится до конца оплаченного периода.",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Отключить",
            style: "destructive",
            onPress: () => setParentTariff("basic"),
          },
        ],
      );
    } else {
      router.push("/parent/subscription" as any);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      await logout();
    } else {
      Alert.alert("Выход", "Вы действительно хотите выйти?", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F7FF",
        }}
      >
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text
          style={{ color: COLORS.mutedForeground, marginTop: 16, fontSize: 14 }}
        >
          Загрузка профиля...
        </Text>
      </View>
    );
  }

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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "white",
                    flex: 1,
                  }}
                >
                  Профиль
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: horizontalPadding }}>
          {/* Parent Info Card */}
          <View style={styles.parentCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.avatarPlaceholder}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.parentName}>
                  {parentProfile?.firstName} {parentProfile?.lastName || ""}
                </Text>
                <Text style={styles.parentPhone}>
                  {parentProfile?.phone || user?.phone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => profileController.setShowEditModal(true)}
                style={styles.editBtnSmall}
              >
                <Feather
                  name="settings"
                  size={16}
                  color={COLORS.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={styles.statLabel}>Тарифный план</Text>
                <Text style={styles.statValue}>
                  {parentProfile?.tariff === "pro" ? "Family PRO" : "Базовый"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleTariff}
                style={[
                  styles.tariffBtn,
                  parentProfile?.tariff === "pro" && styles.tariffBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.tariffBtnText,
                    parentProfile?.tariff === "pro" &&
                      styles.tariffBtnTextActive,
                  ]}
                >
                  {parentProfile?.tariff === "pro"
                    ? "Управление"
                    : "Активировать PRO"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Children Selector */}
          <View style={{ marginTop: 32 }}>
            <Text style={styles.sectionTitle}>Мои дети</Text>
            {children.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                }}
              >
                {children.map((child) => {
                  const isSelected =
                    profileController.selectedChildId === child.id;
                  return (
                    <TouchableOpacity
                      key={child.id}
                      onPress={() =>
                        profileController.setSelectedChildId(child.id)
                      }
                      activeOpacity={0.8}
                      style={[
                        styles.childSelector,
                        isSelected && styles.childSelectorActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.childAvatar,
                          isSelected && styles.childAvatarActive,
                        ]}
                      >
                        <Text style={{ fontSize: 28 }}>
                          {child.ageCategory === "child" ? "👦" : "🧑"}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.childName,
                          isSelected && styles.childNameActive,
                        ]}
                      >
                        {child.name}
                      </Text>
                      <Text
                        style={[
                          styles.childAge,
                          isSelected && styles.childAgeActive,
                        ]}
                      >
                        {child.age} лет
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() =>
                    router.push("/profile/youth/create-profile-child" as any)
                  }
                  style={styles.addChildSelector}
                >
                  <Feather
                    name="plus"
                    size={24}
                    color={COLORS.mutedForeground}
                  />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  router.push("/profile/youth/create-profile-child" as any)
                }
                style={styles.createChildPrompt}
              >
                <View style={styles.createChildIcon}>
                  <Feather name="user-plus" size={22} color="#6C5CE7" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.createChildTitle}>
                    Добавьте профиль ребёнка
                  </Text>
                  <Text style={styles.createChildSubtitle}>
                    После создания здесь появятся QR-код, отчёты и записи
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* QR Section - Only show if child profile exists */}
          {profileController.selectedChild &&
            profileController.selectedChild.name && (
            <View style={styles.qrRow}>
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <View style={styles.smallAvatar}>
                  <Text style={{ fontSize: 20 }}>
                    {profileController.selectedChild?.ageCategory === "child"
                      ? "👦"
                      : "🧑"}
                  </Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.qrTitle}>
                    {profileController.selectedChild?.name}
                  </Text>
                  <Text style={styles.qrSubtitle}>QR-код для отметки</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => profileController.setShowQRModal(true)}
                style={styles.qrBtn}
              >
                <Feather name="maximize" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Assessment & Reports Section */}
          {profileController.selectedChild && (
            <View style={{ marginTop: 32 }}>
              <Text style={styles.sectionTitle}>
                Отчеты и аналитика ({profileController.selectedChild?.name})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/(tabs)/parent/child/${profileController.selectedChild?.id}` as any,
                  )
                }
                style={styles.reportCard}
              >
                <View style={styles.reportIcon}>
                  <Feather name="bar-chart-2" size={22} color="#6C5CE7" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.reportTitle}>Результаты диагностики</Text>
                  <Text style={styles.reportSubtitle}>
                    Карта талантов и мягких навыков
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={COLORS.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Clubs List */}
          <View style={{ marginTop: 32 }}>
            <Text style={styles.sectionTitle}>Кружки и секции</Text>
            {profileController.loadingEnrollments ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : profileController.enrollments.length > 0 ? (
              profileController.enrollments.map((enr) => (
                <View key={enr.id} style={styles.clubCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clubName}>
                      {enr.org_name || "Клуб"}
                    </Text>
                    <Text style={styles.groupName}>
                      {enr.course_title || "Курс"}
                    </Text>
                    <View style={styles.scheduleRow}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Feather
                          name="calendar"
                          size={12}
                          color={COLORS.mutedForeground}
                        />
                        <Text style={[styles.scheduleText, { marginLeft: 4 }]}>
                          {enr.status === "approved"
                            ? "Одобрено"
                            : enr.status === "rejected"
                              ? "Отклонено"
                              : "Ожидает подтверждения"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.clubArrow}>
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={{ color: COLORS.mutedForeground }}>
                  Пока нет активных записей
                </Text>
              </View>
            )}
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={profileController.showEditModal}
        transparent
        animationType={isDesktop ? "fade" : "slide"}
        onRequestClose={() => profileController.setShowEditModal(false)}
      >
        <Pressable
          style={[
            styles.editModalOverlay,
            !isDesktop && styles.editModalOverlayMobile,
          ]}
          onPress={() => profileController.setShowEditModal(false)}
        >
          <Pressable
            style={[
              styles.editModalContent,
              isDesktop && styles.editModalContentDesktop,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактировать профиль</Text>
              <TouchableOpacity
                onPress={() => profileController.setShowEditModal(false)}
              >
                <Feather name="x" size={24} color={COLORS.foreground} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 20, marginTop: 32 }}>
              <View>
                <Text style={styles.inputLabel}>ИМЯ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileController.editForm.firstName}
                  onChangeText={(v) =>
                    profileController.updateEditFormField("firstName", v)
                  }
                  placeholder="Напр. Иван"
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>ФАМИЛИЯ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileController.editForm.lastName}
                  onChangeText={(v) =>
                    profileController.updateEditFormField("lastName", v)
                  }
                  placeholder="Напр. Иванов"
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>НОМЕР ТЕЛЕФОНА</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileController.editForm.phone}
                  onChangeText={(v) =>
                    profileController.updateEditFormField("phone", v)
                  }
                  keyboardType="phone-pad"
                  placeholder="+7 777 777 7777"
                  placeholderTextColor={COLORS.mutedForeground}
                />
              </View>

              <TouchableOpacity
                onPress={profileController.handleUpdateProfile}
                style={styles.saveProfileBtn}
              >
                <Text
                  style={{ color: "white", fontWeight: "800", fontSize: 16 }}
                >
                  СОХРАНИТЬ
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* QR Modal */}
      <Modal
        visible={profileController.showQRModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.qrModalContent,
              isDesktop && { maxWidth: 400, alignSelf: "center" },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Код для входа</Text>
              <TouchableOpacity
                onPress={() => profileController.setShowQRModal(false)}
              >
                <Feather name="x" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center", width: "100%" }}>
              <Text style={styles.qrModalChildName}>
                {profileController.selectedChild?.name}
              </Text>

              {profileController.selectedChild?.qrPin ? (
                <>
                  <View style={styles.qrOuterWrapper}>
                    <QRCode
                      value={profileController.selectedChild.qrPin}
                      size={isDesktop ? 160 : 200}
                      color="#1A1A1A"
                    />
                  </View>

                  <View style={styles.pinDisplay}>
                    <Text style={styles.pinLabel}>Или введите код:</Text>
                    <Text style={styles.pinNumber}>
                      {profileController.selectedChild.qrPin}
                    </Text>
                  </View>

                  <Text style={styles.qrModalHint}>
                    Покажите этот код ребёнку для входа в приложение
                  </Text>

                  <TouchableOpacity
                    onPress={profileController.handleGeneratePin}
                    style={styles.regenerateBtn}
                  >
                    <Feather name="refresh-cw" size={16} color="#6C5CE7" />
                    <Text style={styles.regenerateBtnText}>Обновить код</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.noPinContainer}>
                    <Feather
                      name="lock"
                      size={40}
                      color={COLORS.mutedForeground}
                    />
                    <Text style={styles.noPinText}>Код не создан</Text>
                    <Text style={styles.noPinHint}>
                      Создайте 6-значный код для входа ребёнка
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={profileController.handleGeneratePin}
                    style={styles.generatePinBtn}
                  >
                    <Feather name="grid" size={18} color="white" />
                    <Text style={styles.generatePinBtnText}>Создать код</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "white",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  parentCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F9FAFB",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  parentName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  parentEmail: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  parentPhone: {
    fontSize: 13,
    color: COLORS.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.mutedForeground,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  statusBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  childSelector: {
    width: 100,
    padding: 12,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  childSelectorActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
    ...SHADOWS.md,
  },
  childAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  childAvatarActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  childName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  childNameActive: {
    color: "white",
  },
  childAge: {
    fontSize: 11,
    color: COLORS.mutedForeground,
  },
  childAgeActive: {
    color: "rgba(255,255,255,0.8)",
  },
  qrRow: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F9FAFB",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  qrSubtitle: {
    fontSize: 11,
    color: COLORS.mutedForeground,
  },
  qrBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: RADIUS.xl,
    padding: 16,
    ...SHADOWS.sm,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.foreground,
    marginLeft: 8,
  },
  clubCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F9FAFB",
  },
  clubName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  groupName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  scheduleText: {
    fontSize: 12,
    color: COLORS.mutedForeground,
  },
  clubArrow: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderStyle: "dashed",
  },
  logoutBtn: {
    marginTop: 40,
    backgroundColor: "#FEF2F2",
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
  },
  editBtnSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  tariffBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    ...SHADOWS.sm,
  },
  tariffBtnActive: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tariffBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tariffBtnTextActive: {
    color: COLORS.primary,
  },
  addChildSelector: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F9FAFB",
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  reportSubtitle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.foreground,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.mutedForeground,
    marginBottom: 8,
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.foreground,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  saveProfileBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    ...SHADOWS.md,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  editModalOverlayMobile: {
    justifyContent: "flex-end",
    alignItems: "stretch",
    padding: 0,
  },
  editModalContent: {
    width: "100%",
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  editModalContentDesktop: {
    maxWidth: 460,
    borderRadius: RADIUS.xl,
    ...SHADOWS.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  qrModalContent: {
    backgroundColor: "white",
    borderRadius: RADIUS.xl,
    padding: 20,
    width: "100%",
  },
  qrOuterWrapper: {
    padding: 12,
    backgroundColor: COLORS.muted,
    borderRadius: RADIUS.lg,
    marginVertical: 16,
  },
  qrModalChildName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 4,
  },
  qrModalHint: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 16,
  },
  pinDisplay: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.muted,
    borderRadius: RADIUS.md,
    width: "100%",
  },
  pinLabel: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginBottom: 6,
  },
  pinNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.foreground,
    letterSpacing: 6,
  },
  noPinContainer: {
    alignItems: "center",
    paddingVertical: 40,
    width: "100%",
  },
  noPinText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.foreground,
    marginTop: 12,
  },
  noPinHint: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    textAlign: "center",
    marginTop: 6,
  },
  generatePinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6C5CE7",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    marginTop: 16,
  },
  generatePinBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  regenerateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  regenerateBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C5CE7",
  },
  createChildPrompt: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: "#EDE9FE",
    borderStyle: "dashed",
    ...SHADOWS.sm,
  },
  createChildIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  createChildTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  createChildSubtitle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
});
