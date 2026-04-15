import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GradientScreen } from '../src/components/GradientScreen';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/constants/theme';
import { haptics } from '../src/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingPage = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  gradientColors: readonly string[];
};

const PAGES: OnboardingPage[] = [
  {
    icon: 'map',
    iconColor: '#3AA4FF',
    title: 'Plan Your Adventures',
    subtitle:
      'Organize every trip with stops, maps, and day-by-day itineraries. From weekend getaways to world tours.',
    gradientColors: ['#0B1E3A', '#1A3A6A', '#0F2848'],
  },
  {
    icon: 'receipt',
    iconColor: '#F2994A',
    title: 'Track Every Detail',
    subtitle:
      'Log receipts, manage budgets, and keep a clear picture of your travel spending in real time.',
    gradientColors: ['#2A1A0B', '#4A2A10', '#3A1E0A'],
  },
  {
    icon: 'sparkles',
    iconColor: '#C94FBF',
    title: 'AI Travel Buddy',
    subtitle:
      'Your personal travel assistant powered by AI. Get recommendations, alerts, and smart suggestions on the go.',
    gradientColors: ['#1A0B2A', '#3A1E4A', '#2A0F3A'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activePage, setActivePage] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== activePage) {
      setActivePage(page);
      haptics.selection();
    }
  };

  const handleGetStarted = () => {
    haptics.success();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (activePage < PAGES.length - 1) {
      haptics.light();
      const nextPage = activePage + 1;
      scrollRef.current?.scrollTo({ x: nextPage * SCREEN_WIDTH, animated: true });
    }
  };

  const isLastPage = activePage === PAGES.length - 1;

  return (
    <GradientScreen
      colors={PAGES[activePage].gradientColors}
      safeArea
      contentStyle={styles.container}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {PAGES.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.pageContent}>
              {/* Icon circle */}
              <View style={[styles.iconCircle, { backgroundColor: `${page.iconColor}20` }]}>
                <Ionicons name={page.icon} size={64} color={page.iconColor} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{page.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{page.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Page dots */}
        <View style={styles.dotsRow}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activePage ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        {isLastPage ? (
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.7}
              onPress={handleGetStarted}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.85}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  pageContent: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.displaySm,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.full,
    ...Shadows.md,
  },
  ctaButtonText: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  skipButtonText: {
    ...Typography.bodyMed,
    color: Colors.textTertiary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  nextButtonText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
