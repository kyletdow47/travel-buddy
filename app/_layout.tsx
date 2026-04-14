import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Colors } from '../src/constants/theme';
import { tintedToastConfig } from '../src/components/TintedToast';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? Colors.dark.background : Colors.background;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bgColor },
        }}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast config={tintedToastConfig} />
    </SafeAreaProvider>
  );
}
