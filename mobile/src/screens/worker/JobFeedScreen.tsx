import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { JobCard } from '@/components/JobCard';
import { Picker } from '@/components/Picker';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { jobsApi, type JobFilter } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const ALL_DISTRICTS = '— Tüm ilçeler —';

export const JobFeedScreen: React.FC<Props> = ({ navigation }) => {
  const [jobs, setJobs] = useState<JobAdvertisement[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [filter, setFilter] = useState<JobFilter>({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDistricts = useCallback(async () => {
    try {
      const list = await jobsApi.districts();
      setDistricts([ALL_DISTRICTS, ...list]);
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    }
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsApi.list(filter);
      setJobs(data);
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadDistricts();
    }, [loadDistricts])
  );

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const applyFilters = () => {
    setFilter({
      ...filter,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    });
  };

  const clearFilters = () => {
    setFilter({});
    setPriceMin('');
    setPriceMax('');
  };

  return (
    <Screen scrollable={false}>
      <Text style={styles.title}>Mevcut ilanlar</Text>

      <View style={styles.filters}>
        <Picker
          label="İlçe"
          value={filter.district}
          options={districts}
          onChange={(v) =>
            setFilter((prev) => ({ ...prev, district: v === ALL_DISTRICTS ? undefined : v }))
          }
          placeholder="İlçe seçin"
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Min ücret" keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Input label="Maks ücret" keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Button title="Uygula" onPress={applyFilters} />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Button title="Temizle" variant="secondary" onPress={clearFilters} />
          </View>
        </View>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} />}
        ListEmptyComponent={<Text style={styles.empty}>Bu filtrelere uyan ilan bulunamadı.</Text>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  filters: { marginBottom: 8 },
  row: { flexDirection: 'row' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
