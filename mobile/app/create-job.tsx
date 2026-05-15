import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Switch,
  Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/Input';
import { Picker } from '@/components/Picker';
import { DateTimeField } from '@/components/DateTimeField';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

const pad = (n: number) => n.toString().padStart(2, '0');
const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toIsoTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
const composeDateTime = (date: Date, time: Date): Date => {
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
};

const STEPS = ['Detaylar', 'Zaman & ücret', 'Avantajlar'];

export default function CreateJobScreen() {
  const params = useLocalSearchParams<{ job?: string }>();
  const router = useRouter();
  const editJob: JobAdvertisement | undefined = params.job ? JSON.parse(params.job) : undefined;
  const isEditing = !!editJob;

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(editJob?.title ?? '');
  const [description, setDescription] = useState(editJob?.description ?? '');
  const [district, setDistrict] = useState<string | undefined>(editJob?.district);
  const [districts, setDistricts] = useState<string[]>([]);
  const [address, setAddress] = useState(editJob?.address ?? '');
  const [jobDate, setJobDate] = useState<Date | null>(editJob ? new Date(editJob.jobDate) : null);
  const [startTime, setStartTime] = useState<Date | null>(() => {
    if (!editJob) return null;
    const d = new Date();
    const [h, m] = editJob.startTime.split(':');
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState<Date | null>(() => {
    if (!editJob) return null;
    const d = new Date();
    const [h, m] = editJob.endTime.split(':');
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  });
  const [price, setPrice] = useState(editJob?.price.toString() ?? '');
  const [quota, setQuota] = useState(editJob?.quota?.toString() ?? '');
  const [providesFood, setProvidesFood] = useState(editJob?.providesFood ?? false);
  const [providesTransport, setProvidesTransport] = useState(editJob?.providesTransport ?? false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const descriptionRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const quotaRef = useRef<TextInput>(null);

  useEffect(() => {
    jobsApi.districts().then(setDistricts).catch((err) => Alert.alert('Hata', extractError(err)));
  }, []);

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (title.trim().length < 3) next.title = 'Başlık en az 3 karakter olmalıdır.';
      if (description.trim().length < 10) next.description = 'Açıklama en az 10 karakter olmalıdır.';
      if (!district) next.district = 'İlçe seçiniz.';
      if (!address.trim()) next.address = 'Adres zorunludur.';
    } else if (step === 1) {
      if (!jobDate) next.jobDate = 'Tarih seçiniz.';
      if (!startTime) next.startTime = 'Başlangıç saati seçiniz.';
      if (!endTime) next.endTime = 'Bitiş saati seçiniz.';
      if (jobDate && startTime) {
        const startDateTime = composeDateTime(jobDate, startTime);
        if (startDateTime.getTime() <= Date.now()) next.startTime = 'Başlangıç saati gelecekte olmalıdır.';
      }
      if (startTime && endTime) {
        const msStart = startTime.getHours() * 60 + startTime.getMinutes();
        const msEnd = endTime.getHours() * 60 + endTime.getMinutes();
        if (msEnd <= msStart) next.endTime = 'Bitiş saati başlangıçtan sonra olmalıdır.';
      }
      const priceNum = Number(price);
      if (!price || Number.isNaN(priceNum) || priceNum <= 0) next.price = 'Pozitif bir tutar giriniz.';
      const quotaNum = Number(quota);
      if (!quota || Number.isNaN(quotaNum) || quotaNum <= 0) next.quota = 'Kontenjan en az 1 olmalıdır.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: title.trim(), description: description.trim(),
        district: district!, address: address.trim(),
        jobDate: toIsoDate(jobDate!), startTime: toIsoTime(startTime!), endTime: toIsoTime(endTime!),
        price: Number(price), quota: Number(quota),
        providesFood, providesTransport,
      };
      if (isEditing) {
        await jobsApi.update(editJob.id, payload);
        Alert.alert('Güncellendi', 'İlan başarıyla güncellendi.', [{ text: 'Tamam', onPress: router.back }]);
      } else {
        await jobsApi.create(payload);
        Alert.alert('Yayınlandı', 'İlan oluşturuldu.', [{ text: 'Tamam', onPress: router.back }]);
      }
    } catch (err) {
      Alert.alert('Başarısız', extractError(err));
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>{isEditing ? 'İlanı düzenle' : 'Yeni ilan'}</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepsWrap}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, gap: 6 }}>
            <View style={[styles.stepBar, i <= step && styles.stepBarActive]} />
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View style={styles.stepContent}>
            <Input
              label="İlan başlığı"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
              placeholder="Örn: Garson — Akşam vardiyası"
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              blurOnSubmit={false}
            />
            <Input
              label="Açıklama"
              value={description}
              onChangeText={setDescription}
              error={errors.description}
              multiline
              ref={descriptionRef}
              placeholder="Pozisyon hakkında kısa bilgi..."
              blurOnSubmit={false}
            />
            <Picker label="İlçe" options={districts} value={district} onChange={setDistrict} placeholder="İlçe seçin" />
            {errors.district ? <Text style={styles.errorText}>{errors.district}</Text> : null}
            <Input
              label="Adres"
              value={address}
              onChangeText={setAddress}
              error={errors.address}
              placeholder="Tam adres..."
            />
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <DateTimeField
              label="Tarih"
              mode="date"
              value={jobDate}
              onChange={setJobDate}
              minimumDate={new Date()}
              error={errors.jobDate}
              placeholder="Tarih seçin"
            />
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <DateTimeField
                  label="Başlangıç saati"
                  mode="time"
                  value={startTime}
                  onChange={setStartTime}
                  error={errors.startTime}
                  placeholder="Saat seçin"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <DateTimeField
                  label="Bitiş saati"
                  mode="time"
                  value={endTime}
                  onChange={setEndTime}
                  error={errors.endTime}
                  placeholder="Saat seçin"
                />
              </View>
            </View>
            <Input
              label="Ücret (₺)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              error={errors.price}
              ref={priceRef}
              placeholder="1150"
              returnKeyType="next"
              onSubmitEditing={() => quotaRef.current?.focus()}
            />
            <Input
              label="Kontenjan (kişi sayısı)"
              value={quota}
              onChangeText={setQuota}
              keyboardType="numeric"
              error={errors.quota}
              ref={quotaRef}
              placeholder="1"
              returnKeyType="done"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>İlanınıza dahil olan yan haklar. Daha çok başvuru çeker.</Text>

            {([
              ['providesFood', 'Yemek', 'Vardiya içinde 1 öğün', providesFood, setProvidesFood],
              ['providesTransport', 'Ulaşım', 'Servis veya yol parası', providesTransport, setProvidesTransport],
            ] as const).map(([key, label, sub, value, setter]) => (
              <View key={key} style={[styles.toggleRow, value && styles.toggleRowActive]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>{label}</Text>
                  <Text style={styles.toggleSub}>{sub}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={setter}
                  trackColor={{ false: colors.primarySoft, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <View style={styles.ctaRow}>
          {step > 0 && (
            <Pressable
              onPress={() => setStep((s) => s - 1)}
              style={({ pressed }) => [styles.backNavBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.backNavBtnText}>← Geri</Text>
            </Pressable>
          )}
          <Pressable
            onPress={step < 2 ? handleNext : handleSubmit}
            disabled={loading}
            style={({ pressed }) => [styles.nextBtn, (pressed || loading) && { opacity: 0.8 }]}
          >
            <Text style={styles.nextBtnText}>
              {step < 2 ? 'Devam →' : (isEditing ? 'Güncelle' : '✓ İlanı yayınla')}
            </Text>
          </Pressable>
        </View>
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
  stepsWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  stepBar: { height: 4, borderRadius: 2, backgroundColor: colors.primarySoft },
  stepBarActive: { backgroundColor: colors.primary },
  stepLabel: { fontSize: 10.5, fontWeight: '600', color: colors.muted, letterSpacing: 0.3 },
  stepLabelActive: { color: colors.primaryDeep },
  scroll: { paddingBottom: 24 },
  stepContent: { paddingHorizontal: 22, gap: 0 },
  stepDesc: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 14 },
  timeRow: { flexDirection: 'row' },
  errorText: { color: colors.danger, fontSize: 11, marginTop: -10, marginBottom: 8 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  toggleRowActive: { borderColor: colors.primary },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: colors.fg },
  toggleSub: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  cta: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaRow: { flexDirection: 'row', gap: 8 },
  backNavBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
  },
  backNavBtnText: { fontSize: 14, fontWeight: '600', color: colors.fg },
  nextBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 3,
  },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
