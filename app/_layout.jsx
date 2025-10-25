import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  // CN: 根级路由容器 —— 使用 expo-router 的 Stack 管理所有页面
  // CN: 显式声明部分页面，避免因自动注册异常导致的空白
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#fff' } }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="forms/index" options={{ title: 'My Forms' }} />
        {/* CN: 其他页面仍由文件路由自动注册 */}
      </Stack>
    </SafeAreaProvider>
  );
}
