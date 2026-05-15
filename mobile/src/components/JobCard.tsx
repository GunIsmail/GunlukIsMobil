import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

interface Props {
  job: JobAdvertisement;
  onPress?: () => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
};
const formatTime = (ts: string) => ts.substring(0, 5);

export const JobCard: React.FC<Props> = ({ job, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
  >
    <View style={styles.topRow}>
      <View style={styles.info}>
        <Text style={styles.employer} numberOfLines={1}>{job.employerName}</Text>
        <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.priceAmount}>
          {job.price.toLocaleString('tr-TR')}
          <Text style={styles.priceCurrency}> ₺</Text>
        </Text>
        <Text style={styles.priceLabel}>VARDİYA</Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <Text style={styles.metaItem}>📍 {job.district}</Text>
      <View style={styles.dot} />
      <Text style={styles.metaItem}>
        🕐 {formatTime(job.startTime)}–{formatTime(job.endTime)}
      </Text>
      <Text style={styles.metaDate}>{formatDate(job.jobDate)}</Text>
    </View>

    <View style={styles.footer}>
      <View style={styles.tags}>
        {job.providesFood ? <Tag label="Yemek" /> : null}
        {job.providesTransport ? <Tag label="Ulaşım" /> : null}
      </View>
    </View>
  </Pressable>
);

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 2,
    gap: 10,
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  info: { flex: 1, minWidth: 0 },
  employer: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: colors.fg, marginTop: 3, letterSpacing: -0.2, lineHeight: 20 },
  priceBox: {
    backgroundColor: colors.primarySoft,
    padding: 10,
    borderRadius: 14,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priceAmount: { fontSize: 17, fontWeight: '700', color: colors.primaryDeep, letterSpacing: -0.5, lineHeight: 20 },
  priceCurrency: { fontSize: 11 },
  priceLabel: { fontSize: 9, color: colors.primary, fontWeight: '700', letterSpacing: 0.3, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaItem: { fontSize: 11.5, color: colors.muted },
  metaDate: { marginLeft: 'auto', fontSize: 11.5, fontWeight: '600', color: colors.primary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, opacity: 0.4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border2,
    borderStyle: 'dashed',
  },
  tags: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: { fontSize: 10.5, fontWeight: '600', color: colors.primaryDeep },
});
