import { type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Radius, Spacing, Typography, getCategoryTokens, type CategoryKey } from '../../constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type TintedBannerProps = {
  category: CategoryKey;
  title: string;
  message?: string;
  icon?: IoniconsName;
};

export function TintedBanner({ category, title, message, icon }: TintedBannerProps) {
  const tokens = getCategoryTokens(category);
  const iconName = (icon ?? tokens.icon) as IoniconsName;

  return (
    <View style={[styles.root, { backgroundColor: tokens.tint }]}>
      <View style={[styles.iconWrap, { backgroundColor: tokens.solid }]}>
        <Ionicons name={iconName} size={18} color="#FFFFFF" />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: tokens.onTint }]}>{title}</Text>
        {message ? <Text style={[styles.message, { color: tokens.onTint }]}>{message}</Text> : null}
      </View>
    </View>
  );
}

export type TintedToastProps = TintedBannerProps;

export function TintedToast(props: TintedToastProps) {
  return (
    <View style={styles.toastShadow}>
      <TintedBanner {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    ...Typography.bodyStrong,
  },
  message: {
    ...Typography.caption,
    marginTop: 2,
    opacity: 0.8,
  },
  toastShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
