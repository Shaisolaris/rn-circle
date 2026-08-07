import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { ComposeScreen } from '../screens/ComposeScreen';
import { GroupFeedScreen } from '../screens/GroupFeedScreen';
import { ThreadScreen } from '../screens/ThreadScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      border: theme.colors.border,
      text: theme.colors.text,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.text },
          headerTintColor: theme.colors.accent,
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Thread" component={ThreadScreen} options={{ title: 'Post' }} />
        <Stack.Screen name="Compose" component={ComposeScreen} options={{ title: 'New post', presentation: 'modal' }} />
        <Stack.Screen name="GroupFeed" component={GroupFeedScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
