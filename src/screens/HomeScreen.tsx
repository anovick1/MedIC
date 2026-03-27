import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Home: undefined;
  AssessmentMode: undefined;
  RecentPatients: undefined;
  Drafts: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.topSpacer} />

      <Text style={styles.title}>MEDIC TRIAGE</Text>

      <View style={styles.mainButton}>
        <BigButton
          variant="go"
          label="NEW PATIENT"
          onPress={() => navigation.navigate('AssessmentMode')}
        />
      </View>

      <View style={sharedStyles.divider} />

      <View style={styles.secondaryButtons}>
        <BigButton
          variant="tan"
          label="RECENT REQUESTS"
          size="small"
          onPress={() => navigation.navigate('RecentPatients')}
        />

        <BigButton
          variant="tan"
          label="DRAFTS"
          size="small"
          onPress={() => navigation.navigate('Drafts')}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  topSpacer: {
    flex: 2,
  },
  title: {
    ...typography.screenTitle,
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: spacing.xxl,
  },
  mainButton: {
    marginBottom: spacing.xl,
  },
  secondaryButtons: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    flex: 3,
  },
});
