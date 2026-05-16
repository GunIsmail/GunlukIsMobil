import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applicationsApi } from '@/api/applicationsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { ApplicationStatus, EmployerRatingDetail, JobApplication } from '@/types/models';

const statusConfig: Record<ApplicationStatus, { label: string; bg: string; fg: string }> = {
  Pending: { label: 'Beklemede', bg: `${colors.warning}22`, fg: colors.warning },
  Accepted: { label: 'Kabul edildi', bg: `${colors.success}22`, fg: colors.success },
  Rejected: { label: 'Reddedildi', bg: colors.primarySoft, fg: colors.muted },
  Cancelled: { label: 'İptal edildi', bg: colors.primarySoft, fg: colors.muted },
};

function RatingDetailCard({ detail }: { detail: EmployerRatingDetail }) {
  const rows = [
    { label: 'Çalışma Şartları', value: detail.workingConditions },
    { label: 'Ödeme Güvenilirliği', value: detail.paymentReliability },
    { label: 'Yönetim Tarzı', value: detail.managementStyle },
  ];
  return (
    <View style={styles.ratingDetail}>
      {rows.map((r) => (
        <View key={r.label} style={styles.ratingDetailRow}>
          <Text style={styles.ratingDetailLabel}>{r.label}</Text>
          <Text style={styles.ratingDetailStars}>{'★'.repeat(r.value)}{'☆'.repeat(5 - r.value)}</Text>
        </View>
      ))}
      {detail.comment ? (
        <Text style={styles.ratingDetailComment}>"{detail.comment}"</Text>
      ) : null}
    </View>
  );
}

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRatings, setExpandedRatings] = useState<Set<string>>(new Set());
  const [ratedMap, setRatedMap] = useState<Record<string, EmployerRatingDetail>>({});

  const load = useCallback(async () => {
    try {
      const data = await applicationsApi.listMine();
      setItems(data);
      // AsyncStorage'dan hangi applicationId'ler değerlendirilmiş oku
      const keys = data
        .filter((a) => a.status === 'Accepted')
        .map((a) => `rated_employer_${a.id}`);
      if (keys.length > 0) {
        const pairs = await AsyncStorage.multiGet(keys);
        const map: Record<string, EmployerRatingDetail> = {};
        for (const [key, val] of pairs) {
          if (val) {
            const id = key.replace('rated_employer_', '');
            map[id] = JSON.parse(val);
          }
        }
        setRatedMap(map);
      }
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Geçmişim</Text>
        <Text style={styles.title}>Başvurularım</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        renderItem={({ item }) => {
          const s = statusConfig[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.jobTitle} numberOfLines={2}>{item.jobTitle}</Text>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.fg }]}>{s.label}</Text>
                </View>
              </View>

              {item.message ? (
                <Text style={styles.note}>"{item.message}"</Text>
              ) : null}

              {item.status === 'Accepted' ? (
                <View style={styles.acceptedActions}>
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: '/chat', params: { applicationId: item.id, jobTitle: item.jobTitle } })
                    }
                    style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.chatBtnText}>Sohbeti aç →</Text>
                  </Pressable>
                  {(() => {
                    const [y, mo, d] = item.jobDate.split('-').map(Number);
                    const jobLocalDate = new Date(y, mo - 1, d);
                    return jobLocalDate <= new Date();
                  })() ? (
                    ratedMap[item.id] ? (
                      <>
                        <Pressable
                          onPress={() =>
                            setExpandedRatings((prev) => {
                              const next = new Set(prev);
                              next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                              return next;
                            })
                          }
                          style={({ pressed }) => [styles.rateBtn, styles.rateBtnDone, pressed && { opacity: 0.8 }]}
                        >
                          <Text style={styles.rateBtnDoneText}>
                            {expandedRatings.has(item.id) ? '▲ Değerlendirmeyi gizle' : '★ Değerlendirmeyi gör'}
                          </Text>
                        </Pressable>
                        {expandedRatings.has(item.id) && ratedMap[item.id] ? (
                          <RatingDetailCard detail={ratedMap[item.id]} />
                        ) : null}
                      </>
                    ) : (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/rate',
                            params: { type: 'employer', applicationId: item.id, targetName: item.jobTitle },
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
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz hiçbir ilana başvurmadınız.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 },
  eyebrow: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.4,
    color: colors.primary, textTransform: 'uppercase',
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.7, color: colors.fg, marginTop: 4 },
  list: { paddingHorizontal: 22, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 1,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  jobTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.fg, lineHeight: 22 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    flexShrink: 0,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  note: { fontSize: 12.5, color: colors.muted, fontStyle: 'italic', lineHeight: 18 },
  acceptedActions: { gap: 8 },
  chatBtn: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
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
  ratingDetail: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingDetailLabel: { fontSize: 12.5, color: colors.fg, fontWeight: '600' },
  ratingDetailStars: { fontSize: 13, color: '#f5c518', letterSpacing: 1 },
  ratingDetailComment: { fontSize: 12, color: colors.muted, fontStyle: 'italic', lineHeight: 18, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 60 },
});
