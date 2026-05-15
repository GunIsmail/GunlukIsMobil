import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

interface Props {
  scrollable?: boolean;
}

export const Screen: React.FC<PropsWithChildren<Props>> = ({ children, scrollable = true }) => (
  <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    {scrollable ? (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    ) : (
      <View style={styles.content}>{children}</View>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, flexGrow: 1 },
});
