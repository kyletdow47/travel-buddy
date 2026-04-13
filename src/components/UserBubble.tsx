import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
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
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
