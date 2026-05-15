import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'E-posta zorunludur.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Geçerli bir e-posta giriniz.';
    if (!password) next.password = 'Şifre zorunludur.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const auth = await authApi.login(email.trim().toLowerCase(), password);
      await signIn(auth);
    } catch (err) {
      Alert.alert('Giriş başarısız', extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Brand mark */}
        <View style={styles.brandWrap}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandLetter}>G</Text>
          </View>
          <Text style={styles.brandName}>günlükiş</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.heading}>Tekrar hoş geldiniz</Text>
          <Text style={styles.subheading}>Devam etmek için giriş yapın.</Text>

          <View style={styles.fields}>
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
            <Text style={styles.submitBtnText}>{loading ? 'Giriş yapılıyor…' : 'Giriş yap'}</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/register')} style={styles.linkRow}>
            <Text style={styles.linkText}>Hesabınız yok mu? </Text>
            <Text style={styles.linkHighlight}>Kayıt olun</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 32 },
  brandWrap: { alignItems: 'center', paddingTop: 60, paddingBottom: 36, gap: 12 },
  brandBadge: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4,
  },
  brandLetter: { fontSize: 36, fontWeight: '700', color: '#fff' },
  brandName: {
    fontSize: 22, fontWeight: '700', color: colors.fg, letterSpacing: -0.5,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  heading: { fontSize: 22, fontWeight: '700', color: colors.fg, letterSpacing: -0.3 },
  subheading: { fontSize: 13.5, color: colors.muted, marginTop: 4, marginBottom: 20 },
  fields: { gap: 0 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 3,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkText: { fontSize: 13.5, color: colors.muted },
  linkHighlight: { fontSize: 13.5, color: colors.primary, fontWeight: '700' },
});
