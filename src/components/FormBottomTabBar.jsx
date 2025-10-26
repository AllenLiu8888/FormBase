import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FormBottomTabBar({ formId, hasMap = true }) {
  // CN: 表单内三页的自定义底部 Tab Bar，样式与 RootBottomNav 统一
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const base = `/forms/${formId}`;
  const isActive = (path) => pathname === path;
  return (
    <View className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-200">
      <View className="flex-row items-center justify-around pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <Pressable onPress={() => router.replace(`${base}/fields`)} className="items-center px-4 py-1 rounded-full">
          <Ionicons name="list-outline" size={20} color={isActive(`${base}/fields`) ? '#111827' : '#6B7280'} />
          <Text className={isActive(`${base}/fields`) ? 'text-black text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>Fields</Text>
        </Pressable>
        <Pressable onPress={() => router.replace(`${base}/records`)} className="items-center px-4 py-1 rounded-full">
          <Ionicons name="albums-outline" size={20} color={isActive(`${base}/records`) ? '#111827' : '#6B7280'} />
          <Text className={isActive(`${base}/records`) ? 'text-black text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>Records</Text>
        </Pressable>
        {hasMap && (
          <Pressable onPress={() => router.replace(`${base}/map`)} className="items-center px-4 py-1 rounded-full">
            <Ionicons name="map-outline" size={20} color={isActive(`${base}/map`) ? '#111827' : '#6B7280'} />
            <Text className={isActive(`${base}/map`) ? 'text-black text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>Map</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}


