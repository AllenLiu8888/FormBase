import React from 'react';
import { View, Text } from 'react-native';

export default function HeaderBar({ title, subtitle }) {
  // Header title with optional subtitle (Apple HIG spacing)
  return (
    <View className="px-5 pt-6 pb-3 bg-white">
      <Text className="text-2xl font-semibold">{title}</Text>
      {subtitle ? <Text className="text-gray-500 mt-1">{subtitle}</Text> : null}
    </View>
  );
}


