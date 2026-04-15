import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GradientScreen } from '../src/components/GradientScreen';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/constants/theme';
import { haptics } from '../src/lib/haptics';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type FeatureRow = {
  icon: IoniconsName;
  label: string;
  free: boolean | string;
  pro: boolean | string;
};

const FEATURES: FeatureRow[] = [
  { icon: 'airplane-outline', label: 'Trip Planning', free: true, pro: true },
  { icon: 'map-outline', label: 'Interactive Maps', free: true, pro: true },
  { icon: 'receipt-outline', label: 'Receipt Tracking', free: '5 / trip', pro: 'Unlimited' },
  { icon: 'chatbubbles-outline', label: 'AI Assistant', free: '10 msgs / day', pro: 'Unlimited' },
  { icon: 'cloud-upload-outline', label: 'Cloud Backup', free: false, pro: true },
  { icon: 'people-outline', label: 'Trip Sharing', free: false, pro: true },
  { icon: 'analytics-outline', label: 'Spending Analytics', free: false, pro: true },
  { icon: 'download-outline', label: 'Data Export', free: false, pro: true },
];

export default function PaywallScreen() {
  const router = useRouter();

  const handleSubscribe = () => {
    haptics.success();
    // Placeholder: no actual IAP
    router.back();
  };

  const handleRestore = () => {
    haptics.light();
    // Placeholder: no actual restore
  };

  return (
    <GradientScreen
      colors={[Colors.background, '#1A0B2A', '#2A1040']}
      safeArea
      contentStyle={styles.container}
    >
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        activeOpacity={0.7}
        onPress={() => {
          haptics.light();
          router.back();
        }}
      >
        <Ionicons name="close" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={20} color={Colors.primary} />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock Travel Buddy Pro</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited AI messages, cloud backup, trip sharing, and premium analytics.
          </Text>
        </View>

        {/* Feature comparison */}
        <View style={styles.comparisonCard}>
          {/* Header row */}
          <View style={styles.comparisonHeader}>
            <View style={styles.featureLabelCol} />
            <View style={styles.planCol}>
              <Text style={styles.planHeaderText}>Free</Text>
            </View>
            <View style={styles.planCol}>
              <Text style={[styles.planHeaderText, styles.planHeaderPro]}>Pro</Text>
            </View>
          </View>

          {/* Feature rows */}
          {FEATURES.map((feature, index) => (
            <View key={feature.label}>
              {index > 0 && <View style={styles.featureDivider} />}
              <View style={styles.featureRow}>
                <View style={styles.featureLabelCol}>
                  <Ionicons name={feature.icon} size={18} color={Colors.textSecondary} />
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
                <View style={styles.planCol}>
                  <FeatureValue value={feature.free} />
                </View>
                <View style={styles.planCol}>
                  <FeatureValue value={feature.pro} isPro />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}> / month</Text>
          </View>
          <Text style={styles.priceNote}>or $39.99 / year (save 33%)</Text>
        </View>

        {/* Subscribe button */}
        <TouchableOpacity
          style={styles.subscribeButton}
          activeOpacity={0.85}
          onPress={handleSubscribe}
        >
          <Ionicons name="diamond" size={20} color="#FFFFFF" />
          <Text style={styles.subscribeButtonText}>Subscribe to Pro</Text>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreButton}
          activeOpacity={0.7}
          onPress={handleRestore}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legalText}>
          Payment will be charged to your Apple ID account at confirmation of purchase.
          Subscription automatically renews unless it is canceled at least 24 hours before the
          end of the current period. Your account will be charged for renewal within 24 hours
          prior to the end of the current period.
        </Text>
      </ScrollView>
    </GradientScreen>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FeatureValue({ value, isPro }: { value: boolean | string; isPro?: boolean }) {
  if (typeof value === 'string') {
    return (
      <Text style={[styles.featureValueText, isPro ? styles.featureValuePro : undefined]}>
        {value}
      </Text>
    );
  }
  if (value) {
    return (
      <Ionicons
        name="checkmark-circle"
        size={20}
        color={isPro ? Colors.primary : Colors.success}
      />
    );
  }
  return <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.2)" />;
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(79,140,255,0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.3)',
  },
  proBadgeText: {
    ...Typography.eyebrow,
    color: Colors.primary,
  },
  heroTitle: {
    ...Typography.displaySm,
    color: Colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },

  // Comparison card
  comparisonCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  featureLabelCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  planCol: {
    width: 72,
    alignItems: 'center',
  },
  planHeaderText: {
    ...Typography.micro,
    color: Colors.textTertiary,
  },
  planHeaderPro: {
    color: Colors.primary,
    fontWeight: '800',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  featureLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  featureValueText: {
    ...Typography.micro,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  featureValuePro: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Pricing
  pricingSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    ...Typography.display,
    color: Colors.text,
  },
  pricePeriod: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  priceNote: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // Buttons
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.full,
    ...Shadows.md,
  },
  subscribeButtonText: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  restoreButtonText: {
    ...Typography.bodyMed,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
  },

  // Legal
  legalText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
});
