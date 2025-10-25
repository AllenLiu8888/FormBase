import React from 'react';
import { View, Text } from 'react-native';

export default function AboutScreen() {
  // CN: 关于页面，展示应用与课程信息
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-medium">About</Text>
    </View>
  );
}
