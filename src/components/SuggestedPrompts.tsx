import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';

const PROMPTS = [
  'What should I see here?',
  'Am I on budget?',
  'Suggest a restaurant',
  'How many days left?',
  "What's the weather like?",
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Suggested questions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 24,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFF5F2',
  },
  chipText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
