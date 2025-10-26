import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useAppStore } from '../../../src/store/useAppStore';
import TextInputField from '../../../src/components/inputs/TextInputField';
import MultilineField from '../../../src/components/inputs/MultilineField';
import DropdownField from '../../../src/components/inputs/DropdownField';
import CheckboxField from '../../../src/components/inputs/CheckboxField';
import LocationField from '../../../src/components/inputs/LocationField';
import FormSheet from '../../../src/components/FormSheet';

export default function RecordsScreen() {
  // CN: 记录列表 + 动态录入
  const { id } = useLocalSearchParams();
  const formId = id;
  const fieldsByForm = useAppStore((s) => s.fieldsByForm);
  const fetchFields = useAppStore((s) => s.fetchFields);
  const recordsByForm = useAppStore((s) => s.recordsByForm);
  const fetchRecords = useAppStore((s) => s.fetchRecords);
  const createRecord = useAppStore((s) => s.createRecord);
  const deleteRecord = useAppStore((s) => s.deleteRecord);
  const loading = useAppStore((s) => s.loading);
  const submitting = useAppStore((s) => s.submitting);
  const deletingId = useAppStore((s) => s.deletingId);

  const fields = fieldsByForm[String(formId)] || [];
  const recState = recordsByForm[String(formId)] || { items: [], offset: 0, hasMore: true };
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFields(formId);
    fetchRecords(formId, { limit: 20, append: false });
  }, [formId, fetchFields, fetchRecords]);

  function setFieldValue(key, v) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function validate(vals = values) {
    const err = {};
    for (const f of fields) {
      const v = vals[f.name];
      if (f.required && (v === undefined || v === null || v === '')) {
        err[f.name] = 'Required';
      }
      if (f.is_num && v !== undefined && v !== null && v !== '' && Number.isNaN(Number(v))) {
        err[f.name] = 'Must be a number';
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onCreate(vals) {
    const submittingVals = vals || values;
    if (!validate(submittingVals)) return;
    await createRecord(formId, submittingVals);
    setValues({});
    setShowForm(false);
  }

  function renderInput(f) {
    const key = f.name;
    const common = { label: f.name, value: values[key], onChangeText: (t) => setFieldValue(key, t) };
    if (f.field_type === 'text') return <TextInputField key={key} {...common} keyboardType={f.is_num ? 'numeric' : 'default'} />;
    if (f.field_type === 'multiline') return <MultilineField key={key} {...common} />;
    if (f.field_type === 'dropdown') {
      const opts = Array.isArray(f.options?.dropdown) ? f.options.dropdown : [];
      return <DropdownField key={key} label={f.name} value={values[key]} options={opts} onChange={(v) => setFieldValue(key, v)} />;
    }
    if (f.field_type === 'location') {
      return (
        <LocationField
          key={key}
          label={f.name}
          value={values[key]}
          onPick={async () => {
            // CN: 先使用 Geolocation 简版占位；后续可替换为 expo-location 并完善权限
            try {
              navigator.geolocation.getCurrentPosition(
                (pos) => setFieldValue(key, { lon: pos.coords.longitude, lat: pos.coords.latitude }),
                () => Alert.alert('Location', 'Unable to get location')
              );
            } catch {}
          }}
        />
      );
    }
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
        <View className="gap-2">
          {recState.items.map((r, idx) => (
            <View key={`${r.id}-${idx}`} className="rounded-xl border border-gray-200 p-3">
              <Text className="text-gray-900">#{r.id}</Text>
              <Text className="text-gray-600 text-xs mt-1">{JSON.stringify(r.values)}</Text>
              <View className="flex-row gap-3 mt-2">
                <Pressable disabled={deletingId === r.id} onPress={() => deleteRecord(formId, r.id)} className="px-3 py-2 rounded-full border border-gray-300">
                  <Text className="text-gray-800 text-sm">Delete</Text>
                </Pressable>
                <Pressable onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(JSON.stringify(r.values));
                    Alert.alert('Copied', 'Record JSON copied to clipboard');
                  } catch {}
                }} className="px-3 py-2 rounded-full border border-gray-300">
                  <Text className="text-gray-800 text-sm">Copy JSON</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {recState.items.length === 0 && <Text className="text-gray-500">No records.</Text>}
        </View>

        {recState.hasMore && (
          <View className="mt-4">
            <Pressable disabled={loading} onPress={() => fetchRecords(formId, { limit: 20, append: true })} className="w-full rounded-full border border-gray-300 py-3.5 items-center">
              <Text className="text-gray-800 text-base">{loading ? 'Loading...' : 'Load More'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* CN: 底部固定“Add Record”按钮，点击弹出模态填写 */}
      <View className="absolute left-0 right-0 bottom-24 px-10 pb-5">
        <Pressable onPress={() => setShowForm(true)} className="w-full rounded-full bg-black py-3.5 items-center">
          <Text className="text-white text-base font-semibold">Add Record</Text>
        </Pressable>
      </View>

      {/* CN: 弹窗表单（使用与 Fields 相同的 FormSheet，schema 动态生成） */}
      <FormSheet
        visible={showForm}
        mode="create"
        initialValues={{}}
        submitting={submitting}
        onClose={() => setShowForm(false)}
        onSubmit={(payload) => onCreate(payload)}
        title="Create Record"
        showDescription={false}
        schema={fields.map((f) => {
          if (f.field_type === 'text') return { key: f.name, type: 'input', label: f.name, keyboardType: f.is_num ? 'numeric' : 'default' };
          if (f.field_type === 'multiline') return { key: f.name, type: 'multiline', label: f.name };
          if (f.field_type === 'dropdown') return { key: f.name, type: 'select', label: f.name, options: Array.isArray(f.options?.dropdown) ? f.options.dropdown : [] };
          if (f.field_type === 'location') return { key: f.name, type: 'location', label: f.name, onPick: async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Location', 'Permission denied');
                return null;
              }
              const loc = await Location.getCurrentPositionAsync({});
              return { lon: loc.coords.longitude, lat: loc.coords.latitude };
            } catch (e) {
              Alert.alert('Location', 'Unable to get location');
              return null;
            }
          } };
          return { key: f.name, type: 'input', label: f.name };
        })}
      />
    </View>
  );
}

// CN: 文件末尾无其他导出，避免重复声明
