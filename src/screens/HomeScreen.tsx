import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BigButton } from '../components/BigButton';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Home: undefined;
  March: undefined;
  RecentPatients: undefined;
  DroneStandalone: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [utcTime, setUtcTime] = useState(new Date().toISOString());

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <View style={styles.header}>
          <Text style={typography.screenTitle}>MedIC</Text>
          <Text style={styles.subtitle}>DHA-33: Heads Up Medics</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>● OFFLINE</Text>
          <Text style={styles.statusText}>UTC: {utcTime.substring(11, 19)}</Text>
        </View>

        <BigButton
          label="NEW PATIENT"
          sublabel="Start MARCH assessment"
          variant="go"
          onPress={() => navigation.navigate('March')}
        />

        <BigButton
          label="RECENT PATIENTS"
          variant="neutral"
          onPress={() => navigation.navigate('RecentPatients')}
        />

        <BigButton
          label="DRONE CALCULATOR"
          variant="neutral"
          onPress={() => navigation.navigate('DroneStandalone')}
        />

        <SectionCard title="AI BUDDY">
          <BigButton
            label="VOICE MODE"
            variant="outline"
            size="small"
            onPress={() => {}}
            disabled={true}
          />
          <BigButton
            label="TEXT MODE"
            variant="outline"
            size="small"
            onPress={() => {}}
            disabled={true}
          />
        </SectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.textDim,
    fontFamily: 'monospace',
  },
});
