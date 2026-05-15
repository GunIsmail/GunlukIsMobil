import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { applicationsApi } from '@/api/applicationsApi';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { JobApplication } from '@/types/models';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const AVATAR_COLORS = ['#c9b8ee', '#f3b8d4', '#b8d8ee', '#e0d2b8'];

export default function MessagesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await applicationsApi.listConversations());
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

  const isEmployer = user?.role === 'Employer';

  // For employers: show one conversation per worker (keep most recent application)
  const conversations = useMemo(() => {
    if (!isEmployer) return items;
    const seen = new Map<string, JobApplication>();
    for (const item of items) {
      const existing = seen.get(item.workerId);
      if (!existing || new Date(item.createdAt) > new Date(existing.createdAt)) {
        seen.set(item.workerId, item);
      }
    }
    return Array.from(seen.values());
  }, [items, isEmployer]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Mesajlar</Text>
        <Text style={styles.title}>Sohbetler</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        renderItem={({ item, index }) => {
          const name = isEmployer ? item.workerName : item.jobTitle;
          const sub = isEmployer ? item.jobTitle : `Çalışan: ${item.workerName}`;
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          return (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/chat', params: { applicationId: item.id, jobTitle: item.jobTitle } })
              }
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primarySoft }]}
            >
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{initials(name)}</Text>
              </View>
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
                  <Text style={styles.rowTime}>{item.status === 'Accepted' ? 'Aktif' : ''}</Text>
                </View>
                <Text style={styles.rowSub} numberOfLines={1}>{sub}</Text>
                <Text style={styles.rowHint}>Sohbeti aç →</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aktif sohbet yok.{'\n'}Başvuru kabul edildiğinde burada görüntülenir.
          </Text>
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
  list: { paddingTop: 8, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: colors.primaryDeep },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rowName: { fontSize: 14, fontWeight: '700', color: colors.fg, flex: 1 },
  rowTime: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  rowSub: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 2 },
  rowHint: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  empty: {
    textAlign: 'center', color: colors.muted,
    marginTop: 60, lineHeight: 22, paddingHorizontal: 32,
  },
});
