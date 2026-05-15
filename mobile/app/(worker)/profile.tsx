import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { ratingsApi } from '@/api/ratingsApi';
import { jobsApi } from '@/api/jobsApi';
import { applicationsApi } from '@/api/applicationsApi';
import { colors } from '@/theme/colors';
import type { EmployerRatingSummary, UserRole, WorkerRatingSummary } from '@/types/models';

const ROLE_LABELS: Record<UserRole, string> = {
  Worker: 'ÇALIŞAN',
  Employer: 'İŞVEREN',
};

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

function StarDisplay({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= filled ? 'star' : 'star-outline'}
          size={13}
          color={n <= filled ? '#f5c518' : 'rgba(255,255,255,0.5)'}
        />
      ))}
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <View style={metricStyles.row}>
      <Text style={metricStyles.label} numberOfLines={1}>{label}</Text>
      <View style={metricStyles.barBg}>
        <View style={[metricStyles.barFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={metricStyles.value}>{value > 0 ? value.toFixed(1) : '—'}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 12, color: colors.muted, flex: 1, fontWeight: '500' },
  barBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.bg2 },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  value: { fontSize: 12, fontWeight: '700', color: colors.fg, width: 28, textAlign: 'right' },
});

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [workerRating, setWorkerRating] = useState<WorkerRatingSummary | null>(null);
  const [employerRating, setEmployerRating] = useState<EmployerRatingSummary | null>(null);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [totalJobCount, setTotalJobCount] = useState(0);
  const [totalApplicationCount, setTotalApplicationCount] = useState(0);
  const [acceptedApplicationCount, setAcceptedApplicationCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'Worker') {
      ratingsApi.getWorkerSummary(user.userId).then(setWorkerRating).catch(() => {});
      applicationsApi.listMine().then((items) => {
        setTotalApplicationCount(items.length);
        setAcceptedApplicationCount(items.filter((a) => a.status === 'Accepted').length);
      }).catch(() => {});
    } else {
      ratingsApi.getEmployerSummary(user.userId).then(setEmployerRating).catch(() => {});
      jobsApi.listMine().then((items) => {
        setTotalJobCount(items.length);
        setActiveJobCount(items.filter((j) => j.isActive).length);
      }).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Misafir olarak geziniyorsunuz.</Text>
          <Pressable onPress={() => router.push('/login')} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Giriş yap</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { label: 'Hesap bilgileri', sub: 'Ad, e-posta, telefon', icon: 'person-outline' as const, onPress: () => router.push('/account') },
    { label: 'Bildirimler', sub: 'Mesaj, başvuru, hatırlatma', icon: 'notifications-outline' as const, onPress: undefined },
    { label: 'Yardım & destek', sub: 'SSS, iletişim', icon: 'help-circle-outline' as const, onPress: undefined },
  ];

  const rating = user.role === 'Worker' ? workerRating : employerRating;
  const overallAvg = rating?.overallAverage ?? 0;

  const workerMetrics = workerRating
    ? [
        { label: 'İletişim & Sosyal Beceriler', value: workerRating.communicationAvg },
        { label: 'Servis Hızı & Verimlilik', value: workerRating.serviceSpeedAvg },
        { label: 'Takım Çalışması', value: workerRating.teamworkAvg },
      ]
    : [];

  const employerMetrics = employerRating
    ? [
        { label: 'Çalışma Şartları', value: employerRating.workingConditionsAvg },
        { label: 'Ödeme Güvenilirliği', value: employerRating.paymentReliabilityAvg },
        { label: 'Yönetim & Saygı', value: employerRating.managementStyleAvg },
      ]
    : [];

  const metrics = user.role === 'Worker' ? workerMetrics : employerMetrics;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <Text style={styles.eyebrow}>Hesabınız</Text>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Hero gradient card */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecorLarge} />
          <View style={styles.heroDecorSmall} />
          <View style={styles.heroContent}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{initials(user.fullName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{user.fullName}</Text>
              <Text style={styles.heroEmail} numberOfLines={1}>{user.email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{ROLE_LABELS[user.role]}</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.heroStats}>
            {user.role === 'Employer' ? (
              <>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatNum}>{activeJobCount}</Text>
                  <Text style={styles.heroStatLabel}>aktif ilan</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatNum}>{totalJobCount}</Text>
                  <Text style={styles.heroStatLabel}>toplam ilan</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatNum}>{totalApplicationCount}</Text>
                  <Text style={styles.heroStatLabel}>başvuru</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatNum}>{acceptedApplicationCount}</Text>
                  <Text style={styles.heroStatLabel}>kabul edilen</Text>
                </View>
              </>
            )}
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>
                {overallAvg > 0 ? overallAvg.toFixed(1) : '—'}
              </Text>
              <Text style={styles.heroStatLabel}>puan</Text>
              {overallAvg > 0 && <StarDisplay value={overallAvg} />}
            </View>
          </View>
        </View>

        {/* Rating breakdown card */}
        {metrics.length > 0 && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>
              {user.role === 'Worker' ? 'Çalışan değerlendirmem' : 'İşveren değerlendirmem'}
            </Text>
            <View style={styles.ratingMetrics}>
              {metrics.map((m) => (
                <MetricRow key={m.label} label={m.label} value={m.value} />
              ))}
            </View>
          </View>
        )}

        {/* Menu list */}
        <View style={styles.menuList}>
          {menuItems.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                i < menuItems.length - 1 && styles.menuRowBorder,
                pressed && styles.menuRowPressed,
              ]}
            >
              <Ionicons name={item.icon} size={20} color={colors.muted} style={{ marginRight: 4 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.signOutText}>Çıkış yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { color: colors.muted, fontSize: 15 },
  loginBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { paddingBottom: 32 },
  headerWrap: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 },
  eyebrow: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.4,
    color: colors.primary, textTransform: 'uppercase',
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.7, color: colors.fg, marginTop: 4 },
  heroCard: {
    marginHorizontal: 22,
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  heroDecorLarge: {
    position: 'absolute', right: -30, top: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroDecorSmall: {
    position: 'absolute', right: 40, bottom: -10,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 14, position: 'relative' },
  heroAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  heroName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  heroEmail: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 100, marginTop: 6,
  },
  rolePillText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.6 },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
    position: 'relative',
  },
  heroStat: { alignItems: 'center', gap: 2 },
  heroStatNum: { fontSize: 18, fontWeight: '700', color: '#fff' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.22)' },
  ratingCard: {
    marginHorizontal: 22,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 1,
    gap: 14,
  },
  ratingCardTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: colors.primaryDeep, textTransform: 'uppercase',
  },
  ratingMetrics: { gap: 10 },
  menuList: {
    marginHorizontal: 22,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuRowPressed: { backgroundColor: colors.primarySoft },
  menuLabel: { fontSize: 14, fontWeight: '600', color: colors.fg },
  menuSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  signOutBtn: {
    marginHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    alignItems: 'center',
  },
  signOutText: { fontSize: 13, fontWeight: '700', color: colors.primaryDeep },
});
