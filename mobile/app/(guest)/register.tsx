import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { UserRole } from '@/types/models';
import { formatTrPhone, isValidTrPhone, toE164 } from '@/utils/phone';

const ROLE_LABELS: Record<UserRole, string> = {
  Worker: 'Çalışan',
  Employer: 'İşveren',
};

export default function RegisterScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+90 ');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Worker');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 3) next.fullName = 'Ad Soyad en az 3 karakter olmalıdır.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Geçerli bir e-posta giriniz.';
    if (!isValidTrPhone(phone)) next.phone = 'Geçerli bir TR cep numarası giriniz (5 ile başlamalı).';
    if (password.length < 8) next.password = 'Şifre en az 8 karakter olmalıdır.';
    else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))
      next.password = 'Şifre büyük harf, küçük harf ve rakam içermelidir.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const auth = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: toE164(phone),
        password,
        role,
      });
      await signIn(auth);
      router.push('/otp');
    } catch (err) {
      Alert.alert('Kayıt başarısız', extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Giriş yap</Text>
          </Pressable>
        </View>

        <View style={styles.headingWrap}>
          <Text style={styles.heading}>Hesap oluştur</Text>
          <Text style={styles.subheading}>Rolünüzü seçin ve başlayın.</Text>
        </View>

        {/* Role selector */}
        <View style={styles.roleRow}>
          {(['Worker', 'Employer'] as UserRole[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => setRole(option)}
              style={[styles.roleBtn, role === option && styles.roleBtnActive]}
            >
              <Text style={[styles.roleBtnText, role === option && styles.roleBtnTextActive]}>
                {ROLE_LABELS[option]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <Input label="Ad Soyad" value={fullName} onChangeText={setFullName} error={errors.fullName} placeholder="Adınız Soyadınız" />
          <Input
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
            placeholder="ornek@eposta.com"
          />
          <Input
            label="Telefon numarası"
            value={phone}
            onChangeText={(v) => setPhone(formatTrPhone(v))}
            keyboardType="phone-pad"
            error={errors.phone}
            placeholder="+90 555 555 55 55"
            maxLength={17}
          />
          <Input
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            placeholder="••••••••"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.submitBtn, (pressed || loading) && { opacity: 0.8 }]}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Kayıt yapılıyor…' : 'Kayıt ol'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 32 },
  topBar: { paddingTop: 16, paddingBottom: 8 },
  backLink: { alignSelf: 'flex-start' },
  backLinkText: { fontSize: 13.5, color: colors.primary, fontWeight: '600' },
  headingWrap: { paddingTop: 8, paddingBottom: 20 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.fg, letterSpacing: -0.5 },
  subheading: { fontSize: 13.5, color: colors.muted, marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.card, alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2,
  },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: colors.fg },
  roleBtnTextActive: { color: '#fff' },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 1,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 3,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
