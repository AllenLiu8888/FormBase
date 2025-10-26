import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function TextInputField({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  // CN: 统一样式的单行文本输入
  return (
    <View>
      {!!label && <Text className="text-gray-700 mb-2">{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
      />
    </View>
  );
}


