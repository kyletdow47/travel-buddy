import { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AIOrb } from '../../src/components/AIOrb';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

const SUGGESTIONS = [
  'Plan a trip to Tokyo',
  'What to pack for Bali?',
  'Budget for 7 days in Europe',
];

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
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
    if (!text) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    // Simulated response — swap with real AI call.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: 'That sounds exciting. Tell me a bit more and I will sketch out an itinerary for you.',
          createdAt: Date.now(),
        },
      ]);
      setIsThinking(false);
    }, 900);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsThinking(false);
  };

  const showEmpty = messages.length === 0 && !isThinking;

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

      <KeyboardAvoidingView
        style={styles.kbAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.body}>
            {showEmpty ? (
              <EmptyState onSuggestionPress={(s) => setInput(s)} />
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
              placeholder="Ask me anything..."
              placeholderTextColor={Colors.textTertiary}
              style={styles.input}
              multiline
              maxLength={2000}
            />
            {input.trim().length === 0 && (
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
              disabled={input.trim().length === 0}
            >
              <Ionicons name="arrow-up" size={18} color={Colors.surface} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatBubble({ message, showAvatar }: { message: Message; showAvatar: boolean }) {
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

function EmptyState({ onSuggestionPress }: { onSuggestionPress: (text: string) => void }) {
  return (
    <View style={styles.empty}>
      <AIOrb size={64} state="idle" />
      <Text style={styles.emptyTitle}>Travel Buddy AI</Text>
      <Text style={styles.emptySubtitle}>
        Ask me about destinations, itineraries, packing lists, budgets…
      </Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((text) => (
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

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
    color: Colors.surface,
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
