import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
}

export const Button: React.FC<Props> = ({ title, onPress, loading, disabled, variant = 'primary', style }) => {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      bg: colors.primary,
      fg: '#ffffff',
      border: colors.primary,
      shadow: colors.primary,
    },
    secondary: {
      bg: 'transparent',
      fg: colors.primaryDeep,
      border: colors.border2,
      shadow: 'transparent',
    },
    danger: {
      bg: 'transparent',
      fg: colors.danger,
      border: `${colors.danger}55`,
      shadow: 'transparent',
    },
    ghost: {
      bg: colors.primarySoft,
      fg: colors.primaryDeep,
      border: 'transparent',
      shadow: 'transparent',
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          shadowColor: variantStyles.shadow,
          opacity: isDisabled ? 0.6 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: variantStyles.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
});
