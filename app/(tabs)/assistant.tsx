import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AIOrb } from '../../src/components/AIOrb';
import { useTrips } from '../../src/hooks/useTrips';
import { useConversation } from '../../src/hooks/useConversation';
import type { ChatMessage, TripContext } from '../../src/hooks/useConversation';
import type { Trip } from '../../src/types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

const GENERIC_SUGGESTIONS = [
  'Plan a trip to Tokyo',
  'What to pack for Bali?',
  'Budget for 7 days in Europe',
];

function tripSuggestions(trip: Trip): string[] {
  const name = trip.name;
  return [
    `Plan activities for ${name}`,
    `What should I pack for ${name}?`,
    `Budget tips for ${name}`,
  ];
}

export default function AssistantScreen() {
  const { trips, loading: tripsLoading } = useTrips();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const resolvedTripId = activeTripId ?? trips[0]?.id ?? null;
  const activeTrip = useMemo(
    () => trips.find((t) => t.id === resolvedTripId) ?? null,
    [trips, resolvedTripId],
  );

  const tripContext = useMemo((): TripContext | undefined => {
    if (!activeTrip) return undefined;
    return {
      name: activeTrip.name,
      startDate: activeTrip.start_date,
      endDate: activeTrip.end_date,
      budget: activeTrip.budget,
      countryFlag: activeTrip.country_flag,
    };
  }, [activeTrip]);

  const {
    messages,
    loading: convoLoading,
    isThinking,
    sendMessage,
    clearConversation,
  } = useConversation(resolvedTripId, tripContext);

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const sendScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(sendScale, {
      toValue: input.trim().length > 0 ? 1 : 0,
      useNativeDriver: true,
      damping: 12,
    }).start();
  }, [input, sendScale]);

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length, isThinking]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !resolvedTripId) return;
    haptics.light();
    sendMessage(text);
    setInput('');
  };

  const handleNewChat = () => {
    haptics.medium();
    clearConversation();
    setInput('');
  };

  const showEmpty = messages.length === 0 && !isThinking && !convoLoading;

  const suggestions = useMemo(() => {
    if (activeTrip) return tripSuggestions(activeTrip);
    return GENERIC_SUGGESTIONS;
  }, [activeTrip]);

  const handleSuggestionPress = (text: string) => {
    if (!resolvedTripId) {
      // No trip selected — just populate input
      setInput(text);
      return;
    }
    haptics.light();
    sendMessage(text);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <AIOrb size={32} state="idle" />
        <Text style={styles.headerTitle}>Travel Buddy AI</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          activeOpacity={0.7}
          onPress={handleNewChat}
        >
          <Ionicons name="create-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Trip selector chips */}
      {trips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {trips.map((trip) => {
            const active = trip.id === resolvedTripId;
            return (
              <TouchableOpacity
                key={trip.id}
                activeOpacity={0.85}
                style={[styles.selectorChip, active && styles.selectorChipActive]}
                onPress={() => {
                  haptics.selection();
                  setActiveTripId(trip.id);
                }}
              >
                <Text
                  style={[styles.selectorText, active && styles.selectorTextActive]}
                  numberOfLines={1}
                >
                  {trip.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <KeyboardAvoidingView
        style={styles.kbAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.body}>
            {showEmpty ? (
              <EmptyState
                suggestions={suggestions}
                hasTripSelected={resolvedTripId !== null}
                onSuggestionPress={handleSuggestionPress}
              />
            ) : (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => {
                  const prev = messages[index - 1];
                  const showAvatar = item.role === 'assistant' && prev?.role !== 'assistant';
                  return <ChatBubble message={item} showAvatar={showAvatar} />;
                }}
                ListFooterComponent={isThinking ? <TypingIndicator /> : null}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                resolvedTripId
                  ? 'Ask me anything...'
                  : 'Select a trip to start chatting...'
              }
              placeholderTextColor={Colors.textTertiary}
              style={styles.input}
              multiline
              maxLength={2000}
              editable={resolvedTripId !== null}
            />
            {input.trim().length === 0 && resolvedTripId !== null && (
              <TouchableOpacity activeOpacity={0.7} style={styles.micButton}>
                <Ionicons name="mic-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Animated.View
            style={[
              styles.sendWrap,
              {
                transform: [{ scale: sendScale }],
                opacity: sendScale,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleSend}
              activeOpacity={0.85}
              style={styles.sendButton}
              disabled={input.trim().length === 0 || resolvedTripId === null}
            >
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatBubble({ message, showAvatar }: { message: ChatMessage; showAvatar: boolean }) {
  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.aiRow}>
      <View style={styles.avatarSlot}>{showAvatar && <AIOrb size={24} state="idle" />}</View>
      <View style={styles.aiBubble}>
        <Text style={styles.aiText}>{message.content}</Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 450, useNativeDriver: true }),
        ]),
      );
    const a = animateDot(dot1, 0);
    const b = animateDot(dot2, 150);
    const c = animateDot(dot3, 300);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.aiRow}>
      <View style={styles.avatarSlot}>
        <AIOrb size={24} state="thinking" />
      </View>
      <View style={styles.aiBubble}>
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((v, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: v }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function EmptyState({
  suggestions,
  hasTripSelected,
  onSuggestionPress,
}: {
  suggestions: string[];
  hasTripSelected: boolean;
  onSuggestionPress: (text: string) => void;
}) {
  return (
    <View style={styles.empty}>
      <AIOrb size={64} state="idle" />
      <Text style={styles.emptyTitle}>Travel Buddy AI</Text>
      <Text style={styles.emptySubtitle}>
        {hasTripSelected
          ? 'Ask me about this trip — activities, packing, budgets, and more.'
          : 'Select a trip above to get personalised suggestions, or ask a general question.'}
      </Text>
      <View style={styles.suggestions}>
        {suggestions.map((text) => (
          <TouchableOpacity
            key={text}
            activeOpacity={0.85}
            style={styles.suggestionChip}
            onPress={() => onSuggestionPress(text)}
          >
            <Text style={styles.suggestionText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  kbAvoid: {
    flex: 1,
  },
  body: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  newChatButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Trip selector (matches receipts / plan screens)
  selectorRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    maxWidth: 200,
  },
  selectorChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectorText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },

  // User bubble
  userRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.xs,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    borderBottomRightRadius: Radius.xs,
    maxWidth: '78%',
  },
  userText: {
    ...Typography.body,
    color: '#FFFFFF',
  },

  // AI bubble
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  avatarSlot: {
    width: 24,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xs,
    maxWidth: '82%',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  aiText: {
    ...Typography.body,
    color: Colors.text,
  },

  // Typing
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textTertiary,
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  suggestions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  suggestionChip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  suggestionText: {
    ...Typography.bodyMed,
    color: Colors.text,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
    maxHeight: 104,
  },
  micButton: {
    padding: Spacing.xs,
  },
  sendWrap: {
    width: 36,
    height: 36,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
});
