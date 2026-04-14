import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../../constants/theme';

export type HeroPhotoHeaderProps = {
  title: string;
  subtitle?: string;
  imageUri: string;
  height?: number;
};

export function HeroPhotoHeader({ title, subtitle, imageUri, height = 280 }: HeroPhotoHeaderProps) {
  return (
    <View style={[styles.root, { height }]}>
      <ImageBackground source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.copy}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
  },
  copy: {
    padding: 20,
  },
  title: {
    ...Typography.displayLarge,
    color: '#FFFFFF',
  },
  subtitle: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
});
