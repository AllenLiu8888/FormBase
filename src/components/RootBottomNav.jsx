import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootBottomNav() {
  // Root-level bottom nav (About / Home / Forms); unified style with form tabs
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-200">
      <View className="flex-row items-center justify-around pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <Pressable onPress={() => router.replace('/')} className="items-center px-4 py-1 rounded-full">
          <Ionicons name="home-outline" size={20} color={pathname === '/' ? '#111827' : '#6B7280'} />
          <Text className={pathname === '/' ? 'text-black text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>Home</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/forms')} className="items-center px-4 py-1 rounded-full">
          <Ionicons name="list-outline" size={20} color={pathname?.startsWith('/forms') ? '#111827' : '#6B7280'} />
          <Text className={pathname?.startsWith('/forms') ? 'text-black text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>Forms</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/about')} className="items-center px-4 py-1 rounded-full">
          <Ionicons name="information-circle-outline" size={20} color={pathname === '/about' ? '#111827' : '#6B7280'} />
          <Text className={pathname === '/about' ? 'text-black text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>About</Text>
        </Pressable>
      </View>
    </View>
  );
}


