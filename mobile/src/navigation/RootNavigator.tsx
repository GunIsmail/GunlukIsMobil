import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { OtpVerificationScreen } from '@/screens/auth/OtpVerificationScreen';
import { JobDetailScreen } from '@/screens/worker/JobDetailScreen';
import { CreateJobScreen } from '@/screens/employer/CreateJobScreen';
import { ApplicantsScreen } from '@/screens/employer/ApplicantsScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { WorkerTabs } from './WorkerTabs';
import { EmployerTabs } from './EmployerTabs';
import { GuestTabs } from './GuestTabs';
import { useAuthStore } from '@/store/authStore';
import { setUnauthorizedHandler } from '@/api/http';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    hydrate();
    setUnauthorizedHandler(() => {
      signOut();
    });
  }, [hydrate, signOut]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const AppRoot = user ? (user.role === 'Worker' ? WorkerTabs : EmployerTabs) : GuestTabs;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AppRoot" component={AppRoot} options={{ headerShown: false }} />
        {user ? (
          <>
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'İlan detayı' }} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} options={{ title: 'Yeni ilan' }} />
            <Stack.Screen name="Applicants" component={ApplicantsScreen} options={{ title: 'Başvuranlar' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ title: 'Doğrulama' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş yap' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt ol' }} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'İlan detayı' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
