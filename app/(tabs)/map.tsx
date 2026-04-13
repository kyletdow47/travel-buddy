import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDarkColors } from '../../src/hooks/useDarkColors';
import { EmptyState } from '../../src/components/EmptyState';

export default function MapScreen() {
  const colors = useDarkColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <EmptyState
        icon="map"
        title="No locations on map"
        subtitle="Add stops with coordinates to see them here"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
