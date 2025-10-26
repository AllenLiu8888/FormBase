import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export default function DropdownField({ label, value, onChange, options = [], placeholder = 'Select' }) {
  // CN: 简易下拉选择
  const [open, setOpen] = useState(false);
  return (
    <View>
      {!!label && <Text className="text-gray-700 mb-2">{label}</Text>}
      <Pressable className="border border-gray-300 rounded-2xl px-4 py-3" onPress={() => setOpen(!open)}>
        <Text className={value ? 'text-gray-900' : 'text-gray-400'}>{value || placeholder}</Text>
      </Pressable>
      {open && (
        <View className="mt-2 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {options.map((opt) => (
            <Pressable key={String(opt)} className="px-4 py-3 border-b border-gray-100" onPress={() => { onChange?.(opt); setOpen(false); }}>
              <Text className="text-gray-900">{String(opt)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}


