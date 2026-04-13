import { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { useConversation } from '../../src/hooks/useConversation';
import type { Message } from '../../src/services/conversationsService';
import UserBubble from '../../src/components/UserBubble';
import AssistantBubble from '../../src/components/AssistantBubble';
import MessageInput from '../../src/components/MessageInput';
import TypingIndicator from '../../src/components/TypingIndicator';
import SuggestedPrompts from '../../src/components/SuggestedPrompts';

export default function AssistantScreen() {
  const {
    messages,
    isLoading,
    isFetching,
    error,
    activeTrip,
    trips,
    sendMessage,
    clearConversation,
    selectTrip,
  } = useConversation();

  const flatListRef = useRef<FlatList<Message>>(null);

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text);
    },
    [sendMessage]
  );

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearConversation(),
        },
      ]
    );
  }, [clearConversation]);

  const handleTripSwitch = useCallback(() => {
    if (trips.length <= 1) return;
    const options = trips.map((t) => t.name);
    Alert.alert('Select Trip', 'Choose a trip for the assistant', [
      ...options.map((name, i) => ({
        text: name + (trips[i].id === activeTrip?.id ? ' (current)' : ''),
        onPress: () => selectTrip(trips[i].id),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }, [trips, activeTrip, selectTrip]);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    if (item.role === 'user') return <UserBubble message={item} />;
    return <AssistantBubble message={item} />;
  }, []);

  const keyExtractor = useCallback(
    (item: Message) => item.timestamp,
    []
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleTripSwitch}
            disabled={trips.length <= 1}
            activeOpacity={0.7}
          >
            <Text style={styles.headerTitle}>Travel Buddy AI</Text>
            {activeTrip && (
              <Text style={styles.headerSubtitle}>
                {activeTrip.name}
                {trips.length > 1 ? ' \u25BE' : ''}
              </Text>
            )}
          </TouchableOpacity>
          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {isFetching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : !activeTrip ? (
          <View style={styles.centerContainer}>
            <Ionicons name="airplane-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              Create a trip to start chatting with your travel buddy!
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={[
                styles.messageList,
                messages.length === 0 && styles.messageListEmpty,
              ]}
              inverted={messages.length > 0}
              ListHeaderComponent={
                isLoading ? <TypingIndicator /> : null
              }
              ListEmptyComponent={
                <View style={styles.emptyChat}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={64}
                    color={Colors.border}
                  />
                  <Text style={styles.emptyChatTitle}>
                    Hi! I&apos;m your travel buddy
                  </Text>
                  <Text style={styles.emptyChatSubtitle}>
                    Ask me anything about your trip to{' '}
                    {activeTrip.name}
                  </Text>
                  <SuggestedPrompts onSelect={handleSend} />
                </View>
              }
            />
            {messages.length > 0 && (
              <SuggestedPrompts onSelect={handleSend} />
            )}
          </>
        )}

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input */}
        {activeTrip && !isFetching && (
          <MessageInput onSend={handleSend} isLoading={isLoading} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  messageList: {
    paddingVertical: Spacing.sm,
  },
  messageListEmpty: {
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    // Inverted FlatList flips content, so we need to flip back
    transform: [{ scaleY: -1 }],
  },
  emptyChatTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyChatSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.caption.fontSize,
    textAlign: 'center',
  },
});
