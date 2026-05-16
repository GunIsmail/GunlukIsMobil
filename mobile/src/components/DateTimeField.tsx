import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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

export const DateTimeField: React.FC<Props> = ({
  label,
  mode,
  value,
  onChange,
  minimumDate,
  error,
}) => {
  if (Platform.OS === 'android') {
    const openAndroid = () => {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode,
        is24Hour: true,
        minimumDate,
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onChange(selected);
        },
      });
    };

    const formatDate = (d: Date) =>
      d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatTime = (d: Date) =>
      d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const display = value ? (mode === 'date' ? formatDate(value) : formatTime(value)) : 'Seçin';

    return (
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text onPress={openAndroid} style={[styles.field, error ? styles.errorBorder : null]}>
          <Text style={value ? styles.value : styles.placeholder}>{display}</Text>
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  // iOS: display="compact" — native iOS picker, no Modal needed
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.iosFieldWrap, error ? styles.errorBorder : null]}>
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display="compact"
          minimumDate={minimumDate}
          locale="tr-TR"
          style={styles.iosPicker}
          onChange={(_, selected) => {
            if (selected) onChange(selected);
          }}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '500' },
  // Android press target
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
  // iOS compact wrapper
  iosFieldWrap: {
    backgroundColor: '#F9FAFB',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  iosPicker: {
    // compact picker kendi boyutunu belirler
  },
});
