import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function LocationField({ label, value, onPick }) {
  // Pick current location once (lon/lat JSON); simplified permissions flow
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


