import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { JobFeedScreen } from '@/screens/worker/JobFeedScreen';
import { GuestProfileScreen } from '@/screens/shared/GuestProfileScreen';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();

export const GuestTabs: React.FC = () => (
  <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false }}>
    <Tab.Screen name="İlanlar" component={JobFeedScreen} />
    <Tab.Screen name="Hesap" component={GuestProfileScreen} />
  </Tab.Navigator>
);
