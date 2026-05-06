import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../constants/theme";
import { useLearningPath } from "../../../hooks/useMentorData";

export default function MentorLearningPath() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  // Student name can be passed as a query param from student detail screen
  const { student } = useLocalSearchParams<{ student?: string }>();
  const { steps, loading, toggleStep, addStep } = useLearningPath(student);

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [activePhase, setActivePhase] = React.useState<{
    phase: string;
    order: number;
  } | null>(null);
  const [newTaskText, setNewTaskText] = React.useState("");

  // Group steps into phases
  const phaseMap = new Map<
    string,
    { phase: string; phase_order: number; status: string; items: typeof steps }
  >();
  for (const step of steps) {
    if (!phaseMap.has(step.phase)) {
      phaseMap.set(step.phase, {
        phase: step.phase,
        phase_order: step.phase_order,
        status: step.status,
        items: [],
      });
    }
    phaseMap.get(step.phase)!.items.push(step);
  }
  const phases = Array.from(phaseMap.values()).sort(
    (a, b) => a.phase_order - b.phase_order,
  );

  const totalItems = steps.length;
  const doneItems = steps.filter((s) => s.done).length;
  const progressPct = totalItems
    ? Math.round((doneItems / totalItems) * 100)
    : 0;

  const handleAddTask = async () => {
    if (!newTaskText.trim() || !activePhase) return;
    await addStep(
      activePhase.phase,
      activePhase.order,
      newTaskText.trim(),
      student,
    );
    setNewTaskText("");
    setShowAddModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={COLORS.gradients.header as any}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={["top"]}>
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: SPACING.xl,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xl,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: "white",
                    }}
                  >
                    План развития
                  </Text>
                  {student && (
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: TYPOGRAPHY.size.sm,
                        fontWeight: TYPOGRAPHY.weight.medium,
                      }}
                    >
                      {student}
                    </Text>
                  )}
                </View>
              </View>
            </MotiView>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text
            style={{
              textAlign: "center",
              color: COLORS.mutedForeground,
              marginBottom: 20,
            }}
          >
            Загрузка...
          </Text>
        )}

        {/* Progress Summary Card */}
        <View
          style={{
            ...SHADOWS.strict,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            marginBottom: SPACING.xl,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: COLORS.mutedForeground,
              fontWeight: TYPOGRAPHY.weight.bold,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: SPACING.sm,
            }}
          >
            Общий прогресс
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.md,
              marginBottom: SPACING.sm,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 10,
                backgroundColor: COLORS.muted,
                borderRadius: RADIUS.full,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  backgroundColor: COLORS.primary,
                  borderRadius: RADIUS.full,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.primary,
              }}
            >
              {progressPct}%
            </Text>
          </View>
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.sm,
              color: COLORS.mutedForeground,
              fontWeight: TYPOGRAPHY.weight.medium,
            }}
          >
            {doneItems} из {totalItems} этапов завершено
          </Text>
        </View>

        {/* Timeline */}
        {phases.length > 0 && (
          <View style={{ position: "relative" }}>
            <View
              style={{
                position: "absolute",
                left: 21,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: COLORS.muted,
              }}
            />
            {phases.map((phase) => (
              <View
                key={phase.phase}
                style={{
                  flexDirection: "row",
                  gap: 20,
                  marginBottom: SPACING.xl,
                }}
              >
                <View style={{ zIndex: 10 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: RADIUS.full,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        phase.status === "completed"
                          ? COLORS.success
                          : COLORS.primary,
                      borderWidth: 4,
                      borderColor: COLORS.white,
                    }}
                  >
                    <Feather
                      name={phase.status === "completed" ? "check" : "target"}
                      size={18}
                      color="white"
                    />
                  </View>
                </View>

                <View
                  style={{
                    ...SHADOWS.strict,
                    flex: 1,
                    backgroundColor: COLORS.white,
                    borderRadius: RADIUS.xxl,
                    padding: SPACING.xl,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: SPACING.xl,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.md,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                      }}
                    >
                      {phase.phase}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.xs,
                        borderRadius: RADIUS.md,
                        backgroundColor:
                          phase.status === "completed"
                            ? "rgba(52,199,89,0.1)"
                            : "rgba(108,92,231,0.1)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          textTransform: "uppercase",
                          color:
                            phase.status === "completed"
                              ? COLORS.success
                              : COLORS.primary,
                        }}
                      >
                        {phase.status === "completed" ? "ГОТОВО" : "В ПРОЦЕССЕ"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: SPACING.sm }}>
                    {phase.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => toggleStep(item.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: SPACING.md,
                          padding: SPACING.md,
                          borderRadius: RADIUS.lg,
                          backgroundColor: item.done
                            ? "rgba(52,199,89,0.05)"
                            : COLORS.background,
                          borderWidth: 1,
                          borderColor: item.done
                            ? "rgba(52,199,89,0.1)"
                            : COLORS.border,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: item.done
                              ? COLORS.success
                              : COLORS.white,
                            borderWidth: item.done ? 0 : 1,
                            borderColor: COLORS.mutedForeground,
                          }}
                        >
                          {item.done && (
                            <Feather name="check" size={12} color="white" />
                          )}
                        </View>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: TYPOGRAPHY.size.sm,
                            color: item.done
                              ? COLORS.mutedForeground
                              : COLORS.foreground,
                            fontWeight: item.done
                              ? TYPOGRAPHY.weight.regular
                              : TYPOGRAPHY.weight.medium,
                            textDecorationLine: item.done
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {item.item_text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {phase.status === "active" && (
                    <TouchableOpacity
                      onPress={() => {
                        setActivePhase({
                          phase: phase.phase,
                          order: phase.phase_order,
                        });
                        setShowAddModal(true);
                      }}
                      style={{
                        marginTop: SPACING.lg,
                        height: 48,
                        borderRadius: RADIUS.md,
                        borderWidth: 1,
                        borderStyle: "dashed",
                        borderColor: COLORS.border,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: SPACING.xs,
                      }}
                    >
                      <Feather
                        name="plus-circle"
                        size={14}
                        color={COLORS.mutedForeground}
                      />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.xs,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color: COLORS.mutedForeground,
                          textTransform: "uppercase",
                        }}
                      >
                        Добавить цель
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {!loading && phases.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Feather name="map" size={40} color="#E5E7EB" />
            <Text
              style={{
                marginTop: 16,
                color: COLORS.mutedForeground,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Нет шагов плана. Добавьте первый!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderTopLeftRadius: RADIUS.xxl,
              borderTopRightRadius: RADIUS.xxl,
              padding: SPACING.xl,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: SPACING.lg,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xl,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  color: COLORS.foreground,
                }}
              >
                Новая цель
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={{ padding: SPACING.xs }}
              >
                <Feather name="x" size={24} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Опишите новый навык или задачу..."
              autoFocus
              style={{
                backgroundColor: COLORS.background,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
                fontSize: TYPOGRAPHY.size.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                marginBottom: SPACING.xl,
              }}
            />
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={!newTaskText.trim()}
              style={{
                backgroundColor: newTaskText.trim()
                  ? COLORS.primary
                  : COLORS.muted,
                paddingVertical: SPACING.lg,
                borderRadius: RADIUS.lg,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: newTaskText.trim() ? "white" : COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: TYPOGRAPHY.size.md,
                }}
              >
                Добавить
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
