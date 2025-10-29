import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckboxField({ label, value, onChange }) {
  // Checkbox input using Pressable + Ionicons
  const checked = Boolean(value);
  return (
    <Pressable
      onPress={() => onChange?.(!checked)}
      className="flex-row items-center justify-between border border-gray-300 rounded-2xl px-4 py-3"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Text className="text-gray-700">{label}</Text>
      <Ionicons name={checked ? 'checkbox-outline' : 'square-outline'} size={22} color={checked ? '#111827' : '#6B7280'} />
    </Pressable>
  );
}


