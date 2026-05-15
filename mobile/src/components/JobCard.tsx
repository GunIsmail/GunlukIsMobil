import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

interface Props {
  job: JobAdvertisement;
  onPress?: () => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('tr-TR');
const formatTime = (ts: string) => ts.substring(0, 5);

export const JobCard: React.FC<Props> = ({ job, onPress }) => (
  <Card onPress={onPress}>
    <Text style={styles.title}>{job.title}</Text>
    <Text style={styles.meta}>
      {job.district} · {formatDate(job.jobDate)} · {formatTime(job.startTime)}-{formatTime(job.endTime)}
    </Text>
    <Text style={styles.price}>{job.price.toLocaleString('tr-TR')} ₺</Text>
    <View style={styles.badgeRow}>
      {job.providesFood ? <Badge label="Yemek" /> : null}
      {job.providesTransport ? <Badge label="Ulaşım" /> : null}
    </View>
    <Text style={styles.employer}>Employer: {job.employerName}</Text>
  </Card>
);

const Badge: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  price: { marginTop: 8, fontSize: 18, fontWeight: '700', color: colors.primary },
  employer: { marginTop: 6, fontSize: 12, color: colors.textMuted },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: { backgroundColor: '#E6F0FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
});
