import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { FormApi } from '../lib/api';

export default function FormsListScreen() {
  // CN: 我的表单列表屏，展示当前用户的表单，并提供新增/编辑/删除入口
  const [loading, setLoading] = useState(true); // CN: 加载状态
  const [error, setError] = useState(null); // CN: 错误信息
  const [forms, setForms] = useState([]); // CN: 表单列表数据

  useEffect(() => {
    // CN: 组件挂载时请求表单列表，用于验证 API 是否畅通
    (async () => {
      try {
        const data = await FormApi.list();
        setForms(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View className="flex-1 p-4 gap-3 bg-white">
      <Text className="text-base font-medium">My Forms</Text>

      {loading && (
        <Text className="text-gray-600">Loading...</Text>
      )}

      {!loading && error && (
        <Text className="text-red-500">Error: {String(error?.message || error)}</Text>
      )}

      {!loading && !error && (
        <View className="gap-2">
          <Text className="text-gray-700">Total: {forms.length}</Text>
          {forms.map((f) => (
            <Text key={f.id} className="text-gray-900">{f.name}</Text>
          ))}
        </View>
      )}

      <Link href="/" className="text-blue-600">Back to Home</Link>
    </View>
  );
}
