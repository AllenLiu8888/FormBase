import React from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Pressable, Text } from 'react-native';
import RootBottomNav from '../src/components/RootBottomNav';
import '../global.css';

export default function RootLayout() {
  // Root router container — use expo-router Stack to manage all pages
  // Explicitly declare key screens to avoid auto-registration edge cases
  const pathname = usePathname();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <Stack screenOptions={{
        contentStyle: { backgroundColor: '#fff' },
        headerBackTitleVisible: false,
        headerBackTitle: ' ',
        headerBackVisible: false, // Remove default system back button
        headerLeft: () => null, // Remove left header area completely
        animation: 'fade', // Use fade transitions (no horizontal slide)
      }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="forms/index" options={{ title: 'My Forms' }} />
        {/* Hide root header so forms/[id]/_layout.jsx controls Tabs header */}
        <Stack.Screen name="forms/[id]" options={{ headerShown: false }} />
        {/* Other screens are still auto-registered by file-based routing */}
      </Stack>

      {/* Global bottom nav: About / Home / Forms */}
      {!(pathname?.startsWith('/forms/') && pathname.split('/').length >= 3) && (
        <RootBottomNav />
      )}
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
