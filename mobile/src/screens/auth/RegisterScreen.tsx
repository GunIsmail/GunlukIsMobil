import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';
import type { UserRole } from '@/types/models';
import { formatTrPhone, isValidTrPhone, toE164 } from '@/utils/phone';

interface Props {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

const ROLE_LABELS: Record<UserRole, string> = {
  Worker: 'Çalışan',
  Employer: 'İşveren',
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
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
      navigation.navigate('OtpVerification');
    } catch (err) {
      Alert.alert('Kayıt başarısız', extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Hesap oluştur</Text>
      <Text style={styles.subtitle}>Rolünüzü seçin ve başlayın.</Text>

      <View style={styles.roleRow}>
        {(['Worker', 'Employer'] as UserRole[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.roleButton, role === option && styles.roleButtonActive]}
            onPress={() => setRole(option)}
          >
            <Text style={[styles.roleText, role === option && styles.roleTextActive]}>
              {ROLE_LABELS[option]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Ad Soyad" value={fullName} onChangeText={setFullName} error={errors.fullName} />
      <Input
        label="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
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
      <Input label="Şifre" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />

      <Button title="Kayıt ol" onPress={handleSubmit} loading={loading} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkRow}>
        <Text style={styles.linkText}>Zaten hesabınız var mı? Giriş yapın</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  roleRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  roleButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  roleText: { color: colors.text, fontWeight: '500' },
  roleTextActive: { color: '#FFF', fontWeight: '600' },
  linkRow: { marginTop: 16, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '500' },
});
