import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BigButton } from "../components/BigButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { sharedStyles } from "../theme/styles";

type RootStackParamList = {
  Home: undefined;
  AssessmentMode: undefined;
  RecentPatients: undefined;
  Drafts: undefined;
  InteractiveCare: { requestId?: string };
};
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.titleBar}>
        <Text style={styles.title}>MEDIC TRIAGE</Text>
        <View style={sharedStyles.divider} />
      </View>

      <View style={styles.center}>
        <BigButton
          variant="go"
          label="NEW PATIENT"
          onPress={() => navigation.navigate("AssessmentMode")}
        />

        <BigButton
          variant="primary"
          label="AI CLINICAL ASSISTANT"
          onPress={() => navigation.navigate("InteractiveCare", {})}
        />
      </View>

      <View style={styles.bottomBar}>
        <View style={sharedStyles.divider} />
        <View style={styles.row}>
          <View style={styles.halfBtn}>
            <BigButton
              variant="neutral"
              label="DRAFTS"
              size="small"
              onPress={() => navigation.navigate("Drafts")}
            />
          </View>
          <View style={styles.halfBtn}>
            <BigButton
              variant="neutral"
              label="HISTORY"
              size="small"
              onPress={() => navigation.navigate("RecentPatients")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xxl,
  },
  titleBar: {
    paddingTop: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    textAlign: "center",
    fontSize: 30,
    letterSpacing: 3,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xxxl,
  },
  bottomBar: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfBtn: { flex: 1 },
});
