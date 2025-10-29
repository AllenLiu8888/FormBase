import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function TextInputField({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  // Single-line text input with unified styles
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


