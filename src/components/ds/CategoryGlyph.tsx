import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getCategoryTokens, type CategoryKey } from '../../constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type CategoryGlyphSize = 28 | 36 | 44;

export type CategoryGlyphProps = {
  category: CategoryKey;
  size?: CategoryGlyphSize;
};

export function CategoryGlyph({ category, size = 36 }: CategoryGlyphProps) {
  const tokens = getCategoryTokens(category);
  const iconSize = Math.round(size * 0.55);

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.solid,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`${tokens.label} category`}
    >
      <Ionicons name={tokens.icon as IoniconsName} size={iconSize} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
