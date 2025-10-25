import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  // CN: 首页（Welcome），提供到主要模块的入口
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white">
      <Text className="text-2xl font-semibold">Home / Welcome</Text>
      {/* CN: 下面是到各页面的示例跳转 */}
      <Link href="/about">Go to About</Link>
      <Link href="/forms">Go to My Forms</Link>
      <Link href="/forms/1">Go to Form #1</Link>
      <Link href="/forms/1/records">Go to Form #1 Records</Link>
      <Link href="/forms/1/map">Go to Form #1 Map</Link>
    </View>
  );
} 