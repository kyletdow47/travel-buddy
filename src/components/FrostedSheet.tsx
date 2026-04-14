import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  PanResponder,
  ViewStyle,
  StyleProp,
  AccessibilityInfo,
} from 'react-native';
import { Colors, Radius, Spacing, Shadows, Sheet } from '../constants/theme';

// Defensive require for expo-blur — if the native module isn't installed we
// fall back to a solid frosted fill so the sheet still renders correctly.
type BlurViewComponent = React.ComponentType<{
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}>;

let BlurView: BlurViewComponent | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  BlurView = require('expo-blur').BlurView ?? null;
} catch {
  BlurView = null;
}

export type FrostedSheetTint = 'dark' | 'light';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max fraction of the screen height the sheet can occupy (0–1). Default 0.85. */
  maxHeightRatio?: number;
  /** Minimum content height for the sheet (used when children are short). */
  minHeight?: number;
  /** Tint of the frosted material. */
  tint?: FrostedSheetTint;
  /** Hide the drag handle if the sheet isn't dismissible by drag. */
  showHandle?: boolean;
  /** Disable drag-to-dismiss. Defaults to true. */
  dragToDismiss?: boolean;
  /** Tap on backdrop closes. Defaults to true. */
  tapBackdropToClose?: boolean;
  /** Optional additional style for the sheet container. */
  sheetStyle?: StyleProp<ViewStyle>;
  /** Optional style for the inner content wrapper. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Override backdrop opacity (0–1). */
  backdropOpacity?: number;
  /** Fires when drag beyond threshold triggers dismiss (before onClose). */
  onDismissByDrag?: () => void;
  /** Accessibility label for the sheet. */
  accessibilityLabel?: string;
};

const SCREEN_H = Dimensions.get('window').height;
const DISMISS_VELOCITY = 1.2; // px/ms
const DISMISS_FRACTION = 0.4; // fraction of sheet height

export function FrostedSheet({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.85,
  minHeight = 180,
  tint = 'dark',
  showHandle = true,
  dragToDismiss = true,
  tapBackdropToClose = true,
  sheetStyle,
  contentStyle,
  backdropOpacity,
  onDismissByDrag,
  accessibilityLabel,
}: Props) {
  const maxSheetH = Math.max(minHeight, SCREEN_H * maxHeightRatio);
  const translateY = useRef(new Animated.Value(maxSheetH)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const dragStart = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => {
        reducedMotionRef.current = !!enabled;
      })
      .catch(() => undefined);
  }, []);

  const openSheet = useCallback(() => {
    if (reducedMotionRef.current) {
      translateY.setValue(0);
      backdrop.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.9,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdrop]);

  const closeSheet = useCallback(
    (byDrag = false) => {
      if (byDrag) onDismissByDrag?.();
      if (reducedMotionRef.current) {
        translateY.setValue(maxSheetH);
        backdrop.setValue(0);
        onClose();
        return;
      }
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: maxSheetH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    },
    [translateY, backdrop, maxSheetH, onClose, onDismissByDrag],
  );

  useEffect(() => {
    if (visible) openSheet();
  }, [visible, openSheet]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          dragToDismiss && Math.abs(gesture.dy) > 4 && gesture.dy > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          dragStart.current = 0;
          translateY.extractOffset();
        },
        onPanResponderMove: (_evt, gesture) => {
          // Only allow dragging down.
          if (gesture.dy < 0) return;
          translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_evt, gesture) => {
          translateY.flattenOffset();
          const dragged = gesture.dy;
          const velocity = gesture.vy;
          const pastThreshold =
            dragged > maxSheetH * DISMISS_FRACTION || velocity > DISMISS_VELOCITY;
          if (pastThreshold) {
            closeSheet(true);
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 22,
              stiffness: 220,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          translateY.flattenOffset();
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 22,
            stiffness: 220,
          }).start();
        },
      }),
    [translateY, maxSheetH, closeSheet, dragToDismiss],
  );

  const handleBackdropPress = useCallback(() => {
    if (tapBackdropToClose) closeSheet(false);
  }, [tapBackdropToClose, closeSheet]);

  const effectiveBackdropOpacity = backdropOpacity ?? Sheet.backdropOpacity;

  const sheetFill = tint === 'dark' ? Colors.frostedDark : Colors.frostedLight;
  const handleColor = tint === 'dark' ? Sheet.handleColor : Sheet.handleColorOnLight;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => closeSheet(false)}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backdrop,
              {
                opacity: backdrop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, effectiveBackdropOpacity],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="none"
          style={[
            styles.sheet,
            { maxHeight: maxSheetH, transform: [{ translateY }] },
            sheetStyle,
          ]}
          {...(dragToDismiss ? panResponder.panHandlers : {})}
        >
          {/* Blur / frosted fill */}
          {BlurView ? (
            <BlurView
              intensity={Platform.OS === 'ios' ? 60 : 90}
              tint={tint === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: sheetFill }]} />
          )}
          {/* Subtle tint overlay above blur for Tripsy-matching darkness */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor:
                  tint === 'dark'
                    ? 'rgba(10,10,14,0.28)'
                    : 'rgba(255,255,255,0.20)',
              },
            ]}
          />

          {/* Drag handle */}
          {showHandle && (
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: handleColor,
                  width: Sheet.handleWidth,
                  height: Sheet.handleHeight,
                },
              ]}
            />
          )}

          {/* Content */}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Sheet.topRadius,
    borderTopRightRadius: Sheet.topRadius,
    overflow: 'hidden',
    ...Shadows.sheet,
  },
  handle: {
    alignSelf: 'center',
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
});
