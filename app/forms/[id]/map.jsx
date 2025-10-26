import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useAppStore } from '../../../src/store/useAppStore';

export default function MapScreen() {
  const { id } = useLocalSearchParams();
  const recordsByForm = useAppStore((s) => s.recordsByForm);
  const fetchRecords = useAppStore((s) => s.fetchRecords);
  const fieldsByForm = useAppStore((s) => s.fieldsByForm);
  const fetchFields = useAppStore((s) => s.fetchFields);
  const recState = recordsByForm[String(id)] || { items: [] };
  const fields = fieldsByForm[String(id)] || [];

  useEffect(() => {
    fetchFields(id);
    fetchRecords(id, { limit: 50, append: false });
  }, [id, fetchFields, fetchRecords]);

  const points = useMemo(() => {
    const locationKeys = fields.filter((f) => f.field_type === 'location').map((f) => f.name);
    return recState.items
      .map((r) => {
        let loc = null;
        if (Array.isArray(locationKeys) && locationKeys.length > 0) {
          const key = locationKeys.find((k) => r?.values && r.values[k]);
          if (key) loc = r.values[key];
        }
        // 兼容历史兜底
        if (!loc) loc = r?.values?.location || r?.values?.Location || r?.values?.loc;
        return { r, loc };
      })
      .filter((x) => x.loc && typeof x.loc.lon === 'number' && typeof x.loc.lat === 'number');
  }, [recState.items, fields]);

  const initial = points[0]?.loc || { lon: 153.026, lat: -27.4705 };

  return (
    <View className="flex-1 bg-white">
      {points.length === 0 ? (
        <View className="p-4"><Text className="text-gray-600">No location data.</Text></View>
      ) : (
        <MapView style={{ flex: 1 }} initialRegion={{ latitude: initial.lat, longitude: initial.lon, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
          {points.map(({ r, loc }) => (
            <Marker key={r.id} coordinate={{ latitude: loc.lat, longitude: loc.lon }}>
              <Callout>
                <View style={{ maxWidth: 220 }}>
                  <Text>#{r.id}</Text>
                  <Text numberOfLines={4}>{JSON.stringify(r.values)}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
}
