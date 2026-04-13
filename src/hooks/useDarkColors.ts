import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  success: string;
  warning: string;
  error: string;
}

export function useDarkColors(): ThemeColors {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    background: isDark ? Colors.dark.background : Colors.background,
    backgroundSecondary: isDark ? Colors.dark.backgroundSecondary : Colors.backgroundSecondary,
    text: isDark ? Colors.dark.text : Colors.text,
    textSecondary: isDark ? Colors.dark.textSecondary : Colors.textSecondary,
    border: isDark ? Colors.dark.border : Colors.border,
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
  };
}
