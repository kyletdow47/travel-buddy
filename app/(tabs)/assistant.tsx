import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import ChatBubbleList from '../../src/components/ChatBubbleList';
import type { Message } from '../../src/services/conversationsService';

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const activeTripName: string | null = null; // Will be wired to trip context later

  const handleClearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // Reverse messages for inverted FlatList (newest at bottom)
  const invertedMessages = [...messages].reverse();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Travel Buddy AI</Text>
          {activeTripName ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {activeTripName}
            </Text>
          ) : (
            <Text style={styles.headerSubtitle}>No active trip</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleClearConversation}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.chatContainer}>
        <ChatBubbleList messages={invertedMessages} />
      </View>

      {/* Input bar will be added in a later task */}
      <View style={styles.inputPlaceholder}>
        <Text style={styles.inputPlaceholderText}>
          Message input coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  chatContainer: {
    flex: 1,
  },
  inputPlaceholder: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  inputPlaceholderText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
  },
});
