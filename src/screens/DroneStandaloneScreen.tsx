import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { dronesNeeded, deliveryProbSingle, shootdownPercent } from '../engine/droneCalc';
import { SectionCard } from '../components/SectionCard';
import { SegmentSelector } from '../components/SegmentSelector';
import { DataRow } from '../components/DataRow';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  DroneStandalone: undefined;
};

type DroneStandaloneScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DroneStandalone'>;

export function DroneStandaloneScreen() {
  const navigation = useNavigation<DroneStandaloneScreenNavigationProp>();
  const { shootdownTier, setShootdown, setDrones } = usePatientStore();

  const drones = dronesNeeded(shootdownTier);
  const deliveryProb = deliveryProbSingle(shootdownTier);
  const shootdownProb = shootdownPercent(shootdownTier);

  React.useEffect(() => {
    setDrones(drones);
  }, [shootdownTier]);

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <SectionCard title="DRONE CALCULATOR">
          <SegmentSelector
            options={[
              { label: 'LOW', value: 'LOW', sublabel: '10% shootdown' },
              { label: 'MED', value: 'MED', sublabel: '50% shootdown' },
              { label: 'HIGH', value: 'HIGH', sublabel: '90% shootdown' },
            ]}
            selected={shootdownTier}
            onSelect={(value) => setShootdown(value as 'LOW' | 'MED' | 'HIGH')}
            columns={3}
          />
          <DataRow label="Shootdown Probability" value={`${shootdownProb}%`} />
          <DataRow label="Single Drone Delivery Prob" value={`${deliveryProb}%`} />
          <DataRow label="Drones Needed (95% confidence)" value={String(drones)} isLast={true} />
        </SectionCard>
      </ScrollView>
    </View>
  );
}
