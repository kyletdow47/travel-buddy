import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Radius, Spacing, Typography } from '../../src/constants/theme';

type SwatchEntry = { label: string; value: string; onDark?: boolean };

const LIGHT_SWATCHES: SwatchEntry[] = [
  { label: 'primary', value: Colors.primary },
  { label: 'primaryLight', value: Colors.primaryLight },
  { label: 'background', value: Colors.background },
  { label: 'backgroundSecondary', value: Colors.backgroundSecondary },
  { label: 'text', value: Colors.text, onDark: true },
  { label: 'textSecondary', value: Colors.textSecondary, onDark: true },
  { label: 'border', value: Colors.border },
  { label: 'success', value: Colors.success, onDark: true },
  { label: 'warning', value: Colors.warning },
  { label: 'error', value: Colors.error, onDark: true },
];

const DARK_SWATCHES: SwatchEntry[] = [
  { label: 'dark.background', value: Colors.dark.background, onDark: true },
  { label: 'dark.backgroundSecondary', value: Colors.dark.backgroundSecondary, onDark: true },
  { label: 'dark.text', value: Colors.dark.text },
  { label: 'dark.textSecondary', value: Colors.dark.textSecondary },
  { label: 'dark.border', value: Colors.dark.border, onDark: true },
];

const TYPOGRAPHY_SAMPLES: Array<{ key: keyof typeof Typography; sample: string }> = [
  { key: 'h1', sample: 'Plan your next trip' },
  { key: 'h2', sample: 'Tokyo, Japan' },
  { key: 'h3', sample: 'Day 2 · Shibuya' },
  { key: 'body', sample: 'Body copy sits at 16pt for comfortable reading.' },
  { key: 'caption', sample: 'Captions and metadata use 13pt for hierarchy.' },
];

const SPACING_KEYS: Array<keyof typeof Spacing> = ['xs', 'sm', 'md', 'lg', 'xl'];
const RADIUS_KEYS: Array<keyof typeof Radius> = ['sm', 'md', 'lg', 'full'];

export default function DesignShowcase() {
  const swatchRows = useMemo(
    () => ({
      light: LIGHT_SWATCHES,
      dark: DARK_SWATCHES,
    }),
    [],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ title: 'Design Showcase', headerShown: true }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <Section title="Colors — Light">
          <SwatchGrid entries={swatchRows.light} />
        </Section>

        <Section title="Colors — Dark">
          <SwatchGrid entries={swatchRows.dark} />
        </Section>

        <Section title="Typography">
          <View style={styles.typographyStack}>
            {TYPOGRAPHY_SAMPLES.map(({ key, sample }) => {
              const style = Typography[key];
              return (
                <View key={key} style={styles.typographyRow}>
                  <Text style={styles.typographyLabel}>
                    {key} · {style.fontSize}/{style.fontWeight}
                  </Text>
                  <Text
                    style={{
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      color: Colors.text,
                    }}
                  >
                    {sample}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Section title="Spacing">
          <View style={styles.spacingColumn}>
            {SPACING_KEYS.map((key) => (
              <View key={key} style={styles.spacingRow}>
                <Text style={styles.spacingLabel}>
                  {key} · {Spacing[key]}pt
                </Text>
                <View style={[styles.spacingBar, { width: Spacing[key] * 6 }]} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Radius">
          <View style={styles.radiusRow}>
            {RADIUS_KEYS.map((key) => (
              <View key={key} style={styles.radiusItem}>
                <View
                  style={[
                    styles.radiusSwatch,
                    {
                      borderRadius:
                        key === 'full' ? Radius.full : Radius[key],
                    },
                  ]}
                />
                <Text style={styles.radiusLabel}>
                  {key} · {Radius[key]}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Primitives — Usage samples">
          <View style={styles.primitiveStack}>
            <PrimaryButton label="Start planning" icon="airplane" />
            <PillChip label="Tokyo · 7 nights" tone="primary" />
            <PillChip label="Food" tone="neutral" />
            <MetricCard
              label="Trip budget"
              value="$2,480"
              hint="$520 remaining"
            />
          </View>
        </Section>

        <Section title="Pending primitives">
          <Text style={styles.placeholderCopy}>
            The following design-system primitives are tracked in EPIC 1 and
            will render here as they are implemented:
          </Text>
          {[
            'HeroPhotoHeader',
            'GradientScreen',
            'FrostedSheet',
            'CategoryGlyph',
            'QuickActionCircle',
            'TintedToast / TintedBanner',
            'FlightSegmentRow',
            'RingMapOverlay',
            'Typography display variant (SF Pro Rounded)',
          ].map((name) => (
            <View key={name} style={styles.pendingRow}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingLabel}>{name}</Text>
            </View>
          ))}
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Route: /dev/design · QA surface for design tokens + primitives.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerEyebrow}>Dev · QA</Text>
      <Text style={styles.headerTitle}>Design Showcase</Text>
      <Text style={styles.headerSubtitle}>
        Visual reference for every token and primitive in the Travel Buddy
        design system.
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SwatchGrid({ entries }: { entries: SwatchEntry[] }) {
  return (
    <View style={styles.swatchGrid}>
      {entries.map((entry) => (
        <View key={entry.label} style={styles.swatchCell}>
          <View style={[styles.swatch, { backgroundColor: entry.value }]}>
            <Text
              style={[
                styles.swatchValue,
                { color: entry.onDark ? '#FFFFFF' : Colors.text },
              ]}
            >
              {entry.value}
            </Text>
          </View>
          <Text style={styles.swatchLabel}>{entry.label}</Text>
        </View>
      ))}
    </View>
  );
}

function PrimaryButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
      ]}
    >
      <Ionicons name={icon} size={18} color="#FFFFFF" />
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function PillChip({
  label,
  tone,
}: {
  label: string;
  tone: 'primary' | 'neutral';
}) {
  const isPrimary = tone === 'primary';
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isPrimary ? Colors.primary : Colors.backgroundSecondary,
          borderColor: isPrimary ? Colors.primary : Colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          { color: isPrimary ? '#FFFFFF' : Colors.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  headerEyebrow: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  sectionBody: {
    gap: Spacing.md,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatchCell: {
    width: '48%',
    gap: Spacing.xs,
  },
  swatch: {
    height: 64,
    borderRadius: Radius.md,
    justifyContent: 'flex-end',
    padding: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  swatchValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  swatchLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  typographyStack: {
    gap: Spacing.md,
  },
  typographyRow: {
    gap: Spacing.xs,
  },
  typographyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spacingColumn: {
    gap: Spacing.sm,
  },
  spacingRow: {
    gap: Spacing.xs,
  },
  spacingLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  spacingBar: {
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
  },
  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  radiusItem: {
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  radiusSwatch: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primaryLight,
  },
  radiusLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  primitiveStack: {
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  metricCard: {
    alignSelf: 'stretch',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  metricLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.text,
  },
  metricHint: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    fontWeight: '600',
  },
  placeholderCopy: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  pendingLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
