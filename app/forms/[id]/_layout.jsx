import React, { useEffect, useMemo } from 'react';
import { Tabs } from 'expo-router';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import FormBottomTabBar from '../../../src/components/FormBottomTabBar';
import { useAppStore } from '../../../src/store/useAppStore';

export default function FormTabsLayout() {
  // CN: 针对某个 form 的子路由，使用底部 Tabs 导航；头部样式与父级保持一致，并显示返回图标
  const { id } = useLocalSearchParams();
  const fieldsByForm = useAppStore((s) => s.fieldsByForm);
  const fetchFields = useAppStore((s) => s.fetchFields);
  const fields = fieldsByForm[String(id)] || [];
  const hasLocation = useMemo(() => fields.some((f) => f.field_type === 'location'), [fields]);

  useEffect(() => {
    fetchFields(id);
  }, [id, fetchFields]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#111827',
        headerBackTitleVisible: false,
        animation: 'fade',
        headerLeft: () => (
          <Pressable
            onPress={() => router.replace('/forms')}
            hitSlop={12}
            className="px-2"
            accessibilityRole="button"
            accessibilityLabel="Back to My Forms"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
        ),
      }}
      tabBar={() => <FormBottomTabBar formId={id} hasMap={hasLocation} />}
    >
      <Tabs.Screen
        name="fields"
        options={{
          title: 'Fields', // CN: 使用默认标题样式，继承父级风格
          tabBarIcon: ({ color, size }) => (<Ionicons name="list-outline" color={color} size={size} />),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => (<Ionicons name="albums-outline" color={color} size={size} />),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (<Ionicons name="map-outline" color={color} size={size} />),
        }}
        href={hasLocation ? undefined : null}
      />
    </Tabs>
  );
}


