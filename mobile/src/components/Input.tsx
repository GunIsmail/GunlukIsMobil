import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '@/theme/colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<TextInput, Props>(
  ({ label, error, style, ...rest }, ref) => (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.errorBorder : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
);
Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDeep,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.fg,
  },
  errorBorder: { borderColor: colors.danger },
  errorText: { color: colors.danger, marginTop: 4, fontSize: 11 },
});
