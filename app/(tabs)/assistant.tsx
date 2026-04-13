import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AssistantBubble } from '../../src/components/AssistantBubble';
import { UserBubble } from '../../src/components/UserBubble';
import { TypingIndicator } from '../../src/components/TypingIndicator';
import { MessageInput } from '../../src/components/MessageInput';
import { SuggestedPrompts } from '../../src/components/SuggestedPrompts';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { useConversation } from '../../src/hooks/useConversation';
import { getReceipts } from '../../src/services/receiptsService';
import { Colors } from '../../src/constants/theme';
import type { Receipt, Trip } from '../../src/types';
import type { Message } from '../../src/services/conversationsService';

export default function AssistantScreen() {
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const { stops } = useStops(selectedTrip?.id ?? null);
  const { messages, isLoading, sendMessage, clearMessages } = useConversation(
    selectedTrip?.id ?? null
  );
  const listRef = useRef<FlatList<Message>>(null);

  // Auto-select first trip when trips load
  useEffect(() => {
    if (!selectedTrip && trips.length > 0) {
      setSelectedTrip(trips[0]);
    }
  }, [trips, selectedTrip]);

  // Load receipts when trip changes
  useEffect(() => {
    if (!selectedTrip) {
      setReceipts([]);
      return;
    }
    getReceipts(selectedTrip.id)
      .then(setReceipts)
      .catch(() => setReceipts([]));
  }, [selectedTrip]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(
    (text: string) => {
      if (!selectedTrip) return;
      sendMessage(text, selectedTrip, stops, receipts);
    },
    [selectedTrip, stops, receipts, sendMessage]
  );

  const handleClear = () => {
    Alert.alert('Clear Conversation', 'Are you sure you want to clear this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: clearMessages,
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) =>
    item.role === 'user' ? (
      <UserBubble message={item} />
    ) : (
      <AssistantBubble message={item} />
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Travel Buddy AI</Text>
            {selectedTrip && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {selectedTrip.name}
              </Text>
            )}
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Trip selector */}
        {trips.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tripSelector}
            contentContainerStyle={styles.tripSelectorContent}
          >
            {trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripChip,
                  selectedTrip?.id === trip.id && styles.tripChipActive,
                ]}
                onPress={() => setSelectedTrip(trip)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tripChipText,
                    selectedTrip?.id === trip.id && styles.tripChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {trip.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Chat area */}
        <View style={styles.flex}>
          {tripsLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading trips…</Text>
            </View>
          ) : !selectedTrip ? (
            <View style={styles.emptyState}>
              <Ionicons name="airplane-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyStateText}>
                Create a trip to start chatting with your AI assistant
              </Text>
            </View>
          ) : messages.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hardware-chip-outline" size={48} color={Colors.primary} />
              <Text style={styles.emptyTitle}>Travel Buddy AI</Text>
              <Text style={styles.emptySubtitle}>
                Ask me anything about your trip to {selectedTrip.name}
              </Text>
              <SuggestedPrompts onSelect={handleSend} />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.timestamp}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageList}
              ListFooterComponent={isLoading ? <TypingIndicator /> : null}
              onContentSizeChange={() =>
                listRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}
        </View>

        {/* Message input */}
        {selectedTrip && (
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  clearButton: {
    padding: 8,
  },
  tripSelector: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexGrow: 0,
  },
  tripSelectorContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  tripChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 180,
  },
  tripChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tripChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tripChipTextActive: {
    color: '#FFFFFF',
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
});
