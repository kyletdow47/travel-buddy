import { Fragment } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Categories,
  Colors,
  Motion,
  Radius,
  Shadows,
  Spacing,
  Typography,
  type CategoryKey,
} from '../../src/constants/theme';
import { CategoryGlyph } from '../../src/components/ds/CategoryGlyph';
import { GradientScreen } from '../../src/components/ds/GradientScreen';
import { HeroPhotoHeader } from '../../src/components/ds/HeroPhotoHeader';
import { TintedBanner, TintedToast } from '../../src/components/ds/TintedBanner';
import { QuickActionCircle } from '../../src/components/ds/QuickActionCircle';
import { FlightSegmentRow } from '../../src/components/ds/FlightSegmentRow';
import { FrostedSheet } from '../../src/components/ds/FrostedSheet';
import { RingMapOverlay } from '../../src/components/ds/RingMapOverlay';

const CATEGORY_KEYS = Object.keys(Categories) as CategoryKey[];
const SHADOW_KEYS = ['sm', 'md', 'lg', 'frosted'] as const;
const SPACING_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
const RADIUS_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'sheet'] as const;
const TYPOGRAPHY_VARIANTS = [
  'displayLarge',
  'display',
  'displaySmall',
  'h1',
  'h2',
  'h3',
  'bodyStrong',
  'body',
  'label',
  'caption',
] as const;

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Section({ title, description, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchChip, { backgroundColor: value }]} />
      <Text style={styles.swatchName}>{name}</Text>
      <Text style={styles.swatchValue}>{value}</Text>
    </View>
  );
}

export default function DesignShowcase() {
  return (
    <Fragment>
      <Stack.Screen options={{ title: 'Design Showcase' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.introEyebrow}>/dev/design</Text>
            <Text style={styles.introTitle}>Design System QA</Text>
            <Text style={styles.introSubtitle}>
              Every primitive, token, and category rendered on a single surface.
            </Text>
          </View>

          <Section
            title="Core Palette"
            description="Brand, surface, text, and state tokens used across the app."
          >
            <View style={styles.swatchGrid}>
              <ColorSwatch name="primary" value={Colors.primary} />
              <ColorSwatch name="primaryLight" value={Colors.primaryLight} />
              <ColorSwatch name="primaryDark" value={Colors.primaryDark} />
              <ColorSwatch name="backgroundTinted" value={Colors.backgroundTinted} />
              <ColorSwatch name="backgroundSecondary" value={Colors.backgroundSecondary} />
              <ColorSwatch name="text" value={Colors.text} />
              <ColorSwatch name="textSecondary" value={Colors.textSecondary} />
              <ColorSwatch name="textMuted" value={Colors.textMuted} />
              <ColorSwatch name="success" value={Colors.success} />
              <ColorSwatch name="warning" value={Colors.warning} />
              <ColorSwatch name="error" value={Colors.error} />
            </View>
          </Section>

          <Section
            title="Category Palette"
            description="Each category exposes solid, tint, onTint, and gradient stops."
          >
            {CATEGORY_KEYS.map((key) => {
              const tokens = Categories[key];
              return (
                <View key={key} style={styles.categoryRow}>
                  <CategoryGlyph category={key} size={36} />
                  <View style={styles.categoryMeta}>
                    <Text style={styles.categoryLabel}>{tokens.label}</Text>
                    <Text style={styles.categoryMono}>
                      {tokens.solid} · {tokens.tint}
                    </Text>
                  </View>
                  <View style={[styles.categoryPill, { backgroundColor: tokens.tint }]}>
                    <Text style={[styles.categoryPillText, { color: tokens.onTint }]}>onTint</Text>
                  </View>
                </View>
              );
            })}
          </Section>

          <Section title="Typography" description="Display stack through caption.">
            {TYPOGRAPHY_VARIANTS.map((variant) => (
              <View key={variant} style={styles.typographyRow}>
                <Text style={[Typography[variant], styles.typographySample]}>
                  {variant === 'displayLarge' || variant === 'display' || variant === 'displaySmall'
                    ? 'Travel Buddy'
                    : variant === 'h1' || variant === 'h2' || variant === 'h3'
                      ? 'Heading sample'
                      : 'The quick brown fox jumps over the lazy dog.'}
                </Text>
                <Text style={styles.typographyMeta}>
                  {variant} · {Typography[variant].fontSize}pt / {String(Typography[variant].fontWeight)}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Spacing scale">
            {SPACING_KEYS.map((key) => (
              <View key={key} style={styles.spacingRow}>
                <Text style={styles.spacingLabel}>{key}</Text>
                <View style={[styles.spacingBar, { width: Spacing[key] * 4 }]} />
                <Text style={styles.spacingValue}>{Spacing[key]}pt</Text>
              </View>
            ))}
          </Section>

          <Section title="Radius scale">
            <View style={styles.radiusGrid}>
              {RADIUS_KEYS.map((key) => (
                <View key={key} style={styles.radiusItem}>
                  <View
                    style={[
                      styles.radiusBlock,
                      { borderRadius: Radius[key] },
                    ]}
                  />
                  <Text style={styles.radiusLabel}>{key}</Text>
                  <Text style={styles.radiusValue}>{Radius[key]}pt</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Shadows">
            <View style={styles.shadowGrid}>
              {SHADOW_KEYS.map((key) => (
                <View key={key} style={[styles.shadowCard, Shadows[key]]}>
                  <Text style={styles.shadowLabel}>{key}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="CategoryGlyph" description="28pt, 36pt, 44pt across all categories.">
            {([28, 36, 44] as const).map((size) => (
              <View key={size} style={styles.glyphRow}>
                <Text style={styles.glyphRowLabel}>{size}pt</Text>
                <View style={styles.glyphRowList}>
                  {CATEGORY_KEYS.map((key) => (
                    <CategoryGlyph key={key} category={key} size={size} />
                  ))}
                </View>
              </View>
            ))}
          </Section>

          <Section title="HeroPhotoHeader">
            <HeroPhotoHeader
              subtitle="Kyoto · 5 days"
              title="Temples & Tea Houses"
              imageUri="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=60"
              height={220}
            />
          </Section>

          <Section title="TintedBanner / TintedToast">
            <TintedBanner
              category="flight"
              title="Flight on time"
              message="NRT → HND departs in 2h 15m from Gate 41."
            />
            <View style={{ height: Spacing.sm }} />
            <TintedBanner
              category="lodging"
              title="Check-in reminder"
              message="Park Hotel Tokyo — 3 pm today."
            />
            <View style={{ height: Spacing.md }} />
            <TintedToast
              category="activity"
              title="Saved to trip"
              message="Meiji Jingu added to Day 2."
            />
          </Section>

          <Section title="QuickActionCircle">
            <View style={styles.quickActionRow}>
              <QuickActionCircle icon="airplane-outline" label="Flight" />
              <QuickActionCircle icon="bed-outline" label="Stay" tint={Categories.lodging.solid} />
              <QuickActionCircle icon="restaurant-outline" label="Food" tint={Categories.food.solid} />
              <QuickActionCircle icon="bicycle-outline" label="Activity" tint={Categories.activity.solid} />
            </View>
          </Section>

          <Section title="FlightSegmentRow">
            <View style={styles.card}>
              <FlightSegmentRow
                originCode="SFO"
                originTime="10:45"
                destinationCode="NRT"
                destinationTime="15:20+1"
                durationLabel="11h 35m · Nonstop"
              />
            </View>
          </Section>

          <Section title="GradientScreen (sightseeing)">
            <GradientScreen category="sightseeing" style={styles.gradientPreview}>
              <View style={styles.gradientInner}>
                <Text style={styles.gradientText}>Per-category gradient background</Text>
              </View>
            </GradientScreen>
          </Section>

          <Section title="FrostedSheet">
            <View style={styles.frostedBackdrop}>
              <FrostedSheet style={styles.frostedSheet}>
                <Text style={Typography.h3}>Bottom sheet</Text>
                <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: 4 }]}>
                  BlurView on iOS · frost fallback on Android · drag handle + 28pt radius.
                </Text>
              </FrostedSheet>
            </View>
          </Section>

          <Section title="RingMapOverlay">
            <View style={styles.ringWrap}>
              <RingMapOverlay anchorLabel="You are here" />
            </View>
          </Section>

          <Section title="Motion tokens" description="Durations (ms) and easings used for micro-interactions.">
            {(Object.keys(Motion.duration) as Array<keyof typeof Motion.duration>).map((key) => (
              <View key={key} style={styles.motionRow}>
                <Text style={styles.motionLabel}>{key}</Text>
                <Text style={styles.motionValue}>{Motion.duration[key]}ms</Text>
              </View>
            ))}
            {(Object.keys(Motion.easing) as Array<keyof typeof Motion.easing>).map((key) => (
              <View key={key} style={styles.motionRow}>
                <Text style={styles.motionLabel}>easing.{key}</Text>
                <Text style={styles.motionValue}>{Motion.easing[key]}</Text>
              </View>
            ))}
          </Section>

          <View style={styles.footer}>
            <Text style={styles.footerText}>End of showcase · tokens v2</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingBottom: Spacing.xxl,
  },
  intro: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  introEyebrow: {
    ...Typography.label,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  introTitle: {
    ...Typography.displaySmall,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  introSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  sectionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionBody: {
    marginTop: Spacing.md,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 104,
  },
  swatchChip: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  swatchName: {
    ...Typography.label,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  swatchValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  categoryMeta: {
    flex: 1,
  },
  categoryLabel: {
    ...Typography.bodyStrong,
    color: Colors.text,
  },
  categoryMono: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  categoryPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  categoryPillText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  typographyRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  typographySample: {
    color: Colors.text,
  },
  typographyMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  spacingLabel: {
    ...Typography.label,
    width: 40,
    color: Colors.text,
  },
  spacingBar: {
    height: 10,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xs,
  },
  spacingValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  radiusItem: {
    alignItems: 'center',
    width: 80,
  },
  radiusBlock: {
    width: 64,
    height: 64,
    backgroundColor: Colors.backgroundTinted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  radiusLabel: {
    ...Typography.label,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  radiusValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  shadowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  shadowCard: {
    width: 120,
    height: 80,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowLabel: {
    ...Typography.bodyStrong,
    color: Colors.text,
  },
  glyphRow: {
    marginVertical: Spacing.sm,
  },
  glyphRowLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  glyphRowList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  gradientPreview: {
    height: 160,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradientInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  gradientText: {
    ...Typography.bodyStrong,
    color: '#FFFFFF',
  },
  frostedBackdrop: {
    height: 220,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.primaryLight,
    justifyContent: 'flex-end',
  },
  frostedSheet: {
    paddingBottom: Spacing.lg,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  motionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  motionLabel: {
    ...Typography.label,
    color: Colors.text,
  },
  motionValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
