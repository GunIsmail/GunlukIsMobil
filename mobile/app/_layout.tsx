import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { setUnauthorizedHandler } from '@/api/http';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    hydrate();
    setUnauthorizedHandler(() => signOut());
  }, [hydrate, signOut]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace('/(guest)');
    } else if (user.role === 'Worker') {
      router.replace('/(worker)');
    } else {
      router.replace('/(employer)');
    }
  }, [isHydrated, user]);

  if (!isHydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: colors.fg,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.card },
            headerTitleStyle: { fontSize: 15, fontWeight: '700', color: colors.fg },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(guest)" options={{ headerShown: false }} />
          <Stack.Screen name="(worker)" options={{ headerShown: false }} />
          <Stack.Screen name="(employer)" options={{ headerShown: false }} />
          <Stack.Screen name="job/[id]" options={{ title: 'İlan detayı', headerShown: false }} />
          <Stack.Screen name="create-job" options={{ title: 'Yeni ilan', headerShown: false }} />
          <Stack.Screen name="applicants" options={{ title: 'Başvuranlar', headerShown: false }} />
          <Stack.Screen name="chat" options={{ title: '', headerShown: false }} />
          <Stack.Screen name="otp" options={{ title: 'Doğrulama' }} />
          <Stack.Screen name="rate" options={{ title: 'Değerlendir', headerShown: false }} />
          <Stack.Screen name="account" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
