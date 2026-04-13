import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import type { Message } from '../services/conversationsService';
import UserBubble from './UserBubble';
import AssistantBubble from './AssistantBubble';

interface ChatBubbleListProps {
  messages: Message[];
}

function renderMessage({ item }: { item: Message }) {
  if (item.role === 'user') {
    return <UserBubble message={item} />;
  }
  return <AssistantBubble message={item} />;
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤖</Text>
      <Text style={styles.emptyTitle}>Travel Buddy AI</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything about your trip — planning tips, budget advice, or local recommendations.
      </Text>
    </View>
  );
}

export default function ChatBubbleList({ messages }: ChatBubbleListProps) {
  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.timestamp}
      inverted
      contentContainerStyle={[
        styles.list,
        messages.length === 0 && styles.listEmpty,
      ]}
      ListEmptyComponent={EmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: Spacing.sm,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    // Inverted FlatList flips content, so we flip it back for empty state
    transform: [{ scaleY: -1 }],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
