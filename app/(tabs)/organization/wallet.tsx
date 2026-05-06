import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "../../../constants/theme";
import { useWalletData } from "../../../hooks/usePlatformData";
import { formatKZT } from "../../../lib/formatCurrency";
import { getDashboardHorizontalPadding, useIsDesktop } from "../../../lib/useIsDesktop";

export default function OrgWalletScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    iban: "",
    bankName: "",
    recipientName: "",
  });

  const { transactions, summary, requestWithdrawal } = useWalletData("org");

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert("Ошибка", "Введите сумму для вывода");
      return;
    }
    if (parseFloat(withdrawAmount) > summary.availableBalance) {
      Alert.alert("Ошибка", "Недостаточно средств");
      return;
    }
    if (
      !bankDetails.iban ||
      !bankDetails.bankName ||
      !bankDetails.recipientName
    ) {
      Alert.alert("Ошибка", "Заполните все банковские реквизиты");
      return;
    }
    const result = await requestWithdrawal({
      amountKzt: parseFloat(withdrawAmount),
      iban: bankDetails.iban,
      bankName: bankDetails.bankName,
      recipientName: bankDetails.recipientName,
    });
    if (result.error) {
      Alert.alert("Ошибка", result.error);
      return;
    }
    Alert.alert(
      "Заявка отправлена",
      `Вывод ${formatKZT(parseFloat(withdrawAmount))} будет обработан в течение 1-3 рабочих дней`,
      [{ text: "OK", onPress: () => setShowWithdrawModal(false) }],
    );
    setWithdrawAmount("");
  };

  const renderTransaction = ({ item: tx, index }: any) => (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 80 }}
      style={styles.txCard}
    >
      <View
        style={[
          styles.txIconBox,
          {
            backgroundColor: tx.status === "withdrawal" ? "#FEF2F2" : "#F0FDF4",
          },
        ]}
      >
        <Feather
          name={
            tx.status === "withdrawal" ? "arrow-up-right" : "arrow-down-left"
          }
          size={20}
          color={tx.status === "withdrawal" ? "#EF4444" : "#16A34A"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>
          {tx.status === "withdrawal" ? "Вывод средств" : tx.description}
        </Text>
        <Text style={styles.txSub}>
          {new Date(tx.transaction_at).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          })}
          {tx.student_name ? ` • ${tx.student_name}` : ""}
          {tx.method ? ` • ${tx.method}` : ""}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          { color: tx.amount_kzt > 0 ? "#16A34A" : "#EF4444" },
        ]}
      >
        {tx.amount_kzt > 0 ? "+" : ""}
        {formatKZT(tx.amount_kzt)}
      </Text>
    </MotiView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: paddingX,
            paddingTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.foreground} />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Вывод денег</Text>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingBottom: 100,
          }}
          ListHeaderComponent={
            <View style={{ marginBottom: 32, marginTop: 20 }}>
              {/* Balance Card */}
              <LinearGradient
                colors={["#6C5CE7", "#8B5CF6"]}
                style={styles.balanceCard}
              >
                <Text style={styles.balanceLabel}>Доступно к выводу</Text>
                <Text style={styles.balanceVal}>
                  {formatKZT(summary.availableBalance)}
                </Text>

                {/* Revenue breakdown */}
                <View style={styles.breakdownBox}>
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownDot} />
                    <Text style={styles.breakdownLabel}>Общий доход</Text>
                    <Text style={styles.breakdownVal}>
                      {formatKZT(summary.totalRevenue)}
                    </Text>
                  </View>
                  <View style={[styles.breakdownRow, { opacity: 0.6 }]}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: "rgba(255,255,255,0.5)" },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>Комиссия UM (10%)</Text>
                    <Text style={styles.breakdownVal}>
                      -{formatKZT(summary.commission)}
                    </Text>
                  </View>
                </View>

                <View style={styles.balanceActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setShowWithdrawModal(true)}
                  >
                    <Feather name="download" size={18} color={COLORS.primary} />
                    <Text style={styles.actionBtnText}>Вывести</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnOutline}>
                    <Feather name="file-text" size={18} color="white" />
                    <Text style={styles.actionBtnOutlineText}>Отчёт</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View
                    style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}
                  >
                    <Feather name="trending-up" size={18} color="#16A34A" />
                  </View>
                  <View>
                    <Text style={styles.statVal}>
                      {formatKZT(summary.periodRevenue)}
                    </Text>
                    <Text style={styles.statLabel}>
                      За {summary.periodLabel}
                    </Text>
                  </View>
                </View>
                <View style={styles.statBox}>
                  <View
                    style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}
                  >
                    <Feather name="users" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.statVal}>{summary.periodCount}</Text>
                    <Text style={styles.statLabel}>Оплат</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>История операций</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Feather name="credit-card" size={48} color="#E5E7EB" />
              <Text style={{ color: COLORS.mutedForeground, marginTop: 16 }}>
                Операций пока нет
              </Text>
            </View>
          }
        />

        {/* Withdraw Modal */}
        <Modal visible={showWithdrawModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Вывод средств</Text>
                <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                  <Feather name="x" size={24} color={COLORS.mutedForeground} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Сумма вывода (₸)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                />
                <Text style={styles.inputHint}>
                  Доступно: {formatKZT(summary.availableBalance)}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>IBAN / Номер счёта</Text>
                <TextInput
                  style={styles.input}
                  placeholder="KZ..."
                  value={bankDetails.iban}
                  onChangeText={(t) =>
                    setBankDetails({ ...bankDetails, iban: t })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Название банка</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kaspi Bank, Halyk Bank..."
                  value={bankDetails.bankName}
                  onChangeText={(t) =>
                    setBankDetails({ ...bankDetails, bankName: t })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Получатель (ФИО / Название организации)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="ТОО «Центр развития»"
                  value={bankDetails.recipientName}
                  onChangeText={(t) =>
                    setBankDetails({ ...bankDetails, recipientName: t })
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleWithdraw}
              >
                <Text style={styles.submitBtnText}>Отправить заявку</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
  balanceCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    ...SHADOWS.md,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  balanceVal: {
    color: "white",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: -1,
  },
  breakdownBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 10,
  },
  breakdownLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  breakdownVal: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },
  balanceActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "white",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...SHADOWS.sm,
  },
  actionBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  actionBtnOutline: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  actionBtnOutlineText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statVal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  txSub: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.foreground,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
});
