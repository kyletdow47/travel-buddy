import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { updateReceipt, uploadReceiptImage, syncTripSpent } from '../services/receiptsService';
import { getStops } from '../services/stopsService';
import type { Receipt, Stop } from '../types';

const CATEGORIES = ['Food', 'Hotel', 'Gas', 'Activity', 'Other'];

interface Props {
  visible: boolean;
  receipt: Receipt;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditReceiptModal({ visible, receipt, onClose, onSaved }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [receiptDate, setReceiptDate] = useState('');
  const [stopId, setStopId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && receipt.trip_id) {
      getStops(receipt.trip_id).then(setStops).catch(console.error);
    }
  }, [visible, receipt.trip_id]);

  useEffect(() => {
    if (visible) {
      setImageUri(null);
      setMerchant(receipt.merchant ?? '');
      setAmount(receipt.amount.toString());
      const rawCategory = receipt.category ?? 'other';
      setCategory(rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1));
      setReceiptDate(receipt.receipt_date ?? new Date().toISOString().split('T')[0]);
      setStopId(receipt.stop_id ?? null);
      setNotes(receipt.notes ?? '');
    }
  }, [visible, receipt]);

  async function pickImage(fromCamera: boolean) {
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission needed', 'Photo permissions are required to add receipt images.');
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
    };

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed < 0) {
      Alert.alert('Validation', 'Please enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = receipt.image_url;

      if (imageUri) {
        imageUrl = await uploadReceiptImage(imageUri, receipt.id);
      }

      await updateReceipt(receipt.id, {
        merchant: merchant.trim() || null,
        amount: parsed,
        category: category.toLowerCase(),
        receipt_date: receiptDate,
        image_url: imageUrl,
        stop_id: stopId,
        notes: notes.trim() || null,
      });

      if (receipt.trip_id) {
        await syncTripSpent(receipt.trip_id);
      }
      onSaved();
    } catch {
      Alert.alert('Error', 'Failed to update receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const displayImageUri = imageUri ?? receipt.image_url;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={saving}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Receipt</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.save}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo picker */}
          <View style={styles.photoSection}>
            {displayImageUri ? (
              <View>
                <Image
                  source={{ uri: displayImageUri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
                    <Ionicons name="camera-outline" size={18} color={Colors.primary} />
                    <Text style={styles.photoBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
                    <Ionicons name="image-outline" size={18} color={Colors.primary} />
                    <Text style={styles.photoBtnText}>Replace</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
                  <Ionicons name="camera-outline" size={22} color={Colors.primary} />
                  <Text style={styles.photoBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
                  <Ionicons name="image-outline" size={22} color={Colors.primary} />
                  <Text style={styles.photoBtnText}>Choose from Library</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Merchant */}
          <View style={styles.field}>
            <Text style={styles.label}>Merchant</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Starbucks"
              placeholderTextColor={Colors.textSecondary}
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Receipt Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textSecondary}
              value={receiptDate}
              onChangeText={setReceiptDate}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Link to Stop */}
          {stops.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Link to Stop (optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                <TouchableOpacity
                  style={[styles.chip, !stopId && styles.chipActive]}
                  onPress={() => setStopId(null)}
                >
                  <Text style={[styles.chipText, !stopId && styles.chipTextActive]}>None</Text>
                </TouchableOpacity>
                {stops.map((stop) => (
                  <TouchableOpacity
                    key={stop.id}
                    style={[styles.chip, stopId === stop.id && styles.chipActive]}
                    onPress={() => setStopId(stop.id)}
                  >
                    <Text style={[styles.chipText, stopId === stop.id && styles.chipTextActive]}>
                      {stop.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Optional notes..."
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  cancel: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  save: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.backgroundSecondary,
  },
  photoBtnText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.primary,
  },
  preview: {
    width: 220,
    height: 160,
    borderRadius: Radius.md,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.backgroundSecondary,
  },
  multiline: {
    height: 80,
    paddingTop: Spacing.sm + 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
