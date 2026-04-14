import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryGlyph, normalizeCategory, categoryColor } from './CategoryGlyph';
import { Colors, Radius, Shadows } from '../constants/theme';

type Props = {
  category: string;
  size?: number;
  isSelected?: boolean;
};

/**
 * CategoryPin — a map pin that shows a category-colored circle with an icon,
 * plus a downward-pointing triangle "tail" below the circle.
 */
function CategoryPinBase({ category, size = 36, isSelected = false }: Props) {
  const resolvedSize = isSelected ? size * 1.25 : size;
  const glyphSize = resolvedSize >= 44 ? 44 : resolvedSize >= 36 ? 36 : 28;
  const color = categoryColor(category);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.circle,
          {
            width: resolvedSize,
            height: resolvedSize,
            borderRadius: resolvedSize / 2,
          },
          isSelected && {
            borderWidth: 2.5,
            borderColor: Colors.primary,
          },
          isSelected ? Shadows.lg : Shadows.glyph,
        ]}
      >
        <CategoryGlyph
          category={normalizeCategory(category)}
          size={glyphSize}
          elevated={false}
        />
      </View>
      {/* Triangle pointer tail */}
      <View
        style={[
          styles.pointer,
          { borderTopColor: isSelected ? Colors.primary : color },
        ]}
      />
    </View>
  );
}

export const CategoryPin = memo(CategoryPinBase);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
