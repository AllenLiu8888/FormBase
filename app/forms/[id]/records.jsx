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

const OP_OPTIONS = [
  { label: 'equals', code: 'eq', number: true, text: true },
  { label: 'greater than', code: 'gt', number: true },
  { label: 'less than', code: 'lt', number: true },
  { label: 'greater or equal', code: 'ge', number: true },
  { label: 'less or equal', code: 'le', number: true },
  { label: 'contains', code: 'ilike', text: true },
];

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
  const [showFilter, setShowFilter] = useState(false);
  const [conditions, setConditions] = useState([]); // [{field, op, value, isNum}]
  const [join, setJoin] = useState('AND');

  function removeCondition(idx) {
    setConditions((prev) => prev.filter((_, i) => i !== idx));
  }

  useEffect(() => {
    fetchFields(formId);
    const conds = conditions.map((c) => ({
      path: `values->>${c.field}`,
      op: c.isNum ? c.opCode : (c.opCode === 'ilike' ? 'ilike' : 'eq'),
      value: c.isNum ? c.value : (c.opCode === 'ilike' ? `*${c.value}*` : c.value),
    }));
    fetchRecords(formId, { limit: 20, append: false, conditions: conds, join });
  }, [formId, fetchFields, fetchRecords, conditions, join]);

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
        <View className="mb-3 rounded-xl border border-gray-200 p-3 bg-gray-50">
            <Text className="text-gray-700 text-sm font-medium mb-2">Filters</Text>
            <View className="flex-row flex-wrap gap-2">
              {conditions.map((c, i) => (
                <View key={`${c.field}-${i}`} className="flex-row items-center rounded-full bg-white border border-gray-300 px-3 py-1">
                  <Text className="text-xs text-gray-700">{c.field} {c.label} {String(c.value)}</Text>
                  <Pressable onPress={() => removeCondition(i)} className="ml-2">
                    <Text className="text-gray-500 text-xs">×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row gap-2">
              <Pressable onPress={() => setJoin('AND')} className={`px-3 py-1 rounded-full border ${join==='AND' ? 'bg-black' : ''} border-gray-300`}>
                <Text className={`text-xs ${join==='AND' ? 'text-white' : 'text-gray-800'}`}>AND</Text>
              </Pressable>
              <Pressable onPress={() => setJoin('OR')} className={`px-3 py-1 rounded-full border ${join==='OR' ? 'bg-black' : ''} border-gray-300`}>
                <Text className={`text-xs ${join==='OR' ? 'text-white' : 'text-gray-800'}`}>OR</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setShowFilter(true)} className="px-3 py-1 rounded-full bg-black">
              <Text className="text-white text-xs">Add Criteria</Text>
            </Pressable>
          </View>
        </View>

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

      {/* CN: 底部固定按钮区：仅 Add Record */}
      <View className="absolute left-0 right-0 bottom-24 px-10 pb-5 gap-3">
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

      {/* CN: 过滤条件弹窗（可添加多条条件 + AND/OR） */}
      <FormSheet
        visible={showFilter}
        mode="create"
        initialValues={{ tmp_field: fields[0]?.name, tmp_op: 'equals', tmp_value: '' }}
        submitting={false}
        onClose={() => setShowFilter(false)}
        onSubmit={(payload) => {
          const fieldName = payload?.tmp_field;
          const rawOp = payload?.tmp_op || 'equals';
          const value = payload?.tmp_value ?? '';
          if (!fieldName || String(value) === '') return;
          const isNum = fields.find((f) => f.name === fieldName)?.is_num;
          const opDef = OP_OPTIONS.find((o) => o.label === rawOp) || OP_OPTIONS[0];
          setConditions((prev) => [...prev, { field: fieldName, opCode: opDef.code, label: opDef.label, value, isNum }]);
          setShowFilter(false);
        }}
        title="Add Criteria"
        showDescription={false}
        schema={[
          { key: 'tmp_field', type: 'select', label: 'Field', options: fields.map((f) => f.name) },
          {
            key: 'tmp_op',
            type: 'select',
            label: 'Operator',
            options: (vals) => {
              const isNum = fields.find((f) => f.name === (vals?.tmp_field || fields[0]?.name))?.is_num;
              return OP_OPTIONS.filter((o) => (isNum ? o.number : o.text)).map((o) => o.label);
            },
          },
          { key: 'tmp_value', type: 'input', label: 'Value', placeholder: 'Enter value', keyboardType: 'default' },
        ]}
      />
    </View>
  );
}

// CN: 文件末尾无其他导出，避免重复声明
