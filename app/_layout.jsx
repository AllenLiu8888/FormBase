import React from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Pressable, Text } from 'react-native';
import RootBottomNav from '../src/components/RootBottomNav';
import '../global.css';

export default function RootLayout() {
  // CN: 根级路由容器 —— 使用 expo-router 的 Stack 管理所有页面
  // CN: 显式声明部分页面，避免因自动注册异常导致的空白
  const pathname = usePathname();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <Stack screenOptions={{
        contentStyle: { backgroundColor: '#fff' },
        headerBackTitleVisible: false,
        headerBackTitle: ' ',
        headerBackVisible: false, // CN: 去掉系统返回按钮
        headerLeft: () => null, // CN: 彻底移除左侧返回图标区域
        animation: 'fade', // CN: 禁用左右滑动动画，直接替换
      }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="forms/index" options={{ title: 'My Forms' }} />
        {/* CN: 隐藏父级头部，让 forms/[id]/_layout.jsx 的 Tabs 头部接管 */}
        <Stack.Screen name="forms/[id]" options={{ headerShown: false }} />
        {/* CN: 其他页面仍由文件路由自动注册 */}
      </Stack>

      {/* CN: 全局底部导航栏：About / Home / Forms */}
      {!(pathname?.startsWith('/forms/') && pathname.split('/').length >= 3) && (
        <RootBottomNav />
      )}
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
