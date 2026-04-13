import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../constants/theme';
import type { Message } from '../services/conversationsService';

interface AssistantBubbleProps {
  message: Message;
}

export default function AssistantBubble({ message }: AssistantBubbleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Ionicons name="hardware-chip-outline" size={16} color={Colors.primary} />
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 2,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: '#F3F4F6',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },
  text: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.text,
    lineHeight: 22,
  },
});
