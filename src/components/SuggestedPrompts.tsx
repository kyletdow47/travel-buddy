import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

const PROMPTS = [
  'What should I see here?',
  'Am I on budget?',
  'Suggest a restaurant',
  'How many days left?',
  "What's the weather like?",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {PROMPTS.map((prompt) => (
        <TouchableOpacity
          key={prompt}
          style={styles.chip}
          onPress={() => onSelect(prompt)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{prompt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.text,
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
  },
});
