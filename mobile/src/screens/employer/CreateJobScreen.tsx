import React, { useEffect, useState, useRef } from 'react';
import { Alert, StyleSheet, Switch, Text, View, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Picker } from '@/components/Picker';
import { Button } from '@/components/Button';
import { DateTimeField } from '@/components/DateTimeField';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { colors } from '@/theme/colors';

import type { JobAdvertisement } from '@/types/models';

interface Props {
  route: { params?: { job?: JobAdvertisement } };
  navigation: { goBack: () => void; setOptions: (options: object) => void };
}

const pad = (n: number) => n.toString().padStart(2, '0');
const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toIsoTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

const composeDateTime = (date: Date, time: Date): Date => {
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
};

export const CreateJobScreen: React.FC<Props> = ({ route, navigation }) => {
  const editJob = route.params?.job;
  const isEditing = !!editJob;

  const [title, setTitle] = useState(editJob?.title ?? '');
  const [description, setDescription] = useState(editJob?.description ?? '');
  const [district, setDistrict] = useState<string | undefined>(editJob?.district);
  const [districts, setDistricts] = useState<string[]>([]);
  const [address, setAddress] = useState(editJob?.address ?? '');
  const [jobDate, setJobDate] = useState<Date | null>(editJob ? new Date(editJob.jobDate) : null);
  
  const [startTime, setStartTime] = useState<Date | null>(() => {
    if (!editJob) return null;
    const d = new Date();
    const [h, m] = editJob.startTime.split(':');
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  });
  
  const [endTime, setEndTime] = useState<Date | null>(() => {
    if (!editJob) return null;
    const d = new Date();
    const [h, m] = editJob.endTime.split(':');
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  });

  const [price, setPrice] = useState(editJob?.price.toString() ?? '');
  const [quota, setQuota] = useState(editJob?.quota?.toString() ?? '');
  const [providesFood, setProvidesFood] = useState(editJob?.providesFood ?? false);
  const [providesTransport, setProvidesTransport] = useState(editJob?.providesTransport ?? false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const descriptionRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const quotaRef = useRef<TextInput>(null);

  useEffect(() => {
    jobsApi.districts().then(setDistricts).catch((err) => Alert.alert('Hata', extractError(err)));
  }, []);

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: 'İlanı Düzenle' });
    }
  }, [isEditing, navigation]);

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

    const quotaNum = Number(quota);
    if (!quota || Number.isNaN(quotaNum) || quotaNum <= 0) next.quota = 'Kontenjan en az 1 olmalıdır.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        district: district!,
        address: address.trim(),
        jobDate: toIsoDate(jobDate!),
        startTime: toIsoTime(startTime!),
        endTime: toIsoTime(endTime!),
        price: Number(price),
        quota: Number(quota),
        providesFood,
        providesTransport,
      };

      if (isEditing) {
        await jobsApi.update(editJob.id, payload);
        Alert.alert('Güncellendi', 'İlan başarıyla güncellendi.', [{ text: 'Tamam', onPress: navigation.goBack }]);
      } else {
        await jobsApi.create(payload);
        Alert.alert('Yayınlandı', 'İlan oluşturuldu.', [{ text: 'Tamam', onPress: navigation.goBack }]);
      }
    } catch (err) {
      Alert.alert('Başarısız', extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Input 
        label="Başlık" 
        value={title} 
        onChangeText={setTitle} 
        error={errors.title} 
        returnKeyType="next"
        onSubmitEditing={() => descriptionRef.current?.focus()}
        blurOnSubmit={false}
      />
      <Input
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
        ref={descriptionRef}
        blurOnSubmit={false}
      />
      <Picker label="İlçe" options={districts} value={district} onChange={setDistrict} placeholder="İlçe seçin" />
      {errors.district ? <Text style={styles.errorBelow}>{errors.district}</Text> : null}
      <Input 
        label="Adres" 
        value={address} 
        onChangeText={setAddress} 
        error={errors.address} 
        ref={addressRef}
        returnKeyType="next"
        onSubmitEditing={() => priceRef.current?.focus()}
        blurOnSubmit={false}
      />

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

      <Input 
        label="Ücret (₺)" 
        value={price} 
        onChangeText={setPrice} 
        keyboardType="numeric" 
        error={errors.price} 
        ref={priceRef}
        returnKeyType="next"
        onSubmitEditing={() => quotaRef.current?.focus()}
      />

      <Input 
        label="Kontenjan (Kişi Sayısı)" 
        value={quota} 
        onChangeText={setQuota} 
        keyboardType="numeric" 
        error={errors.quota} 
        ref={quotaRef}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Yemek dahil</Text>
        <Switch value={providesFood} onValueChange={setProvidesFood} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Ulaşım dahil</Text>
        <Switch value={providesTransport} onValueChange={setProvidesTransport} />
      </View>

      <Button title={isEditing ? "Güncelle" : "Yayınla"} onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
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
