import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert, FlatList, Modal, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { jobsApi } from '@/api/jobsApi';
import { extractError } from '@/api/http';
import { DateTimeField } from '@/components/DateTimeField';
import { JobCard } from '@/components/JobCard';
import { colors } from '@/theme/colors';
import type { JobAdvertisement } from '@/types/models';

export default function JobFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [allJobs, setAllJobs] = useState<JobAdvertisement[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Filter modal visibility
  const [filterOpen, setFilterOpen] = useState(false);

  // Pending (unsaved) filter state inside modal
  const [pendingDistricts, setPendingDistricts] = useState<string[]>([]);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [pendingFood, setPendingFood] = useState(false);
  const [pendingTransport, setPendingTransport] = useState(false);

  // Applied filters
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterFood, setFilterFood] = useState(false);
  const [filterTransport, setFilterTransport] = useState(false);

  useEffect(() => {
    jobsApi.districts().then(setDistricts).catch(() => {});
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      setAllJobs(await jobsApi.list({}));
    } catch (err) {
      Alert.alert('Hata', extractError(err));
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  useFocusEffect(useCallback(() => { loadJobs(); }, [loadJobs]));

  const filteredJobs = useMemo(() => {
    let result = allJobs;
    if (selectedDistricts.length > 0) {
      result = result.filter((j) => selectedDistricts.includes(j.district));
    }
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      result = result.filter((j) => j.jobDate.startsWith(`${y}-${m}-${d}`));
    }
    if (filterFood) result = result.filter((j) => j.providesFood);
    if (filterTransport) result = result.filter((j) => j.providesTransport);
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.district.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allJobs, selectedDistricts, selectedDate, filterFood, filterTransport, searchText]);

  const activeFilterCount =
    selectedDistricts.length +
    (selectedDate ? 1 : 0) +
    (filterFood ? 1 : 0) +
    (filterTransport ? 1 : 0);

  const openFilter = () => {
    setPendingDistricts(selectedDistricts);
    setPendingDate(selectedDate);
    setPendingFood(filterFood);
    setPendingTransport(filterTransport);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setSelectedDistricts(pendingDistricts);
    setSelectedDate(pendingDate);
    setFilterFood(pendingFood);
    setFilterTransport(pendingTransport);
    setFilterOpen(false);
  };

  const clearPending = () => {
    setPendingDistricts([]);
    setPendingDate(null);
    setPendingFood(false);
    setPendingTransport(false);
  };

  const toggleDistrict = (d: string) => {
    setPendingDistricts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>İstanbul · {timeStr}</Text>
          <Text style={styles.title}>Bugüne uygun işler</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.bellBtn, pressed && { backgroundColor: colors.primarySoft }]}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.fg} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="İlçe, ücret veya kategori…"
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Pressable onPress={openFilter} style={styles.filterPill}>
            <Text style={styles.filterPillText}>FİLTRE</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <View style={styles.activeChipsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsContent}
          >
            {selectedDistricts.map((d) => (
              <Pressable
                key={d}
                onPress={() => setSelectedDistricts((prev) => prev.filter((x) => x !== d))}
                style={styles.activeChip}
              >
                <Text style={styles.activeChipText}>{d} ×</Text>
              </Pressable>
            ))}
            {selectedDate && (
              <Pressable onPress={() => setSelectedDate(null)} style={styles.activeChip}>
                <Text style={styles.activeChipText}>
                  {selectedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} ×
                </Text>
              </Pressable>
            )}
            {filterFood && (
              <Pressable onPress={() => setFilterFood(false)} style={styles.activeChip}>
                <Text style={styles.activeChipText}>Yemekli ×</Text>
              </Pressable>
            )}
            {filterTransport && (
              <Pressable onPress={() => setFilterTransport(false)} style={styles.activeChip}>
                <Text style={styles.activeChipText}>Ulaşımlı ×</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}

      {/* Job list */}
      <FlatList
        style={styles.flatList}
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => router.push(`/job/${item.id}`)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Bu filtrelere uyan ilan bulunamadı.</Text>
        }
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      />

      {/* Filter bottom sheet */}
      <Modal visible={filterOpen} animationType="slide" transparent statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filtreler</Text>
            <Pressable onPress={() => setFilterOpen(false)}>
              <Ionicons name="close" size={22} color={colors.fg} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
            {/* District multi-select */}
            <Text style={styles.sectionLabel}>İLÇE</Text>
            {districts.length > 0 ? (
              <View style={styles.districtGrid}>
                {districts.map((d) => {
                  const active = pendingDistricts.includes(d);
                  return (
                    <Pressable
                      key={d}
                      onPress={() => toggleDistrict(d)}
                      style={[styles.districtChip, active && styles.districtChipActive]}
                    >
                      <Text style={[styles.districtChipText, active && styles.districtChipTextActive]}>
                        {d}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noDistricts}>Bölge listesi yükleniyor…</Text>
            )}

            {/* Date picker */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>TARİH</Text>
            <DateTimeField
              label=""
              mode="date"
              value={pendingDate}
              onChange={setPendingDate}
              placeholder="Tarih seçin"
            />

            {/* Advantages toggles */}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>AVANTAJLAR</Text>
            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => setPendingFood((v) => !v)}
                style={[styles.toggleChip, pendingFood && styles.toggleChipActive]}
              >
                <Text style={[styles.toggleChipText, pendingFood && styles.toggleChipTextActive]}>
                  Yemek verir
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPendingTransport((v) => !v)}
                style={[styles.toggleChip, pendingTransport && styles.toggleChipActive]}
              >
                <Text style={[styles.toggleChipText, pendingTransport && styles.toggleChipTextActive]}>
                  Servis verir
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.sheetActions}>
            <Pressable onPress={clearPending} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Temizle</Text>
            </Pressable>
            <Pressable onPress={applyFilter} style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Uygula</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 10,
  },
  eyebrow: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.4,
    color: colors.primary, textTransform: 'uppercase',
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.7, color: colors.fg, marginTop: 4 },
  bellBtn: { padding: 8, borderRadius: 100, position: 'relative' },
  bellDot: {
    position: 'absolute', top: 6, right: 7,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5, borderColor: colors.bg,
  },
  searchWrap: { paddingHorizontal: 22, paddingBottom: 8 },
  searchBar: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.muted },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterPillText: { fontSize: 11, fontWeight: '700', color: colors.primaryDeep, letterSpacing: 0.3 },
  filterBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  activeChipsWrap: { height: 36, marginBottom: 8 },
  activeChipsContent: { paddingHorizontal: 22, gap: 6, alignItems: 'center' },
  activeChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 100,
  },
  activeChipText: { fontSize: 11.5, fontWeight: '600', color: '#fff' },
  flatList: { flex: 1 },
  list: { paddingHorizontal: 22, paddingBottom: 24 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },

  // Modal / sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(58,46,84,0.32)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 22,
    maxHeight: '82%',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.fg },
  sheetScroll: { flexGrow: 0 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: colors.primaryDeep, textTransform: 'uppercase',
    marginBottom: 10,
  },
  districtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  districtChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  districtChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  districtChipText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  districtChipTextActive: { color: '#fff' },
  noDistricts: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  toggleChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleChipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  toggleChipTextActive: { color: '#fff' },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
