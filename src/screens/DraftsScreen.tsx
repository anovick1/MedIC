import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { loadAllDrafts, deleteDraft, DraftRecord } from '../storage/storage';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Home: undefined;
  Drafts: undefined;
  TriageForm: { page: number };
};

type DraftsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Drafts'>;

export function DraftsScreen() {
  const navigation = useNavigation<DraftsScreenNavigationProp>();
  const loadDraftIntoStore = usePatientStore((s) => s.loadDraftIntoStore);
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAllDrafts().then(setDrafts).finally(() => setLoading(false));
    }, []),
  );

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  };

  const handleResume = (draft: DraftRecord) => {
    loadDraftIntoStore(draft);
    if (draft.lastPage === 0) {
      navigation.navigate('MARCH' as any);
    } else {
      navigation.navigate('TriageForm', { page: draft.lastPage });
    }
  };

  return (
    <View style={sharedStyles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.75}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Drafts</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : drafts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No saved drafts</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              deleting={deleting === draft.id}
              onDelete={() => handleDelete(draft.id)}
              onResume={() => handleResume(draft)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function DraftCard({ draft, deleting, onDelete, onResume }: {
  draft: DraftRecord;
  deleting: boolean;
  onDelete: () => void;
  onResume: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardPatient}>{draft.patientId || 'No Patient ID'}</Text>
          <Text style={styles.cardMission}>{draft.missionId || 'No Mission ID'}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          disabled={deleting}
          activeOpacity={0.75}
        >
          <Text style={styles.deleteText}>{deleting ? '...' : 'DELETE'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMeta}>{draft.lastPage === 0 ? 'MARCH' : `Page ${draft.lastPage}/6`}</Text>
      <Text style={styles.cardMeta}>Last saved: {timeAgo(draft.lastSaved)}</Text>
      <View style={styles.resumeRow}>
        <BigButton variant="go" label="Resume →" size="small" onPress={onResume} />
      </View>
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
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  title: {
    ...typography.screenTitle,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.label,
    color: colors.textDim,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    padding: sizing.cardPadding,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  cardPatient: {
    ...typography.dataVal,
    fontWeight: '700',
  },
  cardMission: {
    ...typography.dataVal,
    color: colors.textDim,
  },
  deleteBtn: {
    backgroundColor: colors.redDim,
    borderRadius: sizing.borderRadiusSm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.red,
  },
  cardMeta: {
    ...typography.label,
    color: colors.textDim,
    marginBottom: 0,
  },
  resumeRow: {
    marginTop: spacing.sm,
  },
});
