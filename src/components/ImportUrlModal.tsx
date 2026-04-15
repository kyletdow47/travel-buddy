import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FrostedSheet } from './FrostedSheet';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { SavedSpotInsert } from '../types';

type DetectedPlatform = 'instagram' | 'tiktok' | 'google' | null;

const PLATFORM_DISPLAY: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  instagram: { label: 'Instagram', icon: 'logo-instagram', color: '#DD2A7B' },
  tiktok: { label: 'TikTok', icon: 'musical-notes', color: '#111216' },
  google: { label: 'Google Maps', icon: 'logo-google', color: '#4285F4' },
};

function detectPlatform(url: string): DetectedPlatform {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('tiktok.com') || lower.includes('vm.tiktok.com')) return 'tiktok';
  if (lower.includes('google.com/maps') || lower.includes('goo.gl/maps') || lower.includes('maps.app.goo.gl')) return 'google';
  return null;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onImport: (spot: SavedSpotInsert) => Promise<unknown>;
};

export function ImportUrlModal({ visible, onClose, onImport }: Props) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const detected = useMemo(() => detectPlatform(url), [url]);

  const reset = useCallback(() => {
    setUrl('');
    setName('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmedUrl = url.trim();
    const trimmedName = name.trim();
    if (!trimmedUrl) {
      Alert.alert('URL required', 'Please enter a URL to import.');
      return;
    }
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter a name for this spot.');
      return;
    }
    setSubmitting(true);
    try {
      await onImport({
        name: trimmedName,
        source_url: trimmedUrl,
        source_platform: detected ?? 'manual',
      });
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [url, name, detected, onImport, reset, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={handleClose}
      tint="light"
      maxHeightRatio={0.6}
      accessibilityLabel="Import URL"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Import from URL</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* URL input with paste button */}
        <Text style={styles.label}>URL</Text>
        <View style={styles.urlRow}>
          <TextInput
            style={[styles.input, styles.urlInput]}
            placeholder="Paste a link from Instagram, TikTok, Google Maps..."
            placeholderTextColor={Colors.textTertiary}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        {/* Platform auto-detect */}
        {detected && (
          <View style={styles.detectedRow}>
            <Ionicons
              name={PLATFORM_DISPLAY[detected].icon}
              size={16}
              color={PLATFORM_DISPLAY[detected].color}
            />
            <Text style={styles.detectedText}>
              Detected: {PLATFORM_DISPLAY[detected].label}
            </Text>
          </View>
        )}

        {/* Name input */}
        <Text style={styles.label}>Spot Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Amazing ramen place"
          placeholderTextColor={Colors.textTertiary}
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          autoCapitalize="words"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="download" size={20} color={"#FFFFFF"} />
          <Text style={styles.submitText}>
            {submitting ? 'Importing...' : 'Import'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  label: {
    ...Typography.micro,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.body,
    color: Colors.text,
  },
  urlInput: {
    flex: 1,
  },
  detectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  detectedText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
