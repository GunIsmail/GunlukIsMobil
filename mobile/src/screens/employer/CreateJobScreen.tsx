import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Picker } from '@/components/Picker';
import { Button } from '@/components/Button';
import { DateTimeField } from '@/components/DateTimeField';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';

interface Props {
  navigation: { goBack: () => void };
}

const pad = (n: number) => n.toString().padStart(2, '0');
const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toIsoTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

const composeDateTime = (date: Date, time: Date): Date => {
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
};

export const CreateJobScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState<string | undefined>();
  const [districts, setDistricts] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [jobDate, setJobDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [price, setPrice] = useState('');
  const [providesFood, setProvidesFood] = useState(false);
  const [providesTransport, setProvidesTransport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    jobsApi.districts().then(setDistricts).catch((err) => Alert.alert('Hata', extractError(err)));
  }, []);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = 'Başlık en az 3 karakter olmalıdır.';
    if (description.trim().length < 10) next.description = 'Açıklama en az 10 karakter olmalıdır.';
    if (!district) next.district = 'İlçe seçiniz.';
    if (!address.trim()) next.address = 'Adres zorunludur.';
    if (!jobDate) next.jobDate = 'Tarih seçiniz.';
    if (!startTime) next.startTime = 'Başlangıç saati seçiniz.';
    if (!endTime) next.endTime = 'Bitiş saati seçiniz.';

    if (jobDate && startTime) {
      const startDateTime = composeDateTime(jobDate, startTime);
      if (startDateTime.getTime() <= Date.now()) {
        next.startTime = 'Başlangıç saati gelecekte olmalıdır.';
      }
    }

    if (startTime && endTime) {
      const minutesStart = startTime.getHours() * 60 + startTime.getMinutes();
      const minutesEnd = endTime.getHours() * 60 + endTime.getMinutes();
      if (minutesEnd <= minutesStart) {
        next.endTime = 'Bitiş saati başlangıçtan sonra olmalıdır.';
      }
    }

    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) next.price = 'Pozitif bir tutar giriniz.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await jobsApi.create({
        title: title.trim(),
        description: description.trim(),
        district: district!,
        address: address.trim(),
        jobDate: toIsoDate(jobDate!),
        startTime: toIsoTime(startTime!),
        endTime: toIsoTime(endTime!),
        price: Number(price),
        providesFood,
        providesTransport,
      });
      Alert.alert('Yayınlandı', 'İlan oluşturuldu.', [{ text: 'Tamam', onPress: navigation.goBack }]);
    } catch (err) {
      Alert.alert('Başarısız', extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>İlan oluştur</Text>
      <Input label="Başlık" value={title} onChangeText={setTitle} error={errors.title} />
      <Input
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
      />
      <Picker label="İlçe" options={districts} value={district} onChange={setDistrict} placeholder="İlçe seçin" />
      {errors.district ? <Text style={styles.errorBelow}>{errors.district}</Text> : null}
      <Input label="Adres" value={address} onChangeText={setAddress} error={errors.address} />

      <DateTimeField
        label="Tarih"
        mode="date"
        value={jobDate}
        onChange={setJobDate}
        minimumDate={new Date()}
        error={errors.jobDate}
        placeholder="Tarih seçin"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <DateTimeField
            label="Başlangıç saati"
            mode="time"
            value={startTime}
            onChange={setStartTime}
            error={errors.startTime}
            placeholder="Saat seçin"
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <DateTimeField
            label="Bitiş saati"
            mode="time"
            value={endTime}
            onChange={setEndTime}
            error={errors.endTime}
            placeholder="Saat seçin"
          />
        </View>
      </View>

      <Input label="Ücret (₺)" value={price} onChangeText={setPrice} keyboardType="numeric" error={errors.price} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Yemek dahil</Text>
        <Switch value={providesFood} onValueChange={setProvidesFood} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Ulaşım dahil</Text>
        <Switch value={providesTransport} onValueChange={setProvidesTransport} />
      </View>

      <Button title="Yayınla" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  row: { flexDirection: 'row' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchLabel: { fontSize: 15, color: colors.text },
  errorBelow: { color: colors.danger, marginTop: -8, marginBottom: 8, fontSize: 12 },
});
