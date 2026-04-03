// ============================================
// Anchor Daily - App Navigation
// ============================================
import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { RootStackParamList, MainTabParamList } from '../types';
import {
  OnboardingScreen,
  ChooseFocusScreen,
  TodayScreen,
  JournalScreen,
  HistoryScreen,
  SettingsScreen,
  AuthScreen,
  PaywallScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ============================================
// Deep Linking Configuration
// ============================================
// Handles incoming URLs like:
//   anchordaily://reset-password  -> Auth screen (password reset)
//
// Supabase sends this URL after the user clicks
// "Forgot password" in their email client.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['anchordaily://'],
  config: {
    screens: {
      Auth: 'reset-password',
      Onboarding: 'onboarding',
      MainTabs: {
        screens: {
          Today: 'today',
          Journal: 'journal',
          History: 'history',
          Settings: 'settings',
        },
      },
    },
  },
};

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.xs,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: string;
          switch (route.name) {
            case 'Today':
              iconName = focused ? 'sunny' : 'sunny-outline';
              break;
            case 'Journal':
              iconName = focused ? 'journal' : 'journal-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ChooseFocus" component={ChooseFocusScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
