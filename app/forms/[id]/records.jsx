import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function RecordsListScreen() {
  const { id } = useLocalSearchParams();
  // CN: 记录列表屏，支持分页、删除（含 username 过滤）、复制 JSON
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text>Records of Form: {id}</Text>
      <Link href={`/forms/${id}`}>Back to Form</Link>
      <Link href="/">Back to Home</Link>
    </View>
  );
}
