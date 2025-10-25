import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function MapScreen() {
  const { id } = useLocalSearchParams();
  // CN: 地图屏，使用 expo-map-view 显示包含 location 的记录
  return (
    <View className="flex-1 p-4 gap-3 bg-white">
      <Text className="text-base font-medium">Map for Form: {id}</Text>
      <Link href={`/forms/${id}`}>Back to Form</Link>
      <Link href="/">Back to Home</Link>
    </View>
  );
}
