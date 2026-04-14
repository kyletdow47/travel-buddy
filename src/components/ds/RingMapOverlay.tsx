import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

export type RingMapOverlayProps = {
  size?: number;
  rings?: readonly { radiusFraction: number; label: string }[];
  anchorLabel?: string;
};

const DEFAULT_RINGS = [
  { radiusFraction: 0.33, label: '1 mi' },
  { radiusFraction: 0.66, label: '3 mi' },
  { radiusFraction: 1, label: '5 mi' },
] as const;

export function RingMapOverlay({
  size = 240,
  rings = DEFAULT_RINGS,
  anchorLabel,
}: RingMapOverlayProps) {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {rings.map((ring, index) => {
        const dim = size * ring.radiusFraction;
        return (
          <View
            key={`${ring.label}-${index}`}
            pointerEvents="none"
            style={[
              styles.ring,
              {
                width: dim,
                height: dim,
                borderRadius: dim / 2,
                marginLeft: -dim / 2,
                marginTop: -dim / 2,
              },
            ]}
          >
            <Text style={styles.ringLabel}>{ring.label}</Text>
          </View>
        );
      })}
      <View style={styles.anchor}>
        <View style={styles.anchorDot} />
        {anchorLabel ? <Text style={styles.anchorLabel}>{anchorLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderWidth: 1,
    borderColor: 'rgba(232,101,64,0.4)',
    backgroundColor: 'rgba(232,101,64,0.06)',
    alignItems: 'center',
  },
  ringLabel: {
    ...Typography.caption,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  anchor: {
    alignItems: 'center',
  },
  anchorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  anchorLabel: {
    ...Typography.caption,
    color: Colors.text,
    marginTop: 4,
    fontWeight: '600',
  },
});
