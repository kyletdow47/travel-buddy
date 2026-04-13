import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import type { Message } from '../services/conversationsService';

interface UserBubbleProps {
  message: Message;
}

export default function UserBubble({ message }: UserBubbleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    lineHeight: 22,
  },
});
