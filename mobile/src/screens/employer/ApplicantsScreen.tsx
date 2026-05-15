import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { applicationsApi } from '@/api/applicationsApi';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { ApplicationStatus, JobApplication, JobAdvertisement } from '@/types/models';

interface Props {
  route: { params: { job: JobAdvertisement } };
  navigation: { navigate: (s: string, params?: object) => void; goBack: () => void };
}

const statusLabels: Record<ApplicationStatus, string> = {
  Pending: 'Beklemede',
  Accepted: 'Kabul edildi',
  Rejected: 'Reddedildi',
  Cancelled: 'İptal edildi',
};

export const ApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { job } = route.params;
  const jobId = job.id;
  const title = job.title;
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await applicationsApi.listByJob(jobId));
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
        text: 'Kaldır',
        style: 'destructive',
        onPress: async () => {
          try {
            await jobsApi.deactivate(jobId);
            Alert.alert('Kaldırıldı', 'İlan yayından kaldırıldı.', [{ text: 'Tamam', onPress: navigation.goBack }]);
          } catch (err) {
            Alert.alert('Hata', extractError(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen scrollable={false}>
      <Text style={styles.subtitle}>{title}</Text>

      <View style={styles.jobActionsRow}>
        <View style={{ flex: 1 }}>
          <Button 
            title="Düzenle" 
            variant="secondary" 
            onPress={() => navigation.navigate('CreateJob', { job })} 
          />
        </View>
        <View style={{ width: 8 }} />
        <View style={{ flex: 1 }}>
          <Button 
            title="İlandan Kaldır" 
            variant="danger" 
            onPress={handleDeactivate} 
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.workerName}</Text>
            <Text style={styles.contact}>{item.workerPhone}</Text>
            {item.message ? <Text style={styles.message}>"{item.message}"</Text> : null}
            <Text style={styles.status}>Durum: {statusLabels[item.status]}</Text>
            {item.status === 'Pending' ? (
              <View style={styles.actionsRow}>
                <View style={{ flex: 1 }}>
                  <Button title="Kabul et" onPress={() => update(item.id, 'accept')} />
                </View>
                <View style={{ width: 8 }} />
                <View style={{ flex: 1 }}>
                  <Button title="Reddet" variant="danger" onPress={() => update(item.id, 'reject')} />
                </View>
              </View>
            ) : null}
            {item.status === 'Accepted' ? (
              <Button
                title="Sohbeti aç"
                variant="secondary"
                onPress={() => navigation.navigate('Chat', { applicationId: item.id, jobTitle: title })}
                style={{ marginTop: 8 }}
              />
            ) : null}
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Henüz başvuru yok.</Text>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  contact: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  message: { marginTop: 8, color: colors.text, fontStyle: 'italic' },
  status: { marginTop: 8, color: colors.textMuted, fontSize: 13 },
  actionsRow: { flexDirection: 'row', marginTop: 12 },
  jobActionsRow: { flexDirection: 'row', marginBottom: 16 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
