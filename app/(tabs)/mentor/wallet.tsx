import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    COLORS,
    SHADOWS
} from "$constants/theme";
import { useWalletData } from "$hooks/usePlatformData";
import { formatKZT } from "$lib/formatCurrency";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";

export default function MentorWalletScreen() {
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);

  const { transactions, summary } = useWalletData("mentor");

  const renderTransaction = ({ item: tx, index }: any) => (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100 }}
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
          {tx.status === "withdrawal" ? "Вывод средств" : tx.student_name}
        </Text>
        <Text style={styles.txSub}>
          {new Date(tx.transaction_at).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          })}
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
        <View style={{ paddingHorizontal: paddingX, paddingTop: 20 }}>
          <Text style={styles.mainTitle}>Кошелек</Text>
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
                colors={["#6C5CE7", "#8B7FE8"]}
                style={styles.balanceCard}
              >
                <Text style={styles.balanceLabel}>Доступно к выводу</Text>
                <Text style={styles.balanceVal}>
                  {formatKZT(summary.availableBalance)}
                </Text>
                <View style={styles.balanceActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="download" size={18} color={COLORS.primary} />
                    <Text style={styles.actionBtnText}>Вывести</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnOutline}>
                    <Feather name="credit-card" size={18} color="white" />
                    <Text style={styles.actionBtnOutlineText}>История</Text>
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
                    <Feather name="calendar" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.statVal}>{summary.periodCount}</Text>
                    <Text style={styles.statLabel}>Сессий</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Последние операции</Text>
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
  balanceActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
});
