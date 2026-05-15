import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors } from '@/theme/colors';

type Mode = 'date' | 'time';

interface Props {
  label: string;
  mode: Mode;
  value: Date | null;
  onChange: (value: Date) => void;
  minimumDate?: Date;
  error?: string;
  placeholder?: string;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatTime = (d: Date) =>
  d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

export const DateTimeField: React.FC<Props> = ({
  label,
  mode,
  value,
  onChange,
  minimumDate,
  error,
  placeholder,
}) => {
  const [iosOpen, setIosOpen] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode,
        is24Hour: true,
        minimumDate,
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onChange(selected);
        },
      });
    } else {
      setIosOpen(true);
    }
  };

  const display = value ? (mode === 'date' ? formatDate(value) : formatTime(value)) : (placeholder ?? 'Seçin');

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={open} style={[styles.field, error ? styles.errorBorder : null]}>
        <Text style={value ? styles.value : styles.placeholder}>{display}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {Platform.OS === 'ios' && iosOpen ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display="spinner"
          minimumDate={minimumDate}
          onChange={(_, selected) => {
            setIosOpen(false);
            if (selected) onChange(selected);
          }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '500' },
  field: {
    backgroundColor: '#F9FAFB',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  value: { color: colors.text, fontSize: 16 },
  placeholder: { color: colors.textMuted, fontSize: 16 },
  errorBorder: { borderColor: colors.danger },
  errorText: { color: colors.danger, marginTop: 4, fontSize: 12 },
});
