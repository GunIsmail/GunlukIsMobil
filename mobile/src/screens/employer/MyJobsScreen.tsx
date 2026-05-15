import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/Button';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

export const MyJobsScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<JobAdvertisement[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await jobsApi.listMine());
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen scrollable={false}>
      <Text style={styles.title}>İlanlarım</Text>
      <Button
        title="+ Yeni ilan oluştur"
        onPress={() => navigation.navigate('CreateJob')}
        style={{ marginBottom: 12 }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('Applicants', { job: item })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Henüz hiç ilan yayınlamadınız.</Text>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
