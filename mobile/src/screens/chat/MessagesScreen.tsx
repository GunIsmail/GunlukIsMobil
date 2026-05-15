import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { applicationsApi } from '@/api/applicationsApi';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { JobApplication } from '@/types/models';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

export const MessagesScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await applicationsApi.listConversations());
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

  const isEmployer = user?.role === 'Employer';

  return (
    <Screen scrollable={false}>
      <Text style={styles.title}>Mesajlar</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('Chat', { applicationId: item.id, jobTitle: item.jobTitle })
            }
          >
            <Text style={styles.peer}>{isEmployer ? item.workerName : item.jobTitle}</Text>
            <Text style={styles.sub}>{isEmployer ? item.jobTitle : `Çalışan: ${item.workerName}`}</Text>
            <View style={styles.row}>
              <Text style={styles.hint}>Sohbeti aç →</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aktif sohbet yok. Başvuru kabul edildiğinde burada görüntülenir.
          </Text>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  peer: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  row: { marginTop: 8, alignItems: 'flex-end' },
  hint: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 32, paddingHorizontal: 16 },
});
