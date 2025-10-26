import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function LocationField({ label, value, onPick }) {
  // CN: 仅采集一次当前位置（经纬度 json），权限交互后续完善
  return (
    <View>
      {!!label && <Text className="text-gray-700 mb-2">{label}</Text>}
      <Pressable onPress={onPick} className="border border-gray-300 rounded-2xl px-4 py-3">
        <Text className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? `lon: ${value.lon}, lat: ${value.lat}` : 'Pick current location'}
        </Text>
      </Pressable>
    </View>
  );
}


