import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import type { Message } from '../services/conversationsService';

interface Props {
  message: Message;
}

export function AssistantBubble({ message }: Props) {
  return (
    <View style={styles.container}>
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
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  bubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '75%',
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
});
