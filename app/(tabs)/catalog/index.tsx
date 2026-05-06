import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOWS } from "../../../constants/theme";
import { useParentData } from "../../../contexts/ParentDataContext";
import {
  courseGradient,
  SCORE_TO_SKILLS,
  usePublicCourses,
} from "../../../hooks/usePublicData";

const { width } = Dimensions.get("window");
const IS_DESKTOP = Platform.OS === "web" && width >= 900;

const SKILL_FILTERS = [
  "⭐ Рекомендовано AI",
  "Все",
  "Код",
  "Логика",
  "Математика",
  "Дизайн",
  "Языки",
  "Команда",
  "Креативность",
];

export default function CatalogScreen() {
  const [activeCategory, setActiveCategory] = useState("⭐ Рекомендовано AI");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { courses, loading } = usePublicCourses();
  const { childrenProfile, activeChildId } = useParentData();
  const activeChild =
    childrenProfile.find((c) => c.id === activeChildId) || childrenProfile[0];

  // Build recommended set from talent profile
  const recommendedIds = useMemo(() => {
    if (!activeChild?.talentProfile) return new Set<string>();
    const scores = activeChild.talentProfile.scores as Record<string, number>;
    const topTraits = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t]) => t);
    const wantedSkills = new Set(
      topTraits.flatMap((t) => SCORE_TO_SKILLS[t] ?? []),
    );
    return new Set(
      courses
        .filter((c) => c.skills.some((s) => wantedSkills.has(s)))
        .map((c) => c.id),
    );
  }, [activeChild, courses]);

  const filteredItems = useMemo(() => {
    return courses.filter((item) => {
      const bySearch = item.title.toLowerCase().includes(search.toLowerCase());
      if (!bySearch) return false;
      if (activeCategory === "⭐ Рекомендовано AI")
        return recommendedIds.has(item.id) || recommendedIds.size === 0;
      if (activeCategory === "Все") return true;
      return item.skills.includes(activeCategory);
    });
  }, [activeCategory, search, courses, recommendedIds]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header */}
          <View
            style={{ paddingTop: 12, paddingHorizontal: 20, marginBottom: 16 }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: COLORS.foreground,
                marginBottom: 4,
              }}
            >
              Каталог
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.mutedForeground }}>
              {loading
                ? "Загрузка..."
                : `${courses.length} курсов от организаций`}
            </Text>
          </View>

          <View
            style={{ width: IS_DESKTOP ? "50%" : "100%", alignSelf: "center" }}
          >
            {/* Search */}
            <View
              style={{
                backgroundColor: COLORS.muted,
                borderRadius: RADIUS.md,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                height: 48,
                marginHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <Feather name="search" size={18} color={COLORS.mutedForeground} />
              <TextInput
                placeholder="Поиск"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={COLORS.mutedForeground}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: COLORS.foreground,
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Feather name="x" size={16} color={COLORS.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            {/* Skill filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingLeft: 20, marginBottom: 20 }}
            >
              {SKILL_FILTERS.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 18,
                      borderRadius: RADIUS.full,
                      marginRight: 8,
                      backgroundColor: active ? COLORS.primary : COLORS.muted,
                    }}
                  >
                    <Text
                      style={{
                        color: active ? "white" : COLORS.foreground,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Loading */}
          {loading && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginVertical: 40 }}
            />
          )}

          {/* Empty */}
          {!loading && courses.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 60,
                paddingHorizontal: 40,
              }}
            >
              <Feather name="inbox" size={48} color="#E5E7EB" />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 18,
                  fontWeight: "800",
                  color: COLORS.foreground,
                  textAlign: "center",
                }}
              >
                Курсов пока нет
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: COLORS.mutedForeground,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Организации ещё не добавили курсы.{"\n"}Загляните позже.
              </Text>
            </View>
          )}

          {/* Cards grid */}
          {!loading && (
            <View
              style={{
                width: IS_DESKTOP ? "50%" : "100%",
                alignSelf: "center",
                padding: 20,
                paddingTop: 0,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {filteredItems.map((item, index) => {
                const [c1] = courseGradient(index);
                return (
                  <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 350, delay: index * 40 }}
                    style={{
                      width: "48%",
                      marginBottom: 16,
                      borderRadius: RADIUS.lg,
                      overflow: "hidden",
                      backgroundColor: COLORS.card,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      ...SHADOWS.md,
                    }}
                  >
                    {/* Card header */}
                    <View
                      style={{
                        height: 100,
                        backgroundColor: c1 + "12",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          backgroundColor: c1 + "20",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Feather
                          name={(item.icon as any) || "book-open"}
                          size={22}
                          color={c1}
                        />
                      </View>
                      {item.org_name ? (
                        <View
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: COLORS.card,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: COLORS.mutedForeground,
                              fontWeight: "600",
                            }}
                            numberOfLines={1}
                          >
                            {item.org_name}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Card body */}
                    <View style={{ padding: 12 }}>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: COLORS.foreground,
                          marginBottom: 4,
                          lineHeight: 19,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.mutedForeground,
                          marginBottom: 10,
                        }}
                      >
                        {item.price.toLocaleString()} ₸/мес
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/parent/club/${item.id}` as any)
                        }
                        style={{
                          backgroundColor: COLORS.primary,
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: RADIUS.full,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          Подробнее
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                );
              })}

              {!loading && courses.length > 0 && filteredItems.length === 0 && (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    paddingVertical: 40,
                  }}
                >
                  <Feather name="search" size={36} color="#E5E7EB" />
                  <Text
                    style={{
                      marginTop: 12,
                      color: COLORS.mutedForeground,
                      fontWeight: "700",
                    }}
                  >
                    Ничего не найдено
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
