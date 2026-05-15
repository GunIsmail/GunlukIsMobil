import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { jobsApi } from '@/api/jobsApi';
import { applicationsApi } from '@/api/applicationsApi';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

interface Props {
  route: { params: { jobId: string } };
  navigation: { goBack: () => void; navigate: (s: string) => void };
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('tr-TR');
const formatTime = (ts: string) => ts.substring(0, 5);

export const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const user = useAuthStore((s) => s.user);
  const [job, setJob] = useState<JobAdvertisement | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setJob(await jobsApi.getById(jobId));
      } catch (err) {
        Alert.alert('Hata', extractError(err));
      }
    })();
  }, [jobId]);

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Giriş gerekli', 'Başvuru için Çalışan olarak giriş yapın.', [
        { text: 'Tamam', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (user.role !== 'Worker') {
      Alert.alert('Yalnızca çalışanlar', 'Yalnızca çalışan hesapları ilanlara başvurabilir.');
      return;
    }
    setSubmitting(true);
    try {
      await applicationsApi.apply(jobId, message.trim() || undefined);
      Alert.alert('Gönderildi', 'Başvurunuz iletildi.', [{ text: 'Tamam', onPress: navigation.goBack }]);
    } catch (err) {
      Alert.alert('Başvuru başarısız', extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <Screen>
        <Text style={styles.loading}>Yükleniyor…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.meta}>
        {job.district} · {formatDate(job.jobDate)} · {formatTime(job.startTime)}-{formatTime(job.endTime)}
      </Text>
      <Text style={styles.price}>{job.price.toLocaleString('tr-TR')} ₺</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Adres</Text>
        <Text style={styles.body}>{job.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Açıklama</Text>
        <Text style={styles.body}>{job.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>İmkânlar</Text>
        <Text style={styles.body}>
          {job.providesFood ? '• Yemek dahil\n' : ''}
          {job.providesTransport ? '• Ulaşım dahil\n' : ''}
          {!job.providesFood && !job.providesTransport ? 'Yok' : ''}
        </Text>
      </View>

      <Input
        label="İşverene mesaj (opsiyonel)"
        value={message}
        onChangeText={setMessage}
        multiline
        placeholder="Neden uygun olduğunuzu kısaca yazın..."
      />
      <Button title="Bu ilana başvur" onPress={handleApply} loading={submitting} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  loading: { color: colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  price: { fontSize: 22, fontWeight: '700', color: colors.primary, marginTop: 8 },
  section: { marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
});
