import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function FormsListScreen() {
  // CN: 我的表单列表屏，展示当前用户的表单，并提供新增/编辑/删除入口
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text>My Forms</Text>
      <Link href="/">Back to Home</Link>
      <Link href="/forms/1">Open Form #1</Link>
    </View>
  );
}
