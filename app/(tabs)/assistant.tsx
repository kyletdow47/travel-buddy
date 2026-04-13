import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.text,
  },
});
