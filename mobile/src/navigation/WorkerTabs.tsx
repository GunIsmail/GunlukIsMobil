import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { JobFeedScreen } from '@/screens/worker/JobFeedScreen';
import { MyApplicationsScreen } from '@/screens/worker/MyApplicationsScreen';
import { MessagesScreen } from '@/screens/chat/MessagesScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();

export const WorkerTabs: React.FC = () => (
  <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false }}>
    <Tab.Screen name="İlanlar" component={JobFeedScreen} />
    <Tab.Screen name="Başvurularım" component={MyApplicationsScreen} />
    <Tab.Screen name="Mesajlar" component={MessagesScreen} />
    <Tab.Screen name="Profil" component={ProfileScreen} />
  </Tab.Navigator>
);
