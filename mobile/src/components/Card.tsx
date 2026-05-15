import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<PropsWithChildren<Props>> = ({ children, onPress, style }) => {
  const content = (pressed = false) => (
    <View style={[styles.card, pressed && styles.pressed, style]}>{children}</View>
  );

  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  ) : (
    content()
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
});
