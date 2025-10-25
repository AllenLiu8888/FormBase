import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  // CN: 根级路由容器 —— 使用 expo-router 的 Stack 管理所有页面
  // CN: 这里可统一配置导航栏样式、标题、动画等全局选项
  return (
    <SafeAreaProvider>
      <Stack>
        {/* CN: /app 目录下的文件会被自动注册为路由页面 */}
      </Stack>
    </SafeAreaProvider>
  );
}
