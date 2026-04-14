import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { CategoryGlyph, type CategoryKey } from '../../src/components/CategoryGlyph';
import { QuickActionCircle } from '../../src/components/QuickActionCircle';
import { FlightSegmentRow } from '../../src/components/FlightSegmentRow';
import { HeroPhotoHeader } from '../../src/components/HeroPhotoHeader';
import { GradientScreen } from '../../src/components/GradientScreen';
import { RingMapOverlay } from '../../src/components/RingMapOverlay';
import { TintedBanner, TintedToast } from '../../src/components/TintedBanner';
import { FrostedSheet } from '../../src/components/FrostedSheet';

const CATEGORIES: CategoryKey[] = [
  'flight',
  'lodging',
  'food',
  'activity',
  'places',
  'shopping',
  'culture',
  'transport',
  'weather',
  'note',
  'gas',
  'other',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[Typography.eyebrow, styles.sectionTitle]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function DesignShowcase() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [gradientPreset, setGradientPreset] =
    useState<keyof typeof Colors.gradient>('flight');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Stack.Screen options={{ title: 'Design System' }} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.display, styles.pageTitle]}>Design System</Text>
        <Text style={styles.pageSub}>
          Tripsy-inspired components · tokens v2
        </Text>

        <Section title="Color · Category glyphs">
          <View style={styles.glyphGrid}>
            {CATEGORIES.map((cat) => (
              <View key={cat} style={styles.glyphCell}>
                <CategoryGlyph category={cat} size={36} />
                <Text style={styles.glyphLabel}>{cat}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Glyph variants">
          <View style={styles.row}>
            <CategoryGlyph category="flight" size={28} variant="filled" />
            <CategoryGlyph category="flight" size={36} variant="tinted" />
            <CategoryGlyph category="flight" size={44} variant="ghost" />
          </View>
        </Section>

        <Section title="Quick actions">
          <View style={styles.row}>
            <QuickActionCircle icon="add" label="Add" primary />
            <QuickActionCircle icon="share-outline" label="Share" />
            <QuickActionCircle icon="download-outline" label="Import" outlined />
            <QuickActionCircle icon="ellipsis-horizontal" label="More" size="sm" />
          </View>
        </Section>

        <Section title="Flight segment">
          <FlightSegmentRow
            segment={{
              airline: 'Delta Air Lines',
              flightNumber: 'DL 2345',
              from: 'JFK',
              to: 'LAX',
              departTime: '6:45 AM',
              arriveTime: '10:12 AM',
              dateLabel: 'Jun 12',
              duration: '5h 27m',
              gate: 'T4 · B22',
              status: 'On time',
              statusTone: 'ok',
            }}
          />
          <View style={{ height: Spacing.sm }} />
          <FlightSegmentRow
            segment={{
              airline: 'United',
              flightNumber: 'UA 1102',
              from: 'SFO',
              to: 'ORD',
              departTime: '1:20 PM',
              arriveTime: '7:35 PM',
              duration: '4h 15m',
              status: 'Delayed 25m',
              statusTone: 'warn',
            }}
          />
        </Section>

        <Section title="Hero photo header">
          <View style={{ borderRadius: Radius.lg, overflow: 'hidden' }}>
            <HeroPhotoHeader
              title="New York City"
              eyebrow="TRIP · 5 DAYS"
              subtitle="Apr 14 – 19"
              height={240}
              onBack={() => undefined}
              actionIcon="share-outline"
              onActionPress={() => undefined}
            />
          </View>
        </Section>

        <Section title="Gradient screen presets">
          <View style={styles.row}>
            {(['flight', 'lodging', 'alert', 'places'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setGradientPreset(p)}
                style={[
                  styles.presetChip,
                  gradientPreset === p ? styles.presetChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    gradientPreset === p ? { color: Colors.surface } : null,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
          <View
            style={{
              height: 140,
              borderRadius: Radius.lg,
              overflow: 'hidden',
              marginTop: Spacing.sm,
            }}
          >
            <GradientScreen preset={gradientPreset} safeArea={false}>
              <View style={styles.gradientPreview}>
                <Text style={styles.gradientPreviewText}>preset: {gradientPreset}</Text>
              </View>
            </GradientScreen>
          </View>
        </Section>

        <Section title="Ring map overlay">
          <View style={{ alignItems: 'center' }}>
            <RingMapOverlay count={7} category="places" sublabel="places saved" />
          </View>
        </Section>

        <Section title="Tinted banners">
          <TintedBanner
            tone="info"
            title="Flight alert"
            message="DL 2345 gate changed to B22."
            actionLabel="View"
            onActionPress={() => undefined}
          />
          <TintedBanner
            tone="success"
            title="Trip synced"
            message="All changes saved to the cloud."
          />
          <TintedBanner
            tone="warning"
            title="Weak signal"
            message="Edits will sync when you're back online."
          />
          <TintedBanner tone="error" title="Upload failed" message="Tap to retry." />
        </Section>

        <Section title="Interactions">
          <View style={styles.row}>
            <Pressable
              style={[styles.btn, { backgroundColor: Colors.primary }]}
              onPress={() => setSheetOpen(true)}
            >
              <Text style={styles.btnText}>Open frosted sheet</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { backgroundColor: Colors.info }]}
              onPress={() => setToastOpen(true)}
            >
              <Text style={styles.btnText}>Show toast</Text>
            </Pressable>
          </View>
        </Section>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <FrostedSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text style={[Typography.h2, { color: Colors.textOnDark }]}>
          Frosted sheet
        </Text>
        <Text style={{ color: Colors.textOnDarkSecondary, marginTop: Spacing.xs }}>
          Drag down to dismiss, tap the backdrop to close.
        </Text>
      </FrostedSheet>

      <TintedToast
        tone="success"
        title="Saved"
        message="Itinerary updated."
        visible={toastOpen}
        onDismiss={() => setToastOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.lg,
  },
  pageTitle: {
    color: Colors.text,
  },
  pageSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sectionBody: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    alignItems: 'center',
  },
  glyphGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  glyphCell: {
    alignItems: 'center',
    gap: 4,
    width: 72,
  },
  glyphLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceDim,
  },
  presetChipActive: {
    backgroundColor: Colors.text,
  },
  presetChipText: {
    ...Typography.micro,
    color: Colors.text,
  },
  gradientPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientPreviewText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
  },
  btn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  btnText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
