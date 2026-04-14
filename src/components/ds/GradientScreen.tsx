import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoryTokens, Colors, type CategoryKey } from '../../constants/theme';

export type GradientScreenProps = {
  category?: CategoryKey;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GradientScreen({ category, children, style }: GradientScreenProps) {
  const tokens = category ? getCategoryTokens(category) : null;
  const [from, to] = tokens?.gradient ?? [Colors.backgroundTinted, Colors.background];

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
