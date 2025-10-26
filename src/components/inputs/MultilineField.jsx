import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function MultilineField({ label, value, onChangeText, placeholder, numberOfLines = 4 }) {
  // CN: 多行文本输入
  return (
    <View>
      {!!label && <Text className="text-gray-700 mb-2">{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
      />
    </View>
  );
}


