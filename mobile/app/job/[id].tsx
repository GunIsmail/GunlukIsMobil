import React, { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { jobsApi } from '@/api/jobsApi';
import { applicationsApi } from '@/api/applicationsApi';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
const formatTime = (ts: string) => ts.substring(0, 5);

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [job, setJob] = useState<JobAdvertisement | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const data = await jobsApi.getById(id!);
          if (active) setJob(data);
        } catch (err) {
          if (active) Alert.alert('Hata', extractError(err));
        }
      })();
      return () => { active = false; };
    }, [id])
  );

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Giriş gerekli', 'Başvuru için Çalışan olarak giriş yapın.', [
        { text: 'Tamam', onPress: () => router.push('/login') },
      ]);
      return;
    }
    if (user.role !== 'Worker') {
      Alert.alert('Yalnızca çalışanlar', 'Yalnızca çalışan hesapları ilanlara başvurabilir.');
      return;
    }
    setSubmitting(true);
    try {
      await applicationsApi.apply(id!, message.trim() || undefined);
      Alert.alert('Gönderildi', 'Başvurunuz iletildi.', [{ text: 'Tamam', onPress: router.back }]);
    } catch (err) {
      Alert.alert('Başvuru başarısız', extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const facts = [
    { icon: 'location-outline', label: 'Konum', value: job.district },
    { icon: 'time-outline', label: 'Saat', value: `${formatTime(job.startTime)}–${formatTime(job.endTime)}` },
    { icon: 'calendar-outline', label: 'Tarih', value: formatDate(job.jobDate) },
    { icon: 'people-outline', label: 'Adres', value: job.address },
  ] as const;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={router.back}
          style={({ pressed }) => [styles.backBtn, pressed && { backgroundColor: colors.primarySoft }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>İlan detayı</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.hero}>
          <View style={styles.heroDecor} />
          <Text style={styles.heroEmployer}>{job.employerName.toUpperCase()}</Text>
          <Text style={styles.heroTitle}>{job.title}</Text>
          <View style={styles.heroPricePill}>
            <Text style={styles.heroPriceAmount}>{job.price.toLocaleString('tr-TR')}₺</Text>
            <Text style={styles.heroPriceSub}> / vardiya</Text>
          </View>
        </View>

        {/* Quick facts grid */}
        <View style={styles.factsGrid}>
          {facts.map((f) => (
            <View key={f.label} style={styles.factCard}>
              <View style={styles.factHeader}>
                <Ionicons name={f.icon as any} size={13} color={colors.primary} />
                <Text style={styles.factLabel}>{f.label.toUpperCase()}</Text>
              </View>
              <Text style={styles.factValue} numberOfLines={2}>{f.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AÇIKLAMA</Text>
          <Text style={styles.sectionBody}>{job.description}</Text>
        </View>

        {/* Advantages */}
        {(job.providesFood || job.providesTransport) ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AVANTAJLAR</Text>
            <View style={{ gap: 8 }}>
              {job.providesFood ? (
                <View style={styles.advantageRow}>
                  <View style={styles.advantageIcon}>
                    <Ionicons name="checkmark" size={16} color={colors.primaryDeep} />
                  </View>
                  <View>
                    <Text style={styles.advantageTitle}>Yemek dahil</Text>
                    <Text style={styles.advantageSub}>Vardiya içinde 1 öğün</Text>
                  </View>
                </View>
              ) : null}
              {job.providesTransport ? (
                <View style={styles.advantageRow}>
                  <View style={styles.advantageIcon}>
                    <Ionicons name="checkmark" size={16} color={colors.primaryDeep} />
                  </View>
                  <View>
                    <Text style={styles.advantageTitle}>Ulaşım dahil</Text>
                    <Text style={styles.advantageSub}>Servis aracı sağlanır</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Employer mini card */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>İŞVEREN</Text>
          <View style={styles.employerCard}>
            <View style={styles.employerAvatar}>
              <Text style={styles.employerInitials}>{initials(job.employerName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.employerName}>{job.employerName}</Text>
              <Text style={styles.employerSub}>4.8 ★ · İşveren</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </View>
        </View>

        {/* Application note input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BAŞVURU NOTU (OPSİYONEL)</Text>
          <View style={styles.noteInput}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Neden uygun olduğunuzu kısaca yazın..."
              placeholderTextColor={colors.muted}
              style={styles.noteText}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaHint}>Başvurunuz işverene anında iletilir</Text>
        <Pressable
          onPress={handleApply}
          disabled={submitting}
          style={({ pressed }) => [styles.ctaBtn, (pressed || submitting) && { opacity: 0.8 }]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.ctaBtnText}>Hemen başvur →</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.fg },
  scroll: { padding: 22, gap: 18, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.primarySoft,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecor: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}22`,
  },
  heroEmployer: { fontSize: 11, fontWeight: '600', color: colors.primaryDeep, letterSpacing: 0.5 },
  heroTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.6, marginTop: 6, color: colors.fg, lineHeight: 30 },
  heroPricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  heroPriceAmount: { fontSize: 22, fontWeight: '700', color: colors.primaryDeep, letterSpacing: -0.5 },
  heroPriceSub: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  factsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  factCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  factLabel: { fontSize: 10.5, color: colors.muted, fontWeight: '600', letterSpacing: 0.4 },
  factValue: { fontSize: 14, fontWeight: '700', color: colors.fg },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: colors.primaryDeep, letterSpacing: 0.5,
  },
  sectionBody: { fontSize: 13.5, color: colors.fg, lineHeight: 22 },
  advantageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  advantageIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  advantageTitle: { fontSize: 13, fontWeight: '600', color: colors.fg },
  advantageSub: { fontSize: 11, color: colors.muted, marginTop: 1 },
  employerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  employerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  employerInitials: { fontSize: 16, fontWeight: '700', color: colors.primaryDeep },
  employerName: { fontSize: 14, fontWeight: '700', color: colors.fg },
  employerSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  noteInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    minHeight: 80,
  },
  noteText: { fontSize: 14, color: colors.fg, lineHeight: 20 },
  cta: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  ctaHint: { textAlign: 'center', fontSize: 11, color: colors.muted },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
  },
  ctaBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
