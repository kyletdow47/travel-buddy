import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import type { Message } from '../services/conversationsService';

interface Props {
  message: Message;
}

export function UserBubble({ message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  bubble: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '75%',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
});
