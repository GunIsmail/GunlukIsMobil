import React, { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert, FlatList, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { applicationsApi } from '@/api/applicationsApi';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { ApplicationStatus, JobApplication, JobAdvertisement } from '@/types/models';

const STATUS_FILTERS = ['Hepsi', 'Beklemede', 'Kabul edildi', 'Reddedildi'] as const;

const statusLabels: Record<ApplicationStatus, string> = {
  Pending: 'Beklemede',
  Accepted: 'Kabul edildi',
  Rejected: 'Reddedildi',
  Cancelled: 'İptal edildi',
};

const statusBadge: Record<ApplicationStatus, { bg: string; fg: string }> = {
  Pending: { bg: colors.primary, fg: '#fff' },
  Accepted: { bg: colors.success, fg: '#fff' },
  Rejected: { bg: colors.primarySoft, fg: colors.primaryDeep },
  Cancelled: { bg: colors.primarySoft, fg: colors.muted },
};

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const AVATAR_COLORS = ['#d4a373', '#e8c5a0', '#c9b8ee', '#f3b8d4'];

export default function ApplicantsScreen() {
  const params = useLocalSearchParams<{ job: string }>();
  const router = useRouter();
  const job: JobAdvertisement = JSON.parse(params.job!);
  const jobId = job.id;
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('Hepsi');
  const [ratedWorkerIds, setRatedWorkerIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationsApi.listByJob(jobId);
      setItems(data);
      const keys = data
        .filter((a) => a.status === 'Accepted')
        .map((a) => `rated_worker_${a.id}`);
      if (keys.length > 0) {
        const pairs = await AsyncStorage.multiGet(keys);
        const rated = new Set(
          pairs.filter(([, val]) => val !== null).map(([key]) => key.replace('rated_worker_', '')),
        );
        setRatedWorkerIds(rated);
      }
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const update = async (id: string, action: 'accept' | 'reject') => {
    try {
      const updated = action === 'accept'
        ? await applicationsApi.accept(id)
        : await applicationsApi.reject(id);
      setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    }
  };

  const handleDeactivate = () => {
    Alert.alert('Emin misiniz?', 'Bu ilanı yayından kaldırmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kaldır', style: 'destructive',
        onPress: async () => {
          try {
            await jobsApi.deactivate(jobId);
            Alert.alert('Kaldırıldı', 'İlan yayından kaldırıldı.', [{ text: 'Tamam', onPress: router.back }]);
          } catch (err) {
            Alert.alert('Hata', extractError(err));
          }
        },
      },
    ]);
  };

  const filtered = activeFilter === 'Hepsi'
    ? items
    : items.filter((a) => statusLabels[a.status] === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={router.back}
          style={({ pressed }) => [styles.backBtn, pressed && { backgroundColor: colors.primarySoft }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </Pressable>
        <Text style={styles.headerTitle}>Başvuranlar</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/create-job', params: { job: params.job } })}
          style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.editBtnText}>Düzenle</Text>
        </Pressable>
      </View>

      {/* Job summary strip */}
      <View style={styles.jobStrip}>
        <View style={styles.jobStripBar} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.jobStripTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.jobStripMeta}>{job.district}</Text>
        </View>
        <Text style={styles.jobStripCount}>{items.length}</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}{f === 'Hepsi' ? ` · ${items.length}` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
        renderItem={({ item, index }) => {
          const badge = statusBadge[item.status];
          return (
            <View style={styles.applicantCard}>
              <View style={styles.applicantTop}>
                <View style={[styles.applicantAvatar, { backgroundColor: AVATAR_COLORS[index % 4] }]}>
                  <Text style={styles.applicantInitials}>{initials(item.workerName)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.applicantNameRow}>
                    <Text style={styles.applicantName} numberOfLines={1}>{item.workerName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.fg }]}>
                        {statusLabels[item.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.applicantPhone}>{item.workerPhone}</Text>
                </View>
              </View>

              {item.message ? (
                <Text style={styles.applicantNote}>"{item.message}"</Text>
              ) : null}

              {item.status === 'Pending' ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => update(item.id, 'reject')}
                  >
                    <Text style={styles.rejectBtnText}>Reddet</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => update(item.id, 'accept')}
                  >
                    <Text style={styles.acceptBtnText}>✓ Kabul et</Text>
                  </Pressable>
                </View>
              ) : null}

              {item.status === 'Accepted' ? (
                <View style={styles.acceptedActions}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/chat', params: { applicationId: item.id, jobTitle: job.title } })}
                    style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.primaryDeep} />
                    <Text style={styles.chatBtnText}>Sohbeti aç</Text>
                  </Pressable>
                  {(() => {
                    const [y, mo, d] = job.jobDate.split('-').map(Number);
                    return new Date(y, mo - 1, d) <= new Date();
                  })() ? (
                    ratedWorkerIds.has(item.id) ? (
                      <View style={[styles.rateBtn, styles.rateBtnDone]}>
                        <Text style={styles.rateBtnDoneText}>✓ Değerlendirildi</Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/rate',
                            params: { type: 'worker', applicationId: item.id, targetName: item.workerName },
                          })
                        }
                        style={({ pressed }) => [styles.rateBtn, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={styles.rateBtnText}>★ Değerlendir</Text>
                      </Pressable>
                    )
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        }}
        ListFooterComponent={
          <Pressable
            onPress={handleDeactivate}
            style={({ pressed }) => [styles.deactivateBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.deactivateBtnText}>İlanı yayından kaldır</Text>
          </Pressable>
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Henüz başvuru yok.</Text> : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.fg },
  editBtn: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  editBtnText: { fontSize: 12, fontWeight: '700', color: colors.primaryDeep },
  jobStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  jobStripBar: { width: 6, height: 36, borderRadius: 3, backgroundColor: colors.primary },
  jobStripTitle: { fontSize: 13.5, fontWeight: '700', color: colors.fg },
  jobStripMeta: { fontSize: 11, color: colors.muted, marginTop: 1 },
  jobStripCount: { fontSize: 16, fontWeight: '700', color: colors.primaryDeep },
  filtersScroll: { flexShrink: 0, maxHeight: 48 },
  filtersContent: { paddingHorizontal: 22, gap: 6, paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  filterChipActive: { backgroundColor: colors.fg, borderColor: colors.fg },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  filterChipTextActive: { color: colors.card },
  list: { paddingHorizontal: 22, paddingBottom: 24, gap: 10 },
  applicantCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
    gap: 10,
  },
  applicantTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  applicantAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  applicantInitials: { fontSize: 15, fontWeight: '700', color: '#fff' },
  applicantNameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  applicantName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.fg },
  applicantPhone: { fontSize: 11, color: colors.muted, marginTop: 3 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  applicantNote: { fontSize: 12.5, color: colors.muted, lineHeight: 18, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 100,
    borderWidth: 1, borderColor: colors.border2,
    alignItems: 'center',
  },
  rejectBtnText: { fontSize: 13, fontWeight: '600', color: colors.fg },
  acceptBtn: {
    flex: 2, paddingVertical: 11, borderRadius: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  acceptedActions: { gap: 8 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primarySoft, paddingVertical: 10, borderRadius: 100,
  },
  chatBtnText: { fontSize: 13, fontWeight: '700', color: colors.primaryDeep },
  rateBtn: {
    borderWidth: 1,
    borderColor: '#f5c51888',
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: '#fffbea',
  },
  rateBtnText: { fontSize: 13, fontWeight: '700', color: '#a07a00' },
  rateBtnDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
  },
  rateBtnDoneText: { fontSize: 13, fontWeight: '700', color: colors.primaryDeep },
  deactivateBtn: {
    marginTop: 8, marginHorizontal: 0, paddingVertical: 13, borderRadius: 14,
    borderWidth: 1, borderColor: `${colors.danger}55`, alignItems: 'center',
  },
  deactivateBtnText: { fontSize: 13, fontWeight: '700', color: colors.danger },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
