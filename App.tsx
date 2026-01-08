import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import {
  ArrowLeftRight,
  Tag,
  ChefHat,
  Banknote,
  LayoutGrid
} from 'lucide-react-native';

// Import screens
import { ConverterScreen } from './src/screens/ConverterScreen';
import { SizesScreen } from './src/screens/SizesScreen';
import { KitchenScreen } from './src/screens/KitchenScreen';
import { CurrencyScreen } from './src/screens/CurrencyScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';

import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card, // #0f0f0f per UI_SPEC.md
          borderTopColor: colors.subtle,
          borderTopWidth: 0.5,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
          height: 70 + Math.max(insets.bottom, 16),
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ color }) => {
          const iconProps = { color, size: 24, strokeWidth: 2 };

          switch (route.name) {
            case 'Convert':
              return <ArrowLeftRight {...iconProps} />;
            case 'Sizes':
              return <Tag {...iconProps} />;
            case 'Kitchen':
              return <ChefHat {...iconProps} />;
            case 'Currency':
              return <Banknote {...iconProps} />;
            case 'Tools':
              return <LayoutGrid {...iconProps} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Convert" component={ConverterScreen} />
      <Tab.Screen name="Sizes" component={SizesScreen} />
      <Tab.Screen name="Kitchen" component={KitchenScreen} />
      <Tab.Screen name="Currency" component={CurrencyScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.accent,
              background: colors.main,
              card: colors.card, // #0f0f0f for tab bar
              text: colors.primary,
              border: colors.subtle,
              notification: colors.accent,
            },
            fonts: {
              regular: { fontFamily: 'monospace', fontWeight: '400' },
              medium: { fontFamily: 'monospace', fontWeight: '500' },
              bold: { fontFamily: 'monospace', fontWeight: '700' },
              heavy: { fontFamily: 'monospace', fontWeight: '900' },
            },
          }}
        >
          <TabNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
