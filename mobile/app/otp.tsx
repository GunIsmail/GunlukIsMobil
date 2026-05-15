import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert('Geçersiz kod', 'Lütfen backend terminalinde görünen 6 haneli kodu giriniz.');
      return;
    }
    Alert.alert('Doğrulandı', 'Doğrulama başarılı (terminal simülasyonu).', [
      { text: 'Tamam', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>Hesabınızı doğrulayın</Text>
      <Text style={styles.subtitle}>
        E-posta ve SMS ile 6 haneli bir kod gönderildi. Bu sürümde kod backend terminaline yazdırılır
        (Console.WriteLine).
      </Text>
      <Input
        label="Doğrulama kodu"
        value={code}
        onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        placeholder="123456"
      />
      <Button title="Doğrula" onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
});
