import { Tabs } from 'expo-router';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Shadows } from '../../src/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
          ...Platform.select({
            ios: {
              shadowColor: Shadows.sm.shadowColor,
              shadowOpacity: Shadows.sm.shadowOpacity,
              shadowRadius: Shadows.sm.shadowRadius,
              shadowOffset: { width: 0, height: -1 },
            },
            android: {
              elevation: Shadows.sm.elevation,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: Shadows.sm.shadowColor,
              shadowOpacity: Shadows.sm.shadowOpacity,
              shadowRadius: Shadows.sm.shadowRadius,
              shadowOffset: Shadows.sm.shadowOffset,
            },
            android: {
              elevation: Shadows.sm.elevation,
            },
          }),
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: Colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => <TabIcon name="list" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <TabIcon name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => <TabIcon name="chatbubbles" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: 'Receipts',
          tabBarIcon: ({ color, size }) => <TabIcon name="document-text" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
