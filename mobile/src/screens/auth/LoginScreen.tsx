import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';

interface Props {
  navigation: { navigate: (screen: string) => void };
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
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
    <Screen>
      <Text style={styles.title}>Tekrar hoş geldiniz</Text>
      <Text style={styles.subtitle}>Devam etmek için giriş yapın.</Text>

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

      <Button title="Giriş yap" onPress={handleSubmit} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
        <Text style={styles.linkText}>Hesabınız yok mu? Kayıt olun</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  linkRow: { marginTop: 16, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '500' },
});
