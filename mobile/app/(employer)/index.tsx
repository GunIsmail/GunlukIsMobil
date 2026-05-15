import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert, FlatList, Pressable, RefreshControl,
  StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

const formatTime = (ts: string) => ts.substring(0, 5);
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export default function MyJobsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<JobAdvertisement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await jobsApi.listMine());
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(useCallback(() => {
    if (user?.role !== 'Employer') return;
    load();
  }, [load, user]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{items.length} aktif ilan</Text>
        <Text style={styles.title}>İlanlarım</Text>
      </View>

      {/* Create CTA */}
      <View style={styles.ctaWrap}>
        <Pressable
          onPress={() => router.push('/create-job')}
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88 }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.ctaBtnText}>Yeni ilan oluştur</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() =>
              router.push({ pathname: '/applicants', params: { job: JSON.stringify(item) } })
            }
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.activePill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeLabel}>AKTİF · YAYINDA</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.district} · {formatDate(item.jobDate)} · {formatTime(item.startTime)}–{formatTime(item.endTime)}
                </Text>
              </View>
              <Text style={styles.cardPrice}>{item.price.toLocaleString('tr-TR')}₺</Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.avatarRow}>
                {['#c9b8ee', '#f3b8d4', '#b8d8ee'].map((c, i) => (
                  <View key={i} style={[styles.miniAvatar, { backgroundColor: c, marginLeft: i === 0 ? 0 : -8 }]}>
                    <Text style={styles.miniAvatarText}>{['O', 'M', 'B'][i]}</Text>
                  </View>
                ))}
                <Text style={styles.applicantCount}> başvuru</Text>
              </View>
              <View style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>Görüntüle →</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz hiç ilan yayınlamadınız.</Text>
        }
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
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
  ctaWrap: { paddingHorizontal: 22, paddingBottom: 14 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  list: { paddingHorizontal: 22, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 2,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  activeLabel: { fontSize: 10.5, fontWeight: '700', color: colors.primaryDeep, letterSpacing: 0.6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.fg, letterSpacing: -0.2, lineHeight: 22 },
  cardMeta: { fontSize: 12, color: colors.muted, marginTop: 4 },
  cardPrice: { fontSize: 20, fontWeight: '700', color: colors.primaryDeep, letterSpacing: -0.5 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border2,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.card,
  },
  miniAvatarText: { fontSize: 9, fontWeight: '700', color: colors.primaryDeep },
  applicantCount: { fontSize: 12, color: colors.muted, marginLeft: 8 },
  viewBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: colors.primaryDeep },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
