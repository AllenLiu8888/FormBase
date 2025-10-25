import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function FormDetailScreen() {
  const { id } = useLocalSearchParams();
  // CN: 表单详情/字段管理页，根据 id 渲染对应表单信息与字段编辑
  return (
    <View className="flex-1 p-4 gap-3 bg-white">
      <Text className="text-base font-medium">Form Detail: {id}</Text>
      <Link href="/">Back to Home</Link>
      <Link href={`/forms/${id}/records`}>Open Records</Link>
      <Link href={`/forms/${id}/map`}>Open Map</Link>
    </View>
  );
}
