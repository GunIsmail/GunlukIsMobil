import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { UserRole } from '@/types/models';

const ROLE_LABELS: Record<UserRole, string> = {
  Worker: 'Çalışan',
  Employer: 'İşveren',
};

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user) {
    return (
      <Screen>
        <Text style={styles.empty}>Misafir olarak geziniyorsunuz.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Profil</Text>
      <Card>
        <Field label="Ad Soyad" value={user.fullName} />
        <Field label="E-posta" value={user.email} />
        <Field label="Rol" value={ROLE_LABELS[user.role]} />
      </Card>
      <Button title="Çıkış yap" variant="danger" onPress={signOut} />
    </Screen>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  fieldValue: { color: colors.text, fontSize: 16, fontWeight: '500' },
  empty: { color: colors.textMuted },
});
