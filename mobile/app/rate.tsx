import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ratingsApi } from '@/api/ratingsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';

type RateType = 'worker' | 'employer';

const WORKER_METRICS = [
  { key: 'communication', label: 'İletişim & Sosyal Beceriler' },
  { key: 'serviceSpeed', label: 'Servis Hızı & Operasyonel Verimlilik' },
  { key: 'teamwork', label: 'Takım Çalışması' },
] as const;

const EMPLOYER_METRICS = [
  { key: 'workingConditions', label: 'Çalışma Şartları & Fiziksel Koşullar' },
  { key: 'paymentReliability', label: 'Ödeme Güvenilirliği' },
  { key: 'managementStyle', label: 'Yönetim Tarzı & Saygı' },
] as const;

type WorkerKey = typeof WORKER_METRICS[number]['key'];
type EmployerKey = typeof EMPLOYER_METRICS[number]['key'];

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starRow}>
      <Text style={styles.starLabel}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            <Ionicons
              name={n <= value ? 'star' : 'star-outline'}
              size={30}
              color={n <= value ? '#f5c518' : colors.border}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function RateScreen() {
  const { type, applicationId, targetName } = useLocalSearchParams<{
    type: RateType;
    applicationId: string;
    targetName: string;
  }>();
  const router = useRouter();
  const isWorker = type === 'worker';

  const [scores, setScores] = useState<Record<string, number>>({
    communication: 0,
    serviceSpeed: 0,
    teamwork: 0,
    workingConditions: 0,
    paymentReliability: 0,
    managementStyle: 0,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const metrics = isWorker ? WORKER_METRICS : EMPLOYER_METRICS;
  const allFilled = metrics.every((m) => scores[m.key] > 0);

  const handleSubmit = async () => {
    if (!allFilled) {
      Alert.alert('Eksik değerlendirme', 'Lütfen tüm kategorileri yıldızlayın.');
      return;
    }
    setSubmitting(true);
    try {
      if (isWorker) {
        await ratingsApi.rateWorker({
          applicationId: applicationId!,
          communication: scores.communication,
          serviceSpeed: scores.serviceSpeed,
          teamwork: scores.teamwork,
          comment: comment.trim() || undefined,
        });
      } else {
        await ratingsApi.rateEmployer({
          applicationId: applicationId!,
          workingConditions: scores.workingConditions,
          paymentReliability: scores.paymentReliability,
          managementStyle: scores.managementStyle,
          comment: comment.trim() || undefined,
        });
      }
      Alert.alert('Teşekkürler!', 'Değerlendirmeniz kaydedildi.', [
        { text: 'Tamam', onPress: router.back },
      ]);
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Değerlendir</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>
              {(targetName ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroName}>{targetName}</Text>
          <Text style={styles.heroSub}>
            {isWorker ? 'Çalışan değerlendirmesi' : 'İşveren değerlendirmesi'}
          </Text>
        </View>

        {/* Star ratings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kategoriler</Text>
          {metrics.map((m) => (
            <StarRow
              key={m.key}
              label={m.label}
              value={scores[m.key]}
              onChange={(v) => setScores((prev) => ({ ...prev, [m.key]: v }))}
            />
          ))}
        </View>

        {/* Comment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yorum (isteğe bağlı)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Deneyiminizi paylaşın…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            style={styles.commentInput}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSubmit}
          disabled={submitting || !allFilled}
          style={({ pressed }) => [
            styles.submitBtn,
            (!allFilled || submitting) && styles.submitBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'Gönderiliyor…' : 'Değerlendirmeyi gönder'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
  scroll: { padding: 22, gap: 16, paddingBottom: 8 },
  hero: { alignItems: 'center', paddingVertical: 10, gap: 8 },
  heroAvatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  heroAvatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroName: { fontSize: 18, fontWeight: '700', color: colors.fg },
  heroSub: { fontSize: 12, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 1,
    gap: 14,
  },
  cardTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: colors.primaryDeep, textTransform: 'uppercase',
  },
  starRow: { gap: 6 },
  starLabel: { fontSize: 13.5, fontWeight: '600', color: colors.fg },
  stars: { flexDirection: 'row', gap: 6 },
  commentInput: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    color: colors.fg,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: colors.muted, textAlign: 'right', marginTop: -6 },
  footer: {
    padding: 22,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
