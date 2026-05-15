import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

interface Props {
  scrollable?: boolean;
  padded?: boolean;
}

export const Screen: React.FC<PropsWithChildren<Props>> = ({
  children,
  scrollable = true,
  padded = true,
}) => (
  <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    {scrollable ? (
      <ScrollView
        contentContainerStyle={[styles.content, padded && styles.padded]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.flex, padded && styles.padded]}>{children}</View>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  padded: { padding: 22 },
});
