import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function FieldsScreen() {
  // CN: 字段列表与编辑占位页（后续实现 text 等字段定义）
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-base font-medium">Fields of Form: {id}</Text>
      <Text className="text-gray-600 mt-2">// CN: 这里将展示与编辑该表单的字段定义（即将实现）</Text>
    </View>
  );
}


