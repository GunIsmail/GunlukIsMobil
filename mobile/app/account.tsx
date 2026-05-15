import React, { useEffect, useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/api/authApi';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { colors } from '@/theme/colors';
import { formatTrPhone, isValidTrPhone, toE164 } from '@/utils/phone';

export default function AccountScreen() {
  const router = useRouter();
  const patchProfile = useAuthStore((s) => s.patchProfile);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+90 ');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    authApi.getProfile().then((p) => {
      setFullName(p.fullName);
      setEmail(p.email);
      // Convert E.164 → display format
      const digits = p.phoneNumber.replace(/\D/g, '');
      const local = digits.startsWith('90') ? digits.slice(2) : digits;
      const parts: string[] = [];
      if (local.length > 0) parts.push(local.slice(0, 3));
      if (local.length > 3) parts.push(local.slice(3, 6));
      if (local.length > 6) parts.push(local.slice(6, 8));
      if (local.length > 8) parts.push(local.slice(8, 10));
      setPhone(parts.length === 0 ? '+90 ' : `+90 ${parts.join(' ')}`);
    }).catch((err) => {
      Alert.alert('Hata', extractError(err));
    }).finally(() => setLoading(false));
  }, []);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 3) next.fullName = 'Ad Soyad en az 3 karakter olmalıdır.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Geçerli bir e-posta giriniz.';
    if (!isValidTrPhone(phone)) next.phone = 'Geçerli bir TR cep numarası giriniz.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: toE164(phone),
      });
      await patchProfile(updated);
      Alert.alert('Kaydedildi', 'Hesap bilgileriniz güncellendi.', [
        { text: 'Tamam', onPress: router.back },
      ]);
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    } finally {
      setSaving(false);
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
        <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor…</Text>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>KİŞİSEL BİLGİLER</Text>
              <Input
                label="Ad Soyad"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Adınız Soyadınız"
                error={errors.fullName}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>İLETİŞİM BİLGİLERİ</Text>
              <Input
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="ornek@eposta.com"
                error={errors.email}
              />
              <Input
                label="Telefon numarası"
                value={phone}
                onChangeText={(v) => setPhone(formatTrPhone(v))}
                keyboardType="phone-pad"
                placeholder="+90 555 555 55 55"
                maxLength={17}
                error={errors.phone}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
              <Text style={styles.infoText}>
                E-posta veya telefon numaranızı değiştirmeniz durumunda yeniden doğrulama gerekebilir.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {!loading && (
        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              saving && { opacity: 0.7 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
            </Text>
          </Pressable>
        </View>
      )}
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
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 15, fontWeight: '700', color: colors.fg,
  },
  scroll: { padding: 22, gap: 16, paddingBottom: 8 },
  loadingText: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: colors.primaryDeep, textTransform: 'uppercase',
    marginBottom: 14,
  },
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
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 12,
  },
  infoText: {
    flex: 1, fontSize: 12, color: colors.muted, lineHeight: 18,
  },
  footer: {
    padding: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  saveBtn: {
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
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
