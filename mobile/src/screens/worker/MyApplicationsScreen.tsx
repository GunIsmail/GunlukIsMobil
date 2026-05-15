import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { applicationsApi } from '@/api/applicationsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { ApplicationStatus, JobApplication } from '@/types/models';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const statusPalette: Record<ApplicationStatus, string> = {
  Pending: colors.warning,
  Accepted: colors.success,
  Rejected: colors.danger,
  Cancelled: colors.textMuted,
};

const statusLabels: Record<ApplicationStatus, string> = {
  Pending: 'Beklemede',
  Accepted: 'Kabul edildi',
  Rejected: 'Reddedildi',
  Cancelled: 'İptal edildi',
};

export const MyApplicationsScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await applicationsApi.listMine());
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen scrollable={false}>
      <Text style={styles.title}>Başvurularım</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            <View style={[styles.badge, { backgroundColor: statusPalette[item.status] + '22' }]}>
              <Text style={[styles.badgeText, { color: statusPalette[item.status] }]}>
                {statusLabels[item.status]}
              </Text>
            </View>
            {item.message ? <Text style={styles.message}>"{item.message}"</Text> : null}
            {item.status === 'Accepted' ? (
              <Button
                title="Sohbeti aç"
                onPress={() => navigation.navigate('Chat', { applicationId: item.id, jobTitle: item.jobTitle })}
                style={{ marginTop: 12 }}
              />
            ) : null}
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Henüz hiçbir ilana başvurmadınız.</Text>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 6 },
  badgeText: { fontWeight: '600', fontSize: 12 },
  message: { marginTop: 8, color: colors.textMuted, fontStyle: 'italic' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
