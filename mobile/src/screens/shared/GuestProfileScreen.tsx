import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

interface Props {
  navigation: { navigate: (s: string) => void };
}

export const GuestProfileScreen: React.FC<Props> = ({ navigation }) => (
  <Screen>
    <Text style={styles.title}>Misafir olarak geziyorsunuz</Text>
    <Text style={styles.body}>
      İlanlara başvurmak, başvurularınızı yönetmek veya işveren olarak ilan yayınlamak için giriş yapın ya da
      hesap oluşturun.
    </Text>
    <Button title="Giriş yap" onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }} />
    <Button
      title="Hesap oluştur"
      variant="secondary"
      onPress={() => navigation.navigate('Register')}
      style={{ marginTop: 8 }}
    />
  </Screen>
);

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
});
