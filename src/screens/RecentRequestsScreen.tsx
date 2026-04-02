import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { loadAllRequests, deleteRequest, RequestRecord } from '../storage/storage';
import { DataRow } from '../components/DataRow';
import { AlertBanner } from '../components/AlertBanner';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Home: undefined;
  RecentPatients: undefined;
  InteractiveCare: { requestId?: string };
};
type NavProp = StackNavigationProp<RootStackParamList, 'RecentPatients'>;

export function RecentRequestsScreen() {
  const navigation = useNavigation<NavProp>();
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAllRequests().then(setRequests).finally(() => setLoading(false));
    }, []),
  );

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={sharedStyles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.75}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Recent Requests</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No sent requests</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              isExpanded={expanded === req.id}
              onToggle={() => setExpanded(expanded === req.id ? null : req.id)}
              onDelete={() => handleDelete(req.id)}
              onChat={() => navigation.navigate('InteractiveCare', { requestId: req.id })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function RequestCard({ request, isExpanded, onToggle, onDelete, onChat }: {
  request: RequestRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onChat: () => void;
}) {
  let vitals: any = {};
  try { vitals = JSON.parse(request.vitalsSnapshot); } catch {}

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <Text style={styles.cardPatient}>{request.patientId || '—'}</Text>
        <Text style={styles.cardMission}>{request.missionId || '—'}</Text>
        <Text style={styles.cardChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </Pressable>

      <View style={styles.cardSubRow}>
        <Text style={styles.cardMeta}>Sent {timeAgo(request.sentAt)}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.chatBtn} onPress={onChat} activeOpacity={0.75}>
            <Text style={styles.chatBtnText}>CONSULT AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.75}>
            <Text style={styles.deleteText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={sharedStyles.divider} />
          <DataRow label="BP / HR" value={`${vitals.bpSystolic ?? '—'}/${vitals.bpDiastolic ?? '—'} mmHg  HR: ${vitals.heartRate ?? '—'}`} />
          <DataRow label="SpO2 / Temp" value={`${vitals.oxygenSaturation ?? '—'}%  ${vitals.temperatureC ?? '—'}°C`} />
          <DataRow label="Shootdown" value={request.shootdownRisk != null ? `${request.shootdownRisk}%` : '—'} />
          {request.marchFlags.length > 0 && (
            <AlertBanner type="critical" message={`MARCH: ${request.marchFlags.join(', ')}`} />
          )}
          <View style={sharedStyles.divider} />
          <Text style={styles.payloadLabel}>Squirt Payload:</Text>
          <View style={styles.payloadBlock}>
            <Text style={typography.mono}>{request.squirtPayload}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  title: { ...typography.screenTitle, paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.label, color: colors.textDim },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: sizing.borderRadius, padding: sizing.cardPadding },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardPatient: { ...typography.dataVal, fontWeight: '700', flex: 1 },
  cardMission: { ...typography.dataVal, color: colors.textDim },
  cardChevron: { fontSize: 14, color: colors.textDim },
  cardSubRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  cardMeta: { ...typography.label, color: colors.textDim, marginBottom: 0 },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  chatBtn: { backgroundColor: colors.accentDim, borderRadius: sizing.borderRadiusSm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.accent },
  chatBtnText: { fontSize: 12, fontWeight: '600', color: colors.accent },
  deleteBtn: { backgroundColor: colors.redDim, borderRadius: sizing.borderRadiusSm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  deleteText: { fontSize: 12, fontWeight: '600', color: colors.red },
  expandedContent: { marginTop: spacing.md, gap: spacing.sm },
  payloadLabel: { ...typography.label, color: colors.textDim, marginBottom: 0 },
  payloadBlock: { backgroundColor: colors.surface2, borderRadius: sizing.borderRadiusSm, padding: spacing.sm },
});
